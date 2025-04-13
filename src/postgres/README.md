# PostgreSQL

PostgreSQL 데이터베이스에 읽기 전용 액세스를 제공하는 모델 컨텍스트 프로토콜 서버입니다. 이 서버는 LLM이 데이터베이스 스키마를 검사하고 읽기 전용 쿼리를 실행할 수 있게 합니다.

## 구성 요소

### 도구

- **query**
  - 연결된 데이터베이스에 대해 읽기 전용 SQL 쿼리 실행
  - 입력: `sql` (문자열): 실행할 SQL 쿼리
  - 모든 쿼리는 READ ONLY 트랜잭션 내에서 실행됩니다

### 리소스

서버는 데이터베이스의 각 테이블에 대한 스키마 정보를 제공합니다:

- **테이블 스키마** (`postgres://<host>/<table>/schema`)
  - 각 테이블에 대한 JSON 스키마 정보
  - 열 이름 및 데이터 타입 포함
  - 데이터베이스 메타데이터에서 자동으로 검색됨

## Claude Desktop에서 사용

Claude Desktop 앱에서 이 서버를 사용하려면 `claude_desktop_config.json` 파일의 "mcpServers" 섹션에 다음 구성을 추가하세요:

### Docker

* macOS에서 Docker를 실행할 때, 서버가 호스트 네트워크(예: localhost)에서 실행 중이면 host.docker.internal을 사용하세요
* 사용자 이름/비밀번호는 `postgresql://user:password@host:port/db-name` 형식으로 PostgreSQL URL에 추가할 수 있습니다

```json
{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": [
        "run", 
        "-i", 
        "--rm", 
        "mcp/postgres", 
        "postgresql://host.docker.internal:5432/mydb"]
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://localhost/mydb"
      ]
    }
  }
}
```

`/mydb`를 사용하실 데이터베이스 이름으로 변경하세요.

## 빌드

Docker:

```sh
docker build -t mcp/postgres -f src/postgres/Dockerfile . 
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
