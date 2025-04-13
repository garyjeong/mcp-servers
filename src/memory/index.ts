#!/usr/bin/env node

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

// 메모리 파일 경로 설정 개선
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const MEMORY_PATH = process.env.MEMORY_PATH || "/app/data";

// 메모리 디렉터리 확인/생성 함수
async function ensureDirectoryExists(dirPath: string): Promise<void> {
	try {
		await fs.mkdir(dirPath, { recursive: true });
		console.log(`디렉터리 확인/생성: ${dirPath}`);
	} catch (error) {
		console.error(`디렉터리 생성 실패: ${dirPath}`, error);
		process.exit(1);
	}
}

// 파일 이름만 지정된 경우 전체 경로 구성
const MEMORY_FILE_PATH = process.env.MEMORY_FILE_PATH
	? path.isAbsolute(process.env.MEMORY_FILE_PATH)
		? process.env.MEMORY_FILE_PATH
		: path.join(MEMORY_PATH, process.env.MEMORY_FILE_PATH)
	: path.join(MEMORY_PATH, "memory.json");

console.log(`메모리 파일 경로: ${MEMORY_FILE_PATH}`);

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
	name: string;
	entityType: string;
	observations: string[];
}

interface Relation {
	from: string;
	to: string;
	relationType: string;
}

interface KnowledgeGraph {
	entities: Entity[];
	relations: Relation[];
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
	private async loadGraph(): Promise<KnowledgeGraph> {
		try {
			const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
			const lines = data.split("\n").filter((line) => line.trim() !== "");
			return lines.reduce(
				(graph: KnowledgeGraph, line) => {
					const item = JSON.parse(line);
					if (item.type === "entity") graph.entities.push(item as Entity);
					if (item.type === "relation") graph.relations.push(item as Relation);
					return graph;
				},
				{ entities: [], relations: [] }
			);
		} catch (error) {
			if (
				error instanceof Error &&
				"code" in error &&
				(error as any).code === "ENOENT"
			) {
				return { entities: [], relations: [] };
			}
			throw error;
		}
	}

	private async saveGraph(graph: KnowledgeGraph): Promise<void> {
		const lines = [
			...graph.entities.map((e) => JSON.stringify({ type: "entity", ...e })),
			...graph.relations.map((r) => JSON.stringify({ type: "relation", ...r })),
		];
		await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
	}

	async createEntities(entities: Entity[]): Promise<Entity[]> {
		const graph = await this.loadGraph();
		const newEntities = entities.filter(
			(e) =>
				!graph.entities.some((existingEntity) => existingEntity.name === e.name)
		);
		graph.entities.push(...newEntities);
		await this.saveGraph(graph);
		return newEntities;
	}

	async createRelations(relations: Relation[]): Promise<Relation[]> {
		const graph = await this.loadGraph();
		const newRelations = relations.filter(
			(r) =>
				!graph.relations.some(
					(existingRelation) =>
						existingRelation.from === r.from &&
						existingRelation.to === r.to &&
						existingRelation.relationType === r.relationType
				)
		);
		graph.relations.push(...newRelations);
		await this.saveGraph(graph);
		return newRelations;
	}

	async addObservations(
		observations: { entityName: string; contents: string[] }[]
	): Promise<{ entityName: string; addedObservations: string[] }[]> {
		const graph = await this.loadGraph();
		const results = observations.map((o) => {
			const entity = graph.entities.find((e) => e.name === o.entityName);
			if (!entity) {
				throw new Error(`Entity with name ${o.entityName} not found`);
			}
			const newObservations = o.contents.filter(
				(content) => !entity.observations.includes(content)
			);
			entity.observations.push(...newObservations);
			return { entityName: o.entityName, addedObservations: newObservations };
		});
		await this.saveGraph(graph);
		return results;
	}

	async deleteEntities(entityNames: string[]): Promise<void> {
		const graph = await this.loadGraph();
		graph.entities = graph.entities.filter(
			(e) => !entityNames.includes(e.name)
		);
		graph.relations = graph.relations.filter(
			(r) => !entityNames.includes(r.from) && !entityNames.includes(r.to)
		);
		await this.saveGraph(graph);
	}

	async deleteObservations(
		deletions: { entityName: string; observations: string[] }[]
	): Promise<void> {
		const graph = await this.loadGraph();
		deletions.forEach((d) => {
			const entity = graph.entities.find((e) => e.name === d.entityName);
			if (entity) {
				entity.observations = entity.observations.filter(
					(o) => !d.observations.includes(o)
				);
			}
		});
		await this.saveGraph(graph);
	}

