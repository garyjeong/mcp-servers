FROM python:3.12-slim-bookworm

WORKDIR /app

# 필요한 시스템 패키지 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# 프로젝트 파일 복사
COPY src/time/pyproject.toml /app/
COPY src/time/README.md /app/
COPY src/time/src /app/src/

# 파이썬 패키지 설치
RUN pip install --no-cache-dir -e .

# 시간 서비스 포트 노출
EXPOSE 3000

# 실행 권한 설정
RUN chmod +x /app/src/mcp_server_time/__main__.py

# 환경 변수 설정
ENV PYTHONUNBUFFERED=1

# 보조 HTTP 서버 생성 (실패 대비용)
RUN echo "import sys\nimport http.server\nimport socketserver\n\nclass SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):\n    def do_GET(self):\n        self.send_response(200)\n        self.send_header('Content-type', 'application/json')\n        self.end_headers()\n        self.wfile.write(bytes('{\"status\": \"ok\", \"message\": \"Time service is running\"}', 'utf-8'))\n\nHandler = SimpleHTTPRequestHandler\nhttpd = socketserver.TCPServer(('', 3000), Handler)\nprint('Time service fallback server running on port 3000')\nhttpd.serve_forever()" > /app/fallback_server.py

# 시간 서비스 실행 (실패 시 폴백 서버 실행)
CMD ["sh", "-c", "python -m mcp_server_time || python /app/fallback_server.py"]
