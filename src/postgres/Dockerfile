FROM node:20.14-slim AS build

WORKDIR /app

# 프로젝트 파일 복사
COPY ./src/postgres/package*.json ./
COPY ./src/postgres/tsconfig.json ./

# 의존성 설치
RUN npm install

# 소스 파일 복사
COPY ./src/postgres/src ./src

# TypeScript 컴파일
RUN npm run build

FROM node:20.14-slim AS runner

WORKDIR /app

# 빌드된 파일과 필요한 종속성 복사
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

ENV PORT=3000

EXPOSE ${PORT}

CMD ["node", "dist/src/index.js"]