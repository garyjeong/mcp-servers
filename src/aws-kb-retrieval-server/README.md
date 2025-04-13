# AWS 지식 베이스 검색 MCP 서버

Bedrock Agent 런타임을 사용하여 AWS 지식 베이스에서 정보를 검색하기 위한 MCP 서버 구현입니다.

## 특징

- **RAG (검색 증강 생성)**: 쿼리와 지식 베이스 ID를 기반으로 AWS 지식 베이스에서
 컨텍스트를 검색합니다.
- **다중 결과 검색 지원**: 사용자 지정 가능한 수의 결과를 검색하는 옵션을 제공합니다.

## 도구

- **retrieve_from_aws_kb**
  - AWS 지식 베이스를 사용하여 검색 작업을 수행합니다.
  - 입력:
    - `query` (문자열): 검색을 위한 쿼리입니다.
    - `knowledgeBaseId` (문자열): AWS 지식 베이스의 ID입니다.
    - `n` (숫자, 선택 사항): 검색할 결과 수(기본값: 3)입니다.

## 구성

### AWS 자격 증명 설정

1. AWS 관리 콘솔에서 AWS 액세스 키 ID, 시크릿 액세스 키 및 리전을 얻습니다.
2. 이러한 자격 증명에 Bedrock Agent 런타임 작업에 대한 적절한 권한이 있는지 확인합니다.

### Claude Desktop에서 사용

`claude_desktop_config.json`에 다음을 추가하세요:

#### Docker

```json
{
  "mcpServers": {
    "aws-kb-retrieval": {
      "command": "docker",
      "args": [ "run", "-i", "--rm", "-e", "AWS_ACCESS_KEY_ID", "-e", "AWS_SECRET_ACCESS_KEY", "-e", "AWS_REGION", "mcp/aws-kb-retrieval-server" ],
      "env": {
        "AWS_ACCESS_KEY_ID": "YOUR_ACCESS_KEY_HERE",
        "AWS_SECRET_ACCESS_KEY": "YOUR_SECRET_ACCESS_KEY_HERE",
        "AWS_REGION": "YOUR_AWS_REGION_HERE"
      }
    }
  }
}
```

```json
{
  "mcpServers": {
    "aws-kb-retrieval": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-aws-kb-retrieval"
      ],
      "env": {
        "AWS_ACCESS_KEY_ID": "YOUR_ACCESS_KEY_HERE",
        "AWS_SECRET_ACCESS_KEY": "YOUR_SECRET_ACCESS_KEY_HERE",
        "AWS_REGION": "YOUR_AWS_REGION_HERE"
      }
    }
  }
}
```

## 빌드

Docker: 

```sh
docker build -t mcp/aws-kb-retrieval -f src/aws-kb-retrieval-server/Dockerfile . 
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.

이 README는 서버 패키지 이름이 `@modelcontextprotocol/server-aws-kb-retrieval`이라고 가정합니다. 설정에서 패키지 이름과 설치 세부 정보가 다른 경우 조정하세요. 또한 서버 스크립트가 올바르게 빌드되었고 모든 종속성이 `package.json`에서 적절히 관리되고 있는지 확인하세요.
