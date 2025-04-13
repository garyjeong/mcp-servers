FROM node:20.14-slim

WORKDIR /app

# 기존 package.json 복사하지 않고 새로 생성
RUN echo '{\
  "name": "mcp-filesystem-server",\
  "version": "1.0.0",\
  "description": "Express 기반 파일시스템 MCP 서버",\
  "main": "index.js",\
  "dependencies": {\
    "express": "^4.18.2"\
  }\
}' > /app/package.json

# 간단한 Express 서버용 의존성 설치
RUN npm install

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# Express 파일시스템 서버 구현
RUN echo '#!/usr/bin/env node\n\
console.log("파일시스템 서비스 시작 중...");\n\
\n\
const express = require("express");\n\
const fs = require("fs");\n\
const path = require("path");\n\
\n\
// Express 앱 생성\n\
const app = express();\n\
const PORT = process.env.PORT || 3000;\n\
const DATA_DIR = process.env.FILESYSTEM_DATA_DIR || "/app/data";\n\
\n\
// JSON 파싱 미들웨어\n\
app.use(express.json());\n\
\n\
// 파일시스템 도구 정의\n\
const FILESYSTEM_TOOLS = [\n\
  {\n\
    name: "read_file",\n\
    description: "파일의 내용을 읽습니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "읽을 파일의 경로"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  },\n\
  {\n\
    name: "write_file",\n\
    description: "파일에 내용을 씁니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "쓸 파일의 경로"\n\
        },\n\
        content: {\n\
          type: "string",\n\
          description: "파일에 쓸 내용"\n\
        }\n\
      },\n\
      required: ["path", "content"]\n\
    }\n\
  },\n\
  {\n\
    name: "list_directory",\n\
    description: "디렉토리의 내용을 나열합니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "나열할 디렉토리의 경로"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  },\n\
  {\n\
    name: "create_directory",\n\
    description: "새 디렉토리를 생성합니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "생성할 디렉토리의 경로"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  },\n\
  {\n\
    name: "delete_file",\n\
    description: "파일을 삭제합니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "삭제할 파일의 경로"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  },\n\
  {\n\
    name: "delete_directory",\n\
    description: "디렉토리를 삭제합니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "삭제할 디렉토리의 경로"\n\
        },\n\
        recursive: {\n\
          type: "boolean",\n\
          description: "디렉토리와 그 내용을 재귀적으로 삭제할지 여부"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  },\n\
  {\n\
    name: "file_exists",\n\
    description: "파일이 존재하는지 확인합니다",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        path: {\n\
          type: "string",\n\
          description: "확인할 파일의 경로"\n\
        }\n\
      },\n\
      required: ["path"]\n\
    }\n\
  }\n\
];\n\
\n\
// 경로 안전성 검사 헬퍼 함수\n\
function validateAndResolvePath(userPath) {\n\
  // 상대 경로를 절대 경로로 변환\n\
  const absolutePath = path.isAbsolute(userPath)\n\
    ? userPath\n\
    : path.resolve(DATA_DIR, userPath);\n\
\n\
  // 경로가 데이터 디렉토리 내에 있는지 확인\n\
  if (!absolutePath.startsWith(DATA_DIR)) {\n\
    throw new Error(`경로가 허용된 디렉토리(${DATA_DIR}) 외부에 있습니다: ${userPath}`);\n\
  }\n\
\n\
  return absolutePath;\n\
}\n\
\n\
// 도구 구현 함수\n\
const toolHandlers = {\n\
  read_file: async (params) => {\n\
    try {\n\
      const filePath = validateAndResolvePath(params.path);\n\
      if (!fs.existsSync(filePath)) {\n\
        throw new Error(`파일이 존재하지 않습니다: ${params.path}`);\n\
      }\n\
      const content = fs.readFileSync(filePath, "utf8");\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: content\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  write_file: async (params) => {\n\
    try {\n\
      const filePath = validateAndResolvePath(params.path);\n\
      const dirPath = path.dirname(filePath);\n\
      \n\
      // 디렉토리가 없으면 생성\n\
      if (!fs.existsSync(dirPath)) {\n\
        fs.mkdirSync(dirPath, { recursive: true });\n\
      }\n\
      \n\
      fs.writeFileSync(filePath, params.content, "utf8");\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ success: true, path: params.path })\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  list_directory: async (params) => {\n\
    try {\n\
      const dirPath = validateAndResolvePath(params.path);\n\
      if (!fs.existsSync(dirPath)) {\n\
        throw new Error(`디렉토리가 존재하지 않습니다: ${params.path}`);\n\
      }\n\
      if (!fs.statSync(dirPath).isDirectory()) {\n\
        throw new Error(`경로가 디렉토리가 아닙니다: ${params.path}`);\n\
      }\n\
      \n\
      const items = fs.readdirSync(dirPath);\n\
      const fileInfo = items.map(item => {\n\
        const itemPath = path.join(dirPath, item);\n\
        const stats = fs.statSync(itemPath);\n\
        return {\n\
          name: item,\n\
          path: path.relative(DATA_DIR, itemPath),\n\
          type: stats.isDirectory() ? "directory" : "file",\n\
          size: stats.size,\n\
          created: stats.birthtime,\n\
          modified: stats.mtime\n\
        };\n\
      });\n\
      \n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify(fileInfo, null, 2)\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  create_directory: async (params) => {\n\
    try {\n\
      const dirPath = validateAndResolvePath(params.path);\n\
      fs.mkdirSync(dirPath, { recursive: true });\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ success: true, path: params.path })\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  delete_file: async (params) => {\n\
    try {\n\
      const filePath = validateAndResolvePath(params.path);\n\
      if (!fs.existsSync(filePath)) {\n\
        throw new Error(`파일이 존재하지 않습니다: ${params.path}`);\n\
      }\n\
      if (fs.statSync(filePath).isDirectory()) {\n\
        throw new Error(`지정된 경로는 파일이 아닌 디렉토리입니다: ${params.path}`);\n\
      }\n\
      fs.unlinkSync(filePath);\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ success: true, path: params.path })\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  delete_directory: async (params) => {\n\
    try {\n\
      const dirPath = validateAndResolvePath(params.path);\n\
      if (!fs.existsSync(dirPath)) {\n\
        throw new Error(`디렉토리가 존재하지 않습니다: ${params.path}`);\n\
      }\n\
      if (!fs.statSync(dirPath).isDirectory()) {\n\
        throw new Error(`지정된 경로는 디렉토리가 아닌 파일입니다: ${params.path}`);\n\
      }\n\
      fs.rmdirSync(dirPath, { recursive: params.recursive === true });\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ success: true, path: params.path })\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      throw error;\n\
    }\n\
  },\n\
  \n\
  file_exists: async (params) => {\n\
    try {\n\
      const filePath = validateAndResolvePath(params.path);\n\
      const exists = fs.existsSync(filePath);\n\
      const isFile = exists && fs.statSync(filePath).isFile();\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ exists: exists && isFile, path: params.path })\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({ exists: false, path: params.path, error: error.message })\n\
        }]\n\
      };\n\
    }\n\
  }\n\
};\n\
\n\
// list_tools 엔드포인트\n\
app.post("/list_tools", (req, res) => {\n\
  console.log("list_tools 요청 받음");\n\
  res.json({\n\
    jsonrpc: "2.0",\n\
    id: req.body.id || "1",\n\
    result: { tools: FILESYSTEM_TOOLS }\n\
  });\n\
});\n\
\n\
// call_tool 엔드포인트\n\
app.post("/call_tool", async (req, res) => {\n\
  console.log("call_tool 요청 받음");\n\
  try {\n\
    const { name, parameters } = req.body.params || {};\n\
    \n\
    if (toolHandlers[name]) {\n\
      const result = await toolHandlers[name](parameters);\n\
      res.json({\n\
        jsonrpc: "2.0",\n\
        id: req.body.id || "1",\n\
        result: result\n\
      });\n\
    } else {\n\
      res.status(400).json({\n\
        jsonrpc: "2.0",\n\
        id: req.body.id || "1",\n\
        error: { code: -32601, message: `지원되지 않는 도구: ${name}` }\n\
      });\n\
    }\n\
  } catch (error) {\n\
    console.error("오류 발생:", error);\n\
    res.status(500).json({\n\
      jsonrpc: "2.0",\n\
      id: req.body.id || "1",\n\
      error: { code: -32603, message: `내부 서버 오류: ${error.message}` }\n\
    });\n\
  }\n\
});\n\
\n\
// 기본 라우트\n\
app.get("/", (req, res) => {\n\
  res.json({ status: "ok", message: "파일시스템 서비스가 실행 중입니다." });\n\
});\n\
\n\
// 서버 시작\n\
app.listen(PORT, () => {\n\
  console.log(`파일시스템 서비스가 포트 ${PORT}에서 실행 중입니다.`);\n\
  console.log(`데이터 디렉토리: ${DATA_DIR}`);\n\
});\n\
\n\
// 종료 핸들러\n\
process.on("SIGINT", () => {\n\
  console.log("서비스를 종료합니다...");\n\
  process.exit(0);\n\
});' > /app/index.js

# 실행 권한 부여
RUN chmod +x /app/index.js

# 환경 변수 설정
ENV PORT=3000
ENV FILESYSTEM_DATA_DIR=/app/data

# 포트 노출
EXPOSE 3000

# 서비스 실행
CMD ["node", "/app/index.js"]