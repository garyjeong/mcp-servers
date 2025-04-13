# 모델 컨텍스트 프로토콜 서버 (MCP Servers)

이 저장소는 [모델 컨텍스트 프로토콜](https://modelcontextprotocol.io/)(MCP)의 *참조 구현*들과 커뮤니티에서 제작한 서버 및 추가 리소스에 대한 참조를 포함하고 있습니다.

이 저장소의 서버들은 MCP의 다양성과 확장성을 보여주며, 대규모 언어 모델(LLM)이 도구와 데이터 소스에 안전하고 제어된 접근을 할 수 있도록 합니다. 각 MCP 서버는 [Typescript MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk) 또는 [Python MCP SDK](https://github.com/modelcontextprotocol/python-sdk)로 구현되었습니다.

## 설치 및 실행 방법

### Docker Compose 사용

이 프로젝트는 Docker Compose를 사용하여 여러 MCP 서버를 쉽게 실행할 수 있도록 구성되어 있습니다. 다음 명령어로 모든 서비스를 시작할 수 있습니다:

```bash
docker-compose up -d
```

### 구성된 서비스 목록

docker-compose.yaml에 다음 서비스들이 구성되어 있습니다:

1. **fetch** (포트: 20001) - 웹 콘텐츠 가져오기 기능을 제공하는 서버
2. **filesystem** (포트: 20002) - 파일 시스템 작업을 위한 서버
3. **memory** (포트: 20003) - 지식 그래프 기반 영구 메모리 시스템
4. **puppeteer** (포트: 20004) - 브라우저 자동화 및 웹 스크래핑 서버
5. **sequentialthinking** (포트: 20005) - 동적 및 반성적 문제 해결을 위한 사고 시퀀스 서버
6. **time** (포트: 20006) - 시간 및 시간대 변환 기능을 제공하는 서버

모든 서비스는 `common_memory` 공유 볼륨을 통해 데이터를 공유할 수 있습니다. 이를 통해 서비스 간 데이터 통합이 가능합니다.

## Claude Desktop 연결 구성

Docker Compose로 실행된 서비스를 Claude Desktop에 연결하려면 다음 JSON 구성을 사용할 수 있습니다.
`claude_desktop_config.json` 파일을 생성하고 아래 구성을 추가하세요:

### 모든 서비스를 한 번에 연결하는 구성

```json
{
  "mcpServers": {
    "fetch": {
      "command": "curl",
      "args": ["-s", "http://localhost:20001"]
    },
    "filesystem": {
      "command": "curl",
      "args": ["-s", "http://localhost:20002"]
    },
    "memory": {
      "command": "curl",
      "args": ["-s", "http://localhost:20003"]
    },
    "puppeteer": {
      "command": "curl",
      "args": ["-s", "http://localhost:20004"]
    },
    "sequentialthinking": {
      "command": "curl",
      "args": ["-s", "http://localhost:20005"]
    },
    "time": {
      "command": "curl",
      "args": ["-s", "http://localhost:20006"]
    }
  }
}
```

### Docker를 직접 사용하는 구성

서비스를 개별적으로 실행하고자 할 경우 다음 구성을 사용할 수 있습니다:

#### Fetch 서비스

```json
{
  "mcpServers": {
    "fetch": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/fetch"]
    }
  }
}
```

#### Filesystem 서비스

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "./data:/projects/data", "mcp/filesystem"]
    }
  }
}
```

#### Memory 서비스

```json
{
  "mcpServers": {
    "memory": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/memory"]
    }
  }
}
```

#### Puppeteer 서비스

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/puppeteer"]
    }
  }
}
```

#### Sequential Thinking 서비스

```json
{
  "mcpServers": {
    "sequentialthinking": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/sequentialthinking"]
    }
  }
}
```

#### Time 서비스

```json
{
  "mcpServers": {
    "time": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "mcp/time"]
    }
  }
}
```

## 서버별 기능 요약

### Fetch MCP 서버
웹 콘텐츠 가져오기 기능을 제공하며, LLM이 웹 페이지에서 콘텐츠를 검색하고 처리할 수 있게 합니다. HTML을 마크다운으로 변환하여 더 쉽게 소비할 수 있게 합니다.

### Filesystem MCP 서버
안전한 파일 작업을 구성 가능한 접근 제어와 함께 제공합니다. 파일 시스템에 대한 읽기/쓰기 작업을 수행할 수 있습니다.

### Memory MCP 서버
지식 그래프 기반 영구 메모리 시스템을 제공합니다. 대화 기록과 컨텍스트를 유지하는 데 중점을 둡니다.

### Puppeteer MCP 서버
브라우저 자동화 및 웹 스크래핑 기능을 제공합니다. 웹 페이지 탐색, 데이터 추출 등의 작업을 수행할 수 있습니다.

### Sequential Thinking MCP 서버
동적 및 반성적 문제 해결을 위한 사고 시퀀스를 제공합니다. 복잡한 문제 해결을 위한 단계별 접근 방식을 지원합니다.

### Time MCP 서버
시간 및 시간대 변환 기능을 제공합니다. IANA 시간대 이름을 사용하여 현재 시간 정보를 얻고 시간대 변환을 수행할 수 있습니다.

## 주의사항

각 MCP 서버의 자세한 사용법과 구성 옵션은 해당 서버의 README.md 파일을 참조하세요.
이 프로젝트의 모든 MCP 서버는 MIT 라이선스 하에 제공됩니다.
