#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";
import {
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { diffLines, createTwoFilesPatch } from "diff";
import { minimatch } from "minimatch";

// Command line argument parsing
const args = process.argv.slice(2);
if (args.length === 0) {
	console.error(
		"Usage: mcp-server-filesystem <allowed-directory> [additional-directories...]"
	);
	process.exit(1);
}

// Normalize all paths consistently
function normalizePath(p: string): string {
	return path.normalize(p);
}

function expandHome(filepath: string): string {
	if (filepath.startsWith("~/") || filepath === "~") {
		return path.join(os.homedir(), filepath.slice(1));
	}
	return filepath;
}

// Store allowed directories in normalized form
const allowedDirectories = args.map((dir) =>
	normalizePath(path.resolve(expandHome(dir)))
);

// Validate that all directories exist and are accessible
await Promise.all(
	args.map(async (dir) => {
		try {
			const stats = await fs.stat(expandHome(dir));
			if (!stats.isDirectory()) {
				console.error(`Error: ${dir} is not a directory`);
				process.exit(1);
			}
		} catch (error) {
			console.error(`Error accessing directory ${dir}:`, error);
			process.exit(1);
		}
	})
);

// Security utilities
async function validatePath(requestedPath: string): Promise<string> {
	const expandedPath = expandHome(requestedPath);
	const absolute = path.isAbsolute(expandedPath)
		? path.resolve(expandedPath)
		: path.resolve(process.cwd(), expandedPath);

	const normalizedRequested = normalizePath(absolute);

	// Check if path is within allowed directories
	const isAllowed = allowedDirectories.some((dir) =>
		normalizedRequested.startsWith(dir)
	);
	if (!isAllowed) {
		throw new Error(
			`Access denied - path outside allowed directories: ${absolute} not in ${allowedDirectories.join(
				", "
			)}`
		);
	}

	// Handle symlinks by checking their real path
	try {
		const realPath = await fs.realpath(absolute);
		const normalizedReal = normalizePath(realPath);
		const isRealPathAllowed = allowedDirectories.some((dir) =>
			normalizedReal.startsWith(dir)
		);
		if (!isRealPathAllowed) {
			throw new Error(
				"Access denied - symlink target outside allowed directories"
			);
		}
		return realPath;
	} catch (error) {
		// For new files that don't exist yet, verify parent directory
		const parentDir = path.dirname(absolute);
		try {
			const realParentPath = await fs.realpath(parentDir);
			const normalizedParent = normalizePath(realParentPath);
			const isParentAllowed = allowedDirectories.some((dir) =>
				normalizedParent.startsWith(dir)
			);
			if (!isParentAllowed) {
				throw new Error(
					"Access denied - parent directory outside allowed directories"
				);
			}
			return absolute;
		} catch {
			throw new Error(`Parent directory does not exist: ${parentDir}`);
		}
	}
}

// Schema definitions
const ReadFileArgsSchema = z.object({
	path: z.string(),
});

const ReadMultipleFilesArgsSchema = z.object({
	paths: z.array(z.string()),
});

const WriteFileArgsSchema = z.object({
	path: z.string(),
	content: z.string(),
});

const EditOperation = z.object({
	oldText: z.string().describe("Text to search for - must match exactly"),
	newText: z.string().describe("Text to replace with"),
});

const EditFileArgsSchema = z.object({
	path: z.string(),
	edits: z.array(EditOperation),
	dryRun: z
		.boolean()
		.default(false)
		.describe("Preview changes using git-style diff format"),
});

const CreateDirectoryArgsSchema = z.object({
	path: z.string(),
});

const ListDirectoryArgsSchema = z.object({
	path: z.string(),
});

const DirectoryTreeArgsSchema = z.object({
	path: z.string(),
});

const MoveFileArgsSchema = z.object({
	source: z.string(),
	destination: z.string(),
});

const SearchFilesArgsSchema = z.object({
	path: z.string(),
	pattern: z.string(),
	excludePatterns: z.array(z.string()).optional().default([]),
});

const GetFileInfoArgsSchema = z.object({
	path: z.string(),
});

const ToolInputSchema = ToolSchema.shape.inputSchema;
type ToolInput = z.infer<typeof ToolInputSchema>;

interface FileInfo {
	size: number;
	created: Date;
	modified: Date;
	accessed: Date;
	isDirectory: boolean;
	isFile: boolean;
	permissions: string;
}

// Server setup
const server = new Server(
	{
		name: "secure-filesystem-server",
		version: "0.2.0",
	},
	{
		capabilities: {
			tools: {},
		},
	}
);

// Tool implementations
async function getFileStats(filePath: string): Promise<FileInfo> {
	const stats = await fs.stat(filePath);
	return {
		size: stats.size,
		created: stats.birthtime,
		modified: stats.mtime,
		accessed: stats.atime,
		isDirectory: stats.isDirectory(),
		isFile: stats.isFile(),
		permissions: stats.mode.toString(8).slice(-3),
	};
}

async function searchFiles(
	rootPath: string,
	pattern: string,
	excludePatterns: string[] = []
): Promise<string[]> {
	const results: string[] = [];

	async function search(currentPath: string) {
		const entries = await fs.readdir(currentPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = path.join(currentPath, entry.name);

			try {
				// Validate each path before processing
				await validatePath(fullPath);

				// Check if path matches any exclude pattern
				const relativePath = path.relative(rootPath, fullPath);
				const shouldExclude = excludePatterns.some((pattern) => {
					const globPattern = pattern.includes("*")
						? pattern
						: `**/${pattern}/**`;
					return minimatch(relativePath, globPattern, { dot: true });
				});

				if (shouldExclude) {
					continue;
				}

				if (entry.name.toLowerCase().includes(pattern.toLowerCase())) {
					results.push(fullPath);
				}

				if (entry.isDirectory()) {
					await search(fullPath);
				}
			} catch (error) {
				// Skip invalid paths during search
				continue;
			}
		}
	}

	await search(rootPath);
	return results;
}

// file editing and diffing utilities
function normalizeLineEndings(text: string): string {
	return text.replace(/\r\n/g, "\n");
}

function createUnifiedDiff(
	originalContent: string,
	newContent: string,
	filepath: string = "file"
): string {
	// Ensure consistent line endings for diff
	const normalizedOriginal = normalizeLineEndings(originalContent);
	const normalizedNew = normalizeLineEndings(newContent);

	return createTwoFilesPatch(
		filepath,
		filepath,
		normalizedOriginal,
		normalizedNew,
		"original",
		"modified"
	);
}

async function applyFileEdits(
	filePath: string,
	edits: Array<{ oldText: string; newText: string }>,
	dryRun = false
): Promise<string> {
	// Read file content and normalize line endings
	const content = normalizeLineEndings(await fs.readFile(filePath, "utf-8"));

	// Apply edits sequentially
	let modifiedContent = content;
	for (const edit of edits) {
		const normalizedOld = normalizeLineEndings(edit.oldText);
		const normalizedNew = normalizeLineEndings(edit.newText);

		// If exact match exists, use it
		if (modifiedContent.includes(normalizedOld)) {
			modifiedContent = modifiedContent.replace(normalizedOld, normalizedNew);
			continue;
		}

		// Otherwise, try line-by-line matching with flexibility for whitespace
		const oldLines = normalizedOld.split("\n");
		const contentLines = modifiedContent.split("\n");
		let matchFound = false;

		for (let i = 0; i <= contentLines.length - oldLines.length; i++) {
			const potentialMatch = contentLines.slice(i, i + oldLines.length);

			// Compare lines with normalized whitespace
			const isMatch = oldLines.every((oldLine, j) => {
				const contentLine = potentialMatch[j];
				return oldLine.trim() === contentLine.trim();
			});

			if (isMatch) {
				// Preserve original indentation of first line
				const originalIndent = contentLines[i].match(/^\s*/)?.[0] || "";
				const newLines = normalizedNew.split("\n").map((line, j) => {
					if (j === 0) return originalIndent + line.trimStart();
					// For subsequent lines, try to preserve relative indentation
					const oldIndent = oldLines[j]?.match(/^\s*/)?.[0] || "";
					const newIndent = line.match(/^\s*/)?.[0] || "";
					if (oldIndent && newIndent) {
						const relativeIndent = newIndent.length - oldIndent.length;
						return (
							originalIndent +
							" ".repeat(Math.max(0, relativeIndent)) +
							line.trimStart()
						);
					}
					return line;
				});

				contentLines.splice(i, oldLines.length, ...newLines);
				modifiedContent = contentLines.join("\n");
				matchFound = true;
				break;
			}
		}

		if (!matchFound) {
			throw new Error(`Could not find exact match for edit:\n${edit.oldText}`);
		}
	}

	// Create unified diff
	const diff = createUnifiedDiff(content, modifiedContent, filePath);

	// Format diff with appropriate number of backticks
	let numBackticks = 3;
	while (diff.includes("`".repeat(numBackticks))) {
		numBackticks++;
	}
	const formattedDiff = `${"`".repeat(numBackticks)}diff\n${diff}${"`".repeat(
		numBackticks
	)}\n\n`;

	if (!dryRun) {
		await fs.writeFile(filePath, modifiedContent, "utf-8");
	}

	return formattedDiff;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
	return {
		tools: [
			{
				name: "read_file",
				description: "Read the contents of a file",
				parameters: zodToJsonSchema(ReadFileArgsSchema),
			},
			{
				name: "read_multiple_files",
				description: "Read the contents of multiple files",
				parameters: zodToJsonSchema(ReadMultipleFilesArgsSchema),
			},
			{
				name: "write_file",
				description: "Write content to a file",
				parameters: zodToJsonSchema(WriteFileArgsSchema),
			},
			{
				name: "edit_file",
				description: "Edit a file by replacing text",
				parameters: zodToJsonSchema(EditFileArgsSchema),
			},
			{
				name: "create_directory",
				description: "Create a new directory",
				parameters: zodToJsonSchema(CreateDirectoryArgsSchema),
			},
			{
				name: "list_directory",
				description: "List the contents of a directory",
				parameters: zodToJsonSchema(ListDirectoryArgsSchema),
			},
			{
				name: "directory_tree",
				description: "Get a tree representation of a directory",
				parameters: zodToJsonSchema(DirectoryTreeArgsSchema),
			},
			{
				name: "move_file",
				description: "Move or rename a file",
				parameters: zodToJsonSchema(MoveFileArgsSchema),
			},
			{
				name: "search_files",
				description: "Search for files matching a pattern",
				parameters: zodToJsonSchema(SearchFilesArgsSchema),
			},
			{
				name: "get_file_info",
				description: "Get information about a file",
				parameters: zodToJsonSchema(GetFileInfoArgsSchema),
			},
		],
	};
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
	const { name, parameters } = request.params;

	try {
		switch (name) {
			case "read_file": {
				const { path: filePath } = ReadFileArgsSchema.parse(parameters);
				const validatedPath = await validatePath(filePath);
				const content = await fs.readFile(validatedPath, "utf8");
				return {
					content: [{ type: "text", text: content }],
				};
			}

			case "read_multiple_files": {
				const { paths } = ReadMultipleFilesArgsSchema.parse(parameters);
				const validatedPaths = await Promise.all(
					paths.map((p) => validatePath(p))
				);
				const contents = await Promise.all(
					validatedPaths.map((p) => fs.readFile(p, "utf8"))
				);
				return {
					content: [
						{
							type: "text",
							text: JSON.stringify(
								contents.map((content, i) => ({
									path: paths[i],
									content,
								})),
								null,
								2
							),
						},
					],
				};
			}

			case "write_file": {
				const { path: filePath, content } =
					WriteFileArgsSchema.parse(parameters);
				const validatedPath = await validatePath(filePath);
				await fs.writeFile(validatedPath, content);
				return {
					content: [{ type: "text", text: "File written successfully" }],
				};
			}

			case "edit_file": {
				const {
					path: filePath,
					edits,
					dryRun,
				} = EditFileArgsSchema.parse(parameters);
				const validatedPath = await validatePath(filePath);
				const result = await applyFileEdits(validatedPath, edits, dryRun);
				return {
					content: [{ type: "text", text: result }],
				};
			}

			case "create_directory": {
				const { path: dirPath } = CreateDirectoryArgsSchema.parse(parameters);
				const validatedPath = await validatePath(dirPath);
				await fs.mkdir(validatedPath, { recursive: true });
				return {
					content: [{ type: "text", text: "Directory created successfully" }],
				};
			}

			case "list_directory": {
				const { path: dirPath } = ListDirectoryArgsSchema.parse(parameters);
				const validatedPath = await validatePath(dirPath);
				const entries = await fs.readdir(validatedPath);
				return {
					content: [{ type: "text", text: JSON.stringify(entries, null, 2) }],
				};
			}

			case "directory_tree": {
				const { path: dirPath } = DirectoryTreeArgsSchema.parse(parameters);
				const validatedPath = await validatePath(dirPath);
				const tree = await buildTree(validatedPath);
				return {
					content: [{ type: "text", text: JSON.stringify(tree, null, 2) }],
				};
			}

			case "move_file": {
				const { source, destination } = MoveFileArgsSchema.parse(parameters);
				const validatedSource = await validatePath(source);
				const validatedDest = await validatePath(destination);
				await fs.rename(validatedSource, validatedDest);
				return {
					content: [{ type: "text", text: "File moved successfully" }],
				};
			}

			case "search_files": {
				const {
					path: dirPath,
					pattern,
					excludePatterns,
				} = SearchFilesArgsSchema.parse(parameters);
				const validatedPath = await validatePath(dirPath);
				const results = await searchFiles(
					validatedPath,
					pattern,
					excludePatterns
				);
				return {
					content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
				};
			}

			case "get_file_info": {
				const { path: filePath } = GetFileInfoArgsSchema.parse(parameters);
				const validatedPath = await validatePath(filePath);
				const info = await getFileStats(validatedPath);
				return {
					content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
				};
			}

			default:
				throw new Error(`Unknown tool: ${name}`);
		}
	} catch (error) {
		if (error instanceof Error) {
			return {
				content: [{ type: "text", text: `Error: ${error.message}` }],
			};
		}
		throw error;
	}
});

async function runServer() {
	console.log("Secure MCP Filesystem Server starting on port 80");
	console.log("Allowed directories:", allowedDirectories);

	const transport = new HttpServerTransport({ port: 80 });
	await server.start(transport);
}

runServer().catch((error) => {
	console.error("Error:", error);
	process.exit(1);
});
