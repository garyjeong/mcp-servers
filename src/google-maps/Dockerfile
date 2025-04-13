FROM node:20-slim AS builder

WORKDIR /app

# 루트 디렉토리의 필요 파일 복사
COPY package.json package-lock.json ./
COPY src/common ./src/common
COPY src/google-maps ./src/google-maps
COPY tsconfig.json ./

# 종속성 설치 및 빌드
RUN npm ci
RUN npm run build:google-maps

FROM node:20-slim

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/dist/src/google-maps ./dist/src/google-maps
COPY --from=builder /app/dist/src/common ./dist/src/common

# 프로덕션 종속성만 설치
RUN npm ci --only=production

# 서비스 실행
ENV PORT=3000
EXPOSE ${PORT}

CMD ["node", "dist/src/google-maps/index.js"]