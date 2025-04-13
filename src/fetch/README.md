# Fetch MCP 서버

웹 콘텐츠 가져오기 기능을 제공하는 모델 컨텍스트 프로토콜 서버입니다. 이 서버는 LLM이 웹 페이지에서 콘텐츠를 검색하고 처리할 수 있게 하며, 더 쉬운 소비를 위해 HTML을 마크다운으로 변환합니다.

fetch 도구는 응답을 잘라내지만, `start_index` 인자를 사용하여 콘텐츠 추출을 시작할 위치를 지정할 수 있습니다. 이를 통해 모델은 필요한 정보를 찾을 때까지 웹페이지를 청크 단위로 읽을 수 있습니다.

### 사용 가능한 도구

- `fetch` - 인터넷에서 URL을 가져와 그 내용을 마크다운으로 추출합니다.
    - `url` (문자열, 필수): 가져올 URL
    - `max_length` (정수, 선택사항): 반환할 최대 문자 수 (기본값: 5000)
    - `start_index` (정수, 선택사항): 이 문자 인덱스부터 콘텐츠 시작 (기본값: 0)
    - `raw` (불리언, 선택사항): 마크다운 변환 없이 원시 콘텐츠 가져오기 (기본값: false)

### 프롬프트

- **fetch**
  - URL을 가져와 그 내용을 마크다운으로 추출
  - 인자:
    - `url` (문자열, 필수): 가져올 URL

## 설치

선택 사항: node.js를 설치하면 fetch 서버가 더 강력한 HTML 단순화 도구를 사용하게 됩니다.

### uv 사용 (권장)

[`uv`](https://docs.astral.sh/uv/)를 사용할 때는 특별한 설치가 필요하지 않습니다. 
[`uvx`](https://docs.astral.sh/uv/guides/tools/)를 사용하여 *mcp-server-fetch*를 직접 실행할 것입니다.

### PIP 사용

또는 pip를 통해 `mcp-server-fetch`를 설치할 수 있습니다:

```
pip install mcp-server-fetch
```

설치 후, 다음과 같이 스크립트로 실행할 수 있습니다:

```
python -m mcp_server_fetch
```

## 구성

### Claude.app 설정

Claude 설정에 추가하세요:

<details>
<summary>uvx 사용</summary>

```json
"mcpServers": {
  "fetch": {
    "command": "uvx",
    "args": ["mcp-server-fetch"]
  }
}
```
</details>

<details>
<summary>docker 사용</summary>

```json
"mcpServers": {
  "fetch": {
    "command": "docker",
    "args": ["run", "-i", "--rm", "mcp/fetch"]
  }
}
```
</details>

<details>
<summary>pip 설치 사용</summary>

```json
"mcpServers": {
  "fetch": {
    "command": "python",
    "args": ["-m", "mcp_server_fetch"]
  }
}
```
</details>

### 사용자 지정 - robots.txt

기본적으로 서버는 요청이 모델(도구를 통해)에서 온 경우 웹사이트의 robots.txt 파일을 준수하지만, 요청이 사용자 시작(프롬프트를 통해)된 경우에는 준수하지 않습니다. 구성의 `args` 목록에 `--ignore-robots-txt` 인자를 추가하여 이 기능을 비활성화할 수 있습니다.

### 사용자 지정 - User-agent

기본적으로 요청이 모델(도구를 통해)에서 왔는지 또는 사용자 시작(프롬프트를 통해)되었는지에 따라 서버는 다음 user-agent 중 하나를 사용합니다.
```
ModelContextProtocol/1.0 (Autonomous; +https://github.com/modelcontextprotocol/servers)
```
또는
```
ModelContextProtocol/1.0 (User-Specified; +https://github.com/modelcontextprotocol/servers)
```

구성의 `args` 목록에 `--user-agent=YourUserAgent` 인자를 추가하여 이를 사용자 지정할 수 있습니다.

### 사용자 지정 - 프록시

`--proxy-url` 인자를 사용하여 서버가 프록시를 사용하도록 구성할 수 있습니다.

## 디버깅

MCP 인스펙터를 사용하여 서버를 디버깅할 수 있습니다. uvx 설치의 경우:

```
npx @modelcontextprotocol/inspector uvx mcp-server-fetch
```

또는 특정 디렉토리에 패키지를 설치했거나 개발 중인 경우:

```
cd path/to/servers/src/fetch
npx @modelcontextprotocol/inspector uv run mcp-server-fetch
```

## 기여하기

mcp-server-fetch를 확장하고 개선하는 데 도움이 되는 기여를 권장합니다. 새로운 도구를 추가하거나, 기존 기능을 향상시키거나, 문서를 개선하고 싶다면 여러분의 의견은 소중합니다.

다른 MCP 서버 및 구현 패턴의 예는 다음에서 확인할 수 있습니다:
https://github.com/modelcontextprotocol/servers

풀 리퀘스트를 환영합니다! mcp-server-fetch를 더욱 강력하고 유용하게 만들기 위한 새로운 아이디어, 버그 수정 또는 개선 사항을 자유롭게 기여해 주세요.

## 라이선스

mcp-server-fetch는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
