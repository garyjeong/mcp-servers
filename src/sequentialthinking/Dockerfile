FROM node:20.14-slim

WORKDIR /app

# 기존 package.json 복사하지 않고 새로 생성
RUN echo '{\
  "name": "mcp-sequentialthinking-server",\
  "version": "1.0.0",\
  "description": "Express 기반 순차적 사고 MCP 서버",\
  "main": "index.js",\
  "dependencies": {\
    "express": "^4.18.2"\
  }\
}' > /app/package.json

# 간단한 Express 서버용 의존성 설치
RUN npm install

# 데이터 디렉토리 생성
RUN mkdir -p /app/data

# Express 순차적 사고 서버 구현
RUN echo '#!/usr/bin/env node\n\
console.log("순차적 사고 서비스 시작 중...");\n\
\n\
const express = require("express");\n\
const app = express();\n\
const PORT = process.env.PORT || 3000;\n\
\n\
// JSON 파싱 미들웨어\n\
app.use(express.json());\n\
\n\
// 순차적 사고 관리 클래스\n\
class SequentialThinkingServer {\n\
  constructor() {\n\
    this.thoughtHistory = [];\n\
    this.branches = {};\n\
  }\n\
\n\
  processThought(input) {\n\
    try {\n\
      const validatedInput = this.validateThoughtData(input);\n\
\n\
      if (validatedInput.thoughtNumber > validatedInput.totalThoughts) {\n\
        validatedInput.totalThoughts = validatedInput.thoughtNumber;\n\
      }\n\
\n\
      this.thoughtHistory.push(validatedInput);\n\
\n\
      if (validatedInput.branchFromThought && validatedInput.branchId) {\n\
        if (!this.branches[validatedInput.branchId]) {\n\
          this.branches[validatedInput.branchId] = [];\n\
        }\n\
        this.branches[validatedInput.branchId].push(validatedInput);\n\
      }\n\
\n\
      console.log(`사고 처리: ${validatedInput.thought}`);\n\
\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({\n\
            thoughtNumber: validatedInput.thoughtNumber,\n\
            totalThoughts: validatedInput.totalThoughts,\n\
            nextThoughtNeeded: validatedInput.nextThoughtNeeded,\n\
            branches: Object.keys(this.branches),\n\
            thoughtHistoryLength: this.thoughtHistory.length\n\
          }, null, 2)\n\
        }]\n\
      };\n\
    } catch (error) {\n\
      return {\n\
        content: [{\n\
          type: "text",\n\
          text: JSON.stringify({\n\
            error: error instanceof Error ? error.message : String(error),\n\
            status: "failed"\n\
          }, null, 2)\n\
        }]\n\
      };\n\
    }\n\
  }\n\
\n\
  validateThoughtData(input) {\n\
    const data = input;\n\
\n\
    if (!data.thought || typeof data.thought !== "string") {\n\
      throw new Error("Invalid thought: must be a string");\n\
    }\n\
    if (!data.thoughtNumber || typeof data.thoughtNumber !== "number") {\n\
      throw new Error("Invalid thoughtNumber: must be a number");\n\
    }\n\
    if (!data.totalThoughts || typeof data.totalThoughts !== "number") {\n\
      throw new Error("Invalid totalThoughts: must be a number");\n\
    }\n\
    if (typeof data.nextThoughtNeeded !== "boolean") {\n\
      throw new Error("Invalid nextThoughtNeeded: must be a boolean");\n\
    }\n\
\n\
    return {\n\
      thought: data.thought,\n\
      thoughtNumber: data.thoughtNumber,\n\
      totalThoughts: data.totalThoughts,\n\
      nextThoughtNeeded: data.nextThoughtNeeded,\n\
      isRevision: data.isRevision,\n\
      revisesThought: data.revisesThought,\n\
      branchFromThought: data.branchFromThought,\n\
      branchId: data.branchId,\n\
      needsMoreThoughts: data.needsMoreThoughts,\n\
    };\n\
  }\n\
}\n\
\n\
const thinkingServer = new SequentialThinkingServer();\n\
\n\
// MCP 도구 정의\n\
const SEQUENTIAL_THINKING_TOOL = {\n\
  name: "sequentialthinking",\n\
  description: "단계별 사고 도구",\n\
  parameters: {\n\
    type: "object",\n\
    properties: {\n\
      thought: {\n\
        type: "string",\n\
        description: "현재 사고 단계"\n\
      },\n\
      nextThoughtNeeded: {\n\
        type: "boolean",\n\
        description: "다음 사고 단계가 필요한지 여부"\n\
      },\n\
      thoughtNumber: {\n\
        type: "integer",\n\
        description: "현재 사고 번호",\n\
        minimum: 1\n\
      },\n\
      totalThoughts: {\n\
        type: "integer",\n\
        description: "예상 총 사고 수",\n\
        minimum: 1\n\
      },\n\
      isRevision: {\n\
        type: "boolean",\n\
        description: "이전 사고를 수정하는지 여부"\n\
      },\n\
      revisesThought: {\n\
        type: "integer",\n\
        description: "수정 중인 사고 번호",\n\
        minimum: 1\n\
      },\n\
      branchFromThought: {\n\
        type: "integer",\n\
        description: "분기점 사고 번호",\n\
        minimum: 1\n\
      },\n\
      branchId: {\n\
        type: "string",\n\
        description: "분기 식별자"\n\
      },\n\
      needsMoreThoughts: {\n\
        type: "boolean",\n\
        description: "더 많은 사고가 필요한지 여부"\n\
      }\n\
    },\n\
    required: ["thought", "nextThoughtNeeded", "thoughtNumber", "totalThoughts"]\n\
  }\n\
};\n\
\n\
// list_tools 엔드포인트\n\
app.post("/list_tools", (req, res) => {\n\
  console.log("list_tools 요청 받음");\n\
  res.json({\n\
    jsonrpc: "2.0",\n\
    id: req.body.id || "1",\n\
    result: { tools: [SEQUENTIAL_THINKING_TOOL] }\n\
  });\n\
});\n\
\n\
// call_tool 엔드포인트\n\
app.post("/call_tool", (req, res) => {\n\
  console.log("call_tool 요청 받음");\n\
  try {\n\
    const { name, parameters } = req.body.params || {};\n\
    \n\
    if (name === "sequentialthinking") {\n\
      const result = thinkingServer.processThought(parameters);\n\
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
  res.json({ status: "ok", message: "순차적 사고 서비스가 실행 중입니다." });\n\
});\n\
\n\
// 서버 시작\n\
app.listen(PORT, () => {\n\
  console.log(`순차적 사고 서비스가 포트 ${PORT}에서 실행 중입니다.`);\n\
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

# 포트 노출
EXPOSE 3000

# 서비스 실행
CMD ["node", "/app/index.js"]