	async deleteRelations(relations: Relation[]): Promise<void> {
		const graph = await this.loadGraph();
		graph.relations = graph.relations.filter(
			(r) =>
				!relations.some(
					(delRelation) =>
						r.from === delRelation.from &&
						r.to === delRelation.to &&
						r.relationType === delRelation.relationType
				)
		);
		await this.saveGraph(graph);
	}

	async readGraph(): Promise<KnowledgeGraph> {
		return this.loadGraph();
	}

	// Very basic search function
	async searchNodes(query: string): Promise<KnowledgeGraph> {
		const graph = await this.loadGraph();

		// Filter entities
		const filteredEntities = graph.entities.filter(
			(e) =>
				e.name.toLowerCase().includes(query.toLowerCase()) ||
				e.entityType.toLowerCase().includes(query.toLowerCase()) ||
				e.observations.some((o) =>
					o.toLowerCase().includes(query.toLowerCase())
				)
		);

		// Create a Set of filtered entity names for quick lookup
		const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

		// Filter relations to only include those between filtered entities
		const filteredRelations = graph.relations.filter(
			(r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
		);

		const filteredGraph: KnowledgeGraph = {
			entities: filteredEntities,
			relations: filteredRelations,
		};

		return filteredGraph;
	}

	async openNodes(names: string[]): Promise<KnowledgeGraph> {
		const graph = await this.loadGraph();

		// Filter entities
		const filteredEntities = graph.entities.filter((e) =>
			names.includes(e.name)
		);

		// Create a Set of filtered entity names for quick lookup
		const filteredEntityNames = new Set(filteredEntities.map((e) => e.name));

		// Filter relations to only include those between filtered entities
		const filteredRelations = graph.relations.filter(
			(r) => filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
		);

		const filteredGraph: KnowledgeGraph = {
			entities: filteredEntities,
			relations: filteredRelations,
		};

		return filteredGraph;
	}
}

const knowledgeGraphManager = new KnowledgeGraphManager();

// MCP 도구 목록
const TOOLS = [
	{
		name: "create_entities",
		description: "Create new entities in the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				entities: {
					type: "array",
					items: {
						type: "object",
						properties: {
							name: { type: "string" },
							entityType: { type: "string" },
							observations: { type: "array", items: { type: "string" } },
						},
						required: ["name", "entityType", "observations"],
					},
				},
			},
			required: ["entities"],
		},
	},
	{
		name: "create_relations",
		description: "Create new relations between entities in the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				relations: {
					type: "array",
					items: {
						type: "object",
						properties: {
							from: { type: "string" },
							to: { type: "string" },
							relationType: { type: "string" },
						},
						required: ["from", "to", "relationType"],
					},
				},
			},
			required: ["relations"],
		},
	},
	{
		name: "add_observations",
		description: "Add observations to existing entities",
		parameters: {
			type: "object",
			properties: {
				observations: {
					type: "array",
					items: {
						type: "object",
						properties: {
							entityName: { type: "string" },
							contents: { type: "array", items: { type: "string" } },
						},
						required: ["entityName", "contents"],
					},
				},
			},
			required: ["observations"],
		},
	},
	{
		name: "delete_entities",
		description: "Delete entities from the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				entityNames: { type: "array", items: { type: "string" } },
			},
			required: ["entityNames"],
		},
	},
	{
		name: "delete_observations",
		description: "Delete observations from entities",
		parameters: {
			type: "object",
			properties: {
				deletions: {
					type: "array",
					items: {
						type: "object",
						properties: {
							entityName: { type: "string" },
							observations: { type: "array", items: { type: "string" } },
						},
						required: ["entityName", "observations"],
					},
				},
			},
			required: ["deletions"],
		},
	},
	{
		name: "delete_relations",
		description: "Delete relations from the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				relations: {
					type: "array",
					items: {
						type: "object",
						properties: {
							from: { type: "string" },
							to: { type: "string" },
							relationType: { type: "string" },
						},
						required: ["from", "to", "relationType"],
					},
				},
			},
			required: ["relations"],
		},
	},
	{
		name: "read_graph",
		description: "Read the entire knowledge graph",
		parameters: {
			type: "object",
			properties: {},
			required: [],
		},
	},
	{
		name: "search_nodes",
		description: "Search for nodes in the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				query: { type: "string" },
			},
			required: ["query"],
		},
	},
	{
		name: "open_nodes",
		description: "Open specific nodes in the knowledge graph",
		parameters: {
			type: "object",
			properties: {
				names: { type: "array", items: { type: "string" } },
			},
			required: ["names"],
		},
	},
];

// 도구 요청 처리 함수
async function handleToolCall(name: string, parameters: any): Promise<any> {
	switch (name) {
		case "create_entities":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.createEntities(parameters.entities),
							null,
							2
						),
					},
				],
			};
		case "create_relations":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.createRelations(parameters.relations),
							null,
							2
						),
					},
				],
			};
		case "add_observations":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.addObservations(
								parameters.observations
							),
							null,
							2
						),
					},
				],
			};
		case "delete_entities":
			await knowledgeGraphManager.deleteEntities(parameters.entityNames);
			return {
				content: [{ type: "text", text: "Entities deleted successfully" }],
			};
		case "delete_observations":
			await knowledgeGraphManager.deleteObservations(parameters.deletions);
			return {
				content: [{ type: "text", text: "Observations deleted successfully" }],
			};
		case "delete_relations":
			await knowledgeGraphManager.deleteRelations(parameters.relations);
			return {
				content: [{ type: "text", text: "Relations deleted successfully" }],
			};
		case "read_graph":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.readGraph(),
							null,
							2
						),
					},
				],
			};
		case "search_nodes":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.searchNodes(parameters.query),
							null,
							2
						),
					},
				],
			};
		case "open_nodes":
			return {
				content: [
					{
						type: "text",
						text: JSON.stringify(
							await knowledgeGraphManager.openNodes(parameters.names),
							null,
							2
						),
					},
				],
			};
		default:
			throw new Error(`Unknown tool: ${name}`);
	}
}

// 간단한 HTTP 서버
class SimpleHttpServer {
	private server: http.Server;
	private port: number;

	constructor(options: { port: number }) {
		this.port = options.port;
		this.server = http.createServer();
	}

	start(): Promise<void> {
		return new Promise((resolve) => {
			this.server.on("request", async (req, res) => {
				// CORS 헤더 설정
				res.setHeader("Access-Control-Allow-Origin", "*");
				res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
				res.setHeader("Access-Control-Allow-Headers", "Content-Type");

				// OPTIONS 요청 처리
				if (req.method === "OPTIONS") {
					res.writeHead(204);
					res.end();
					return;
				}

				// 요청 처리
				if (req.method === "POST") {
					try {
						// 요청 본문 읽기
						let body = "";
						req.on("data", (chunk) => {
							body += chunk.toString();
						});

						req.on("end", async () => {
							try {
								const requestBody = JSON.parse(body);
								const requestId = requestBody.id || "unknown";

								// 요청 경로에 따라 처리
								if (req.url === "/list_tools") {
									console.log("list_tools 요청 받음");
									res.setHeader("Content-Type", "application/json");
									res.writeHead(200);
									res.end(
										JSON.stringify({
											jsonrpc: "2.0",
											id: requestId,
											result: {
												tools: TOOLS,
											},
										})
									);
								} else if (req.url === "/call_tool") {
									console.log("call_tool 요청 받음");
									const { name, parameters } = requestBody.params;
									const result = await handleToolCall(name, parameters);
									res.setHeader("Content-Type", "application/json");
									res.writeHead(200);
									res.end(
										JSON.stringify({
											jsonrpc: "2.0",
											id: requestId,
											result,
										})
									);
								} else {
									// 404 Not Found
									res.writeHead(404);
									res.end(JSON.stringify({ error: "Not found" }));
								}
							} catch (error) {
								console.error("요청 처리 중 오류 발생:", error);
								res.writeHead(500);
								res.end(JSON.stringify({ error: "Internal Server Error" }));
							}
						});
					} catch (error) {
						console.error("요청 본문 파싱 중 오류 발생:", error);
						res.writeHead(400);
						res.end(JSON.stringify({ error: "Bad Request" }));
					}
				} else {
					// 허용되지 않은 HTTP 메서드
					res.writeHead(405);
					res.end(JSON.stringify({ error: "Method Not Allowed" }));
				}
			});

			this.server.listen(this.port, () => {
				console.log(`서버가 포트 ${this.port}에서 시작되었습니다.`);
				resolve();
			});
		});
	}

	stop(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.server.close((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}

// 포트 설정 추가
async function main() {
	// 메모리 디렉터리 초기화
	await ensureDirectoryExists(MEMORY_PATH);
	await ensureDirectoryExists(path.dirname(MEMORY_FILE_PATH));

	// 환경 변수에서 포트 가져오기
	const port = parseInt(process.env.PORT || "3000", 10);
	console.log(`지식 그래프 MCP 서버 시작 중, 포트: ${port}`);

	// 서버 시작
	const server = new SimpleHttpServer({ port });
	await server.start();

	// 프로세스 종료 시 서버 종료
	process.on("SIGINT", async () => {
		console.log("서버를 종료합니다...");
		await server.stop();
		process.exit(0);
	});
}

main().catch((error) => {
	console.error("오류:", error);
	process.exit(1);
});
