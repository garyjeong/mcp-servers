# Time MCP 서버

시간 및 시간대 변환 기능을 제공하는 모델 컨텍스트 프로토콜 서버입니다. 이 서버는 LLM이 자동 시스템 시간대 감지 기능과 함께 IANA 시간대 이름을 사용하여 현재 시간 정보를 얻고 시간대 변환을 수행할 수 있게 합니다.

### 사용 가능한 도구

- `get_current_time` - 특정 시간대 또는 시스템 시간대의 현재 시간을 얻습니다.
  - 필수 인자:
    - `timezone` (문자열): IANA 시간대 이름 (예: 'America/New_York', 'Europe/London')

- `convert_time` - 시간대 간 시간을 변환합니다.
  - 필수 인자:
    - `source_timezone` (문자열): 원본 IANA 시간대 이름
    - `time` (문자열): 24시간 형식의 시간 (HH:MM)
    - `target_timezone` (문자열): 대상 IANA 시간대 이름

## 설치

### uv 사용 (권장)

[`uv`](https://docs.astral.sh/uv/)를 사용할 때는 특별한 설치가 필요하지 않습니다. 
[`uvx`](https://docs.astral.sh/uv/guides/tools/)를 사용하여 *mcp-server-time*을 직접 실행할 것입니다.

### PIP 사용

또는 pip를 통해 `mcp-server-time`을 설치할 수 있습니다:

```bash
pip install mcp-server-time
```

설치 후, 다음과 같이 스크립트로 실행할 수 있습니다:

```bash
python -m mcp_server_time
```

## 구성

### Claude.app 설정

Claude 설정에 추가하세요:

<details>
<summary>uvx 사용</summary>

```json
"mcpServers": {
  "time": {
    "command": "uvx",
    "args": ["mcp-server-time"]
  }
}
```
</details>

<details>
<summary>docker 사용</summary>

```json
"mcpServers": {
  "time": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "mcp/time"]
  }
}
```
</details>

<details>
<summary>pip 설치 사용</summary>

```json
"mcpServers": {
  "time": {
    "command": "python",
    "args": ["-m", "mcp_server_time"]
  }
}
```
</details>

### Zed 설정

Zed settings.json에 추가하세요:

<details>
<summary>uvx 사용</summary>

```json
"context_servers": [
  "mcp-server-time": {
    "command": "uvx",
    "args": ["mcp-server-time"]
  }
],
```
</details>

<details>
<summary>pip 설치 사용</summary>

```json
"context_servers": {
  "mcp-server-time": {
    "command": "python",
    "args": ["-m", "mcp_server_time"]
  }
},
```
</details>

### 사용자 지정 - 시스템 시간대

기본적으로 서버는 자동으로 시스템의 시간대를 감지합니다. 구성의 `args` 목록에 `--local-timezone` 인자를 추가하여 이를 재정의할 수 있습니다.

예시:
```json
{
  "command": "python",
  "args": ["-m", "mcp_server_time", "--local-timezone=America/New_York"]
}
```

## 상호작용 예시

1. 현재 시간 얻기:
```json
{
  "name": "get_current_time",
  "arguments": {
    "timezone": "Europe/Warsaw"
  }
}
```
응답:
```json
{
  "timezone": "Europe/Warsaw",
  "datetime": "2024-01-01T13:00:00+01:00",
  "is_dst": false
}
```

2. 시간대 간 시간 변환:
```json
{
  "name": "convert_time",
  "arguments": {
    "source_timezone": "America/New_York",
    "time": "16:30",
    "target_timezone": "Asia/Tokyo"
  }
}
```
응답:
```json
{
  "source": {
    "timezone": "America/New_York",
    "datetime": "2024-01-01T12:30:00-05:00",
    "is_dst": false
  },
  "target": {
    "timezone": "Asia/Tokyo",
    "datetime": "2024-01-01T12:30:00+09:00",
    "is_dst": false
  },
  "time_difference": "+13.0h",
}
```

## 디버깅

MCP 인스펙터를 사용하여 서버를 디버깅할 수 있습니다. uvx 설치의 경우:

```bash
npx @modelcontextprotocol/inspector uvx mcp-server-time
```

또는 특정 디렉토리에 패키지를 설치했거나 개발 중인 경우:

```bash
cd path/to/servers/src/time
npx @modelcontextprotocol/inspector uv run mcp-server-time
```

## Claude를 위한 질문 예시

1. "지금 몇 시인가요?" (시스템 시간대 사용)
2. "도쿄에서 지금 몇 시인가요?"
3. "뉴욕에서 오후 4시일 때 런던에서는 몇 시인가요?"
4. "도쿄 시간으로 오전 9시 30분을 뉴욕 시간으로 변환해주세요"

## 빌드

Docker 빌드:

```bash
cd src/time
docker build -t mcp/time .
```

## 기여하기

mcp-server-time을 확장하고 개선하는 데 도움이 되는 기여를 권장합니다. 새로운 시간 관련 도구를 추가하거나, 기존 기능을 향상시키거나, 문서를 개선하고 싶다면 여러분의 의견은 소중합니다.

다른 MCP 서버 및 구현 패턴의 예는 다음에서 확인할 수 있습니다:
https://github.com/modelcontextprotocol/servers

풀 리퀘스트를 환영합니다! mcp-server-time을 더욱 강력하고 유용하게 만들기 위한 새로운 아이디어, 버그 수정 또는 개선 사항을 자유롭게 기여해 주세요.

## 라이선스

mcp-server-time은 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
