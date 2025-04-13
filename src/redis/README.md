# Redis

Redis 데이터베이스 접근을 제공하는 모델 컨텍스트 프로토콜 서버입니다. 이 서버는 LLM이 표준화된 도구 세트를 통해 Redis 키-값 저장소와 상호작용할 수 있게 합니다.

## 사전 요구 사항

1. Redis 서버가 설치되어 실행 중이어야 함
   - [Redis 다운로드](https://redis.io/download)
   - Windows 사용자: [Windows Subsystem for Linux (WSL)](https://redis.io/docs/getting-started/installation/install-redis-on-windows/) 또는 [Memurai](https://www.memurai.com/)(Redis 호환 Windows 서버) 사용
   - 기본 포트: 6379

## 일반적인 문제 및 해결책

### 연결 오류

**ECONNREFUSED**
  - **원인**: Redis 서버가 실행되지 않거나 접근할 수 없음
  - **해결책**: 
    - Redis가 실행 중인지 확인: `redis-cli ping`은 "PONG"을 반환해야 함
    - Redis 서비스 상태 확인: `systemctl status redis` (Linux) 또는 `brew services list` (macOS)
    - 올바른 포트(기본값 6379)가 방화벽에 의해 차단되지 않았는지 확인
    - Redis URL 형식 확인: `redis://hostname:port`

### 서버 동작

- 서버는 최대 5회 재시도와 함께 지수 백오프를 구현
- 초기 재시도 지연: 1초, 최대 지연: 30초
- 무한 재연결 루프를 방지하기 위해 최대 재시도 후 서버 종료

## 구성 요소

### 도구

- **set**
  - 선택적 만료와 함께 Redis 키-값 쌍 설정
  - 입력:
    - `key` (문자열): Redis 키
    - `value` (문자열): 저장할 값
    - `expireSeconds` (숫자, 선택 사항): 초 단위 만료 시간

- **get**
  - Redis에서 키로 값 가져오기
  - 입력: `key` (문자열): 검색할 Redis 키

- **delete**
  - Redis에서 하나 이상의 키 삭제
  - 입력: `key` (문자열 | 문자열[]): 삭제할 키 또는 키 배열

- **list**
  - 패턴과 일치하는 Redis 키 나열
  - 입력: `pattern` (문자열, 선택 사항): 키 일치 패턴 (기본값: *)

## Claude Desktop에서 사용

Claude Desktop 앱에서 이 서버를 사용하려면 `claude_desktop_config.json`의 "mcpServers" 섹션에 다음 구성을 추가하세요:

### Docker

* macOS에서 docker를 실행할 때 서버가 호스트 네트워크에서 실행 중인 경우(예: localhost) host.docker.internal을 사용하세요
* Redis URL은 인자로 지정할 수 있으며, 기본값은 "redis://localhost:6379"입니다

```json
{
  "mcpServers": {
    "redis": {
      "command": "docker",
      "args": [
        "run", 
        "-i", 
        "--rm", 
        "mcp/redis", 
        "redis://host.docker.internal:6379"]
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "redis": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-redis",
        "redis://localhost:6379"
      ]
    }
  }
}
```

## 빌드

Docker:

```sh
docker build -t mcp/redis -f src/redis/Dockerfile . 
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
