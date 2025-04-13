FROM node:20.14-slim as base

WORKDIR /app

# 필요한 파일 복사
COPY package.json package-lock.json /app/
COPY tsconfig.json /app/
COPY src/memory /app/src/memory/

# 의존성 설치 및 캐시 문제 해결
RUN npm cache clean --force && \
    npm install && \
    npm install -g typescript

# 수정된 tsconfig.json 생성 - import.meta 지원을 위한 모듈 설정 수정
RUN echo '{\
  "compilerOptions": {\
    "target": "ES2022",\
    "module": "NodeNext",\
    "moduleResolution": "NodeNext",\
    "esModuleInterop": true,\
    "skipLibCheck": true,\
    "outDir": "./dist",\
    "rootDir": ".",\
    "baseUrl": ".",\
    "paths": {\
      "@modelcontextprotocol/sdk": ["node_modules/@modelcontextprotocol/sdk"]\
    },\
    "strict": true\
  },\
  "include": ["src/**/*.ts"],\
  "exclude": ["node_modules", "**/*.test.ts"]\
}' > /app/tsconfig-build.json

# package.json의 type: module 확인 (이미 있으므로 추가하지 않음)
# RUN sed -i '/"name":/a \ \ "type": "module",' /app/package.json

# TypeScript 컴파일
RUN npx tsc -p tsconfig-build.json

# 컴파일된 파일 확인
RUN ls -la /app/dist/src/memory/

# 실행 환경 설정
WORKDIR /app
RUN mkdir -p /app/data

# 환경 변수 설정
ENV PORT=3000
ENV MEMORY_FILE_PATH=/app/data/memory.json

# 서비스 실행
EXPOSE 3000
CMD ["node", "dist/src/memory/index.js"]