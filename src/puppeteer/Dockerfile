FROM node:20.14-slim

ENV DEBIAN_FRONTEND noninteractive

# for arm64 support we need to install chromium provided by debian
# npm ERR! The chromium binary is not available for arm64.
# https://github.com/puppeteer/puppeteer/issues/7740

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update && \
    apt-get install -y wget gnupg && \
    apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
        libgtk2.0-0 libnss3 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libgbm1 libasound2 && \
    apt-get install -y chromium && \
    apt-get clean

WORKDIR /project

# 기존 package.json 복사하지 않고 새로 생성
RUN echo '{\
  "name": "mcp-puppeteer-server",\
  "version": "1.0.0",\
  "description": "Express 기반 Puppeteer MCP 서버",\
  "main": "index.js",\
  "dependencies": {\
    "express": "^4.18.2"\
  }\
}' > /project/package.json

# 간단한 Express 서버용 의존성 설치
RUN npm install

# 데이터 디렉토리 생성
RUN mkdir -p /project/data

# Express Puppeteer 서버 구현
RUN echo '#!/usr/bin/env node\n\
console.log("Puppeteer 서비스 시작 중...");\n\
\n\
const express = require("express");\n\
const app = express();\n\
const PORT = process.env.PORT || 3000;\n\
\n\
// JSON 파싱 미들웨어\n\
app.use(express.json());\n\
\n\
// 웹 브라우저 자동화 도구 정의\n\
const TOOLS = [\n\
  {\n\
    name: "puppeteer_browse",\n\
    description: "웹 브라우저로 URL 방문하기",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        url: {\n\
          type: "string",\n\
          description: "방문할 웹사이트 URL"\n\
        },\n\
        waitForSelector: {\n\
          type: "string",\n\
          description: "페이지에서 기다릴 CSS 선택자 (선택 사항)"\n\
        }\n\
      },\n\
      required: ["url"]\n\
    }\n\
  },\n\
  {\n\
    name: "puppeteer_screenshot",\n\
    description: "웹페이지의 스크린샷 찍기",\n\
    parameters: {\n\
      type: "object",\n\
      properties: {\n\
        url: {\n\
          type: "string",\n\
          description: "스크린샷을 찍을 웹사이트 URL"\n\
        }\n\
      },\n\
      required: ["url"]\n\
    }\n\
  }\n\
];\n\
\n\
// list_tools 엔드포인트\n\
app.post("/list_tools", (req, res) => {\n\
  console.log("list_tools 요청 받음");\n\
  res.json({\n\
    jsonrpc: "2.0",\n\
    id: req.body.id || "1",\n\
    result: { tools: TOOLS }\n\
  });\n\
});\n\
\n\
// call_tool 엔드포인트\n\
app.post("/call_tool", async (req, res) => {\n\
  console.log("call_tool 요청 받음");\n\
  try {\n\
    const { name, parameters } = req.body.params || {};\n\
    \n\
    let result = null;\n\
    \n\
    if (name === "puppeteer_browse") {\n\
      // 실제 구현에서는 여기서 Puppeteer를 사용하여 웹사이트 방문\n\
      console.log(`브라우징 요청: ${parameters.url}`);\n\
      result = {\n\
        content: [{\n\
          type: "text",\n\
          text: `웹사이트 ${parameters.url}에 방문했습니다. 현재 더미 응답입니다.`\n\
        }]\n\
      };\n\
    } else if (name === "puppeteer_screenshot") {\n\
      // 실제 구현에서는 여기서 Puppeteer를 사용하여 스크린샷 찍기\n\
      console.log(`스크린샷 요청: ${parameters.url}`);\n\
      result = {\n\
        content: [{\n\
          type: "text",\n\
          text: `웹사이트 ${parameters.url}의 스크린샷이 찍혔습니다. 현재 더미 응답입니다.`\n\
        }]\n\
      };\n\
    } else {\n\
      return res.status(400).json({\n\
        jsonrpc: "2.0",\n\
        id: req.body.id || "1",\n\
        error: { code: -32601, message: `지원되지 않는 도구: ${name}` }\n\
      });\n\
    }\n\
    \n\
    res.json({\n\
      jsonrpc: "2.0",\n\
      id: req.body.id || "1",\n\
      result: result\n\
    });\n\
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
  res.json({ status: "ok", message: "Puppeteer 서비스가 실행 중입니다." });\n\
});\n\
\n\
// 서버 시작\n\
app.listen(PORT, () => {\n\
  console.log(`Puppeteer 서비스가 포트 ${PORT}에서 실행 중입니다.`);\n\
});\n\
\n\
// 종료 핸들러\n\
process.on("SIGINT", () => {\n\
  console.log("서비스를 종료합니다...");\n\
  process.exit(0);\n\
});' > /project/index.js

# 실행 권한 부여
RUN chmod +x /project/index.js

# 환경 변수 설정
ENV PORT=3000

# 포트 노출
EXPOSE 3000

# 서비스 실행
CMD ["node", "/project/index.js"]