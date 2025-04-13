# 순차적 사고 MCP 서버

구조화된 사고 과정을 통해 역동적이고 반성적인 문제 해결을 제공하는 MCP 서버 구현입니다.

## 특징

- 복잡한 문제를 관리 가능한 단계로 분해
- 이해가 깊어짐에 따라 생각을 수정하고 개선
- 대안적 추론 경로로 분기
- 총 생각 수를 동적으로 조정
- 해결책 가설 생성 및 검증

## 도구

### sequential_thinking

문제 해결 및 분석을 위한 상세하고 단계적인 사고 과정을 촉진합니다.

**입력:**
- `thought` (문자열): 현재 사고 단계
- `nextThoughtNeeded` (불리언): 다른 사고 단계가 필요한지 여부
- `thoughtNumber` (정수): 현재 사고 번호
- `totalThoughts` (정수): 필요한 총 사고 수 추정치
- `isRevision` (불리언, 선택 사항): 이전 사고를 수정하는지 여부
- `revisesThought` (정수, 선택 사항): 재고되는 사고 번호
- `branchFromThought` (정수, 선택 사항): 분기점 사고 번호
- `branchId` (문자열, 선택 사항): 분기 식별자
- `needsMoreThoughts` (불리언, 선택 사항): 더 많은 사고가 필요한지 여부

## 사용법

순차적 사고 도구는 다음과 같은 용도로 설계되었습니다:
- 복잡한 문제를 단계별로 분해
- 수정 여지가 있는 계획 및 설계
- 방향 수정이 필요할 수 있는 분석
- 전체 범위가 처음에 명확하지 않을 수 있는 문제
- 여러 단계에 걸쳐 컨텍스트를 유지해야 하는 작업
- 관련 없는 정보를 필터링해야 하는 상황

## 구성

### Claude Desktop에서 사용

`claude_desktop_config.json`에 다음을 추가하세요:

#### npx

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "sequentialthinking": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "mcp/sequentialthinking"
      ]
    }
  }
}
```

## 빌드

Docker:

```bash
docker build -t mcp/sequentialthinking -f src/sequentialthinking/Dockerfile .
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
