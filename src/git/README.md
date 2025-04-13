# mcp-server-git: Git MCP 서버

## 개요

Git 저장소 상호작용 및 자동화를 위한 모델 컨텍스트 프로토콜 서버입니다. 이 서버는 대규모 언어 모델(LLM)을 통해 Git 저장소를 읽고, 검색하고, 조작하는 도구를 제공합니다.

mcp-server-git은 현재 초기 개발 단계에 있다는 점에 유의하세요. 서버를 계속 개발하고 개선함에 따라 기능과 사용 가능한 도구는 변경되고 확장될 수 있습니다.

### 도구

1. `git_status`
   - 작업 트리 상태를 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
   - 반환: 작업 디렉토리의 현재 상태를 텍스트 출력으로 제공

2. `git_diff_unstaged`
   - 아직 스테이징되지 않은 작업 디렉토리의 변경 사항을 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
   - 반환: 스테이징되지 않은 변경 사항의 차이점 출력

3. `git_diff_staged`
   - 커밋을 위해 스테이징된 변경 사항을 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
   - 반환: 스테이징된 변경 사항의 차이점 출력

4. `git_diff`
   - 브랜치나 커밋 간의 차이점을 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `target` (문자열): 비교할 대상 브랜치나 커밋
   - 반환: 현재 상태와 대상의 비교 차이점 출력

5. `git_commit`
   - 저장소에 변경 사항을 기록합니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `message` (문자열): 커밋 메시지
   - 반환: 새 커밋 해시와 함께 확인

6. `git_add`
   - 스테이징 영역에 파일 내용을 추가합니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `files` (문자열[]): 스테이징할 파일 경로 배열
   - 반환: 스테이징된 파일 확인

7. `git_reset`
   - 모든 스테이징된 변경 사항을 스테이징 해제합니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
   - 반환: 리셋 작업 확인

8. `git_log`
   - 커밋 로그를 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `max_count` (숫자, 선택 사항): 표시할 최대 커밋 수(기본값: 10)
   - 반환: 해시, 작성자, 날짜 및 메시지가 포함된 커밋 항목 배열

9. `git_create_branch`
   - 새 브랜치를 생성합니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `branch_name` (문자열): 새 브랜치 이름
     - `start_point` (문자열, 선택 사항): 새 브랜치의 시작점
   - 반환: 브랜치 생성 확인
10. `git_checkout`
   - 브랜치를 전환합니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `branch_name` (문자열): 체크아웃할 브랜치 이름
   - 반환: 브랜치 전환 확인
11. `git_show`
   - 커밋의 내용을 보여줍니다
   - 입력:
     - `repo_path` (문자열): Git 저장소 경로
     - `revision` (문자열): 표시할 수정 버전(커밋 해시, 브랜치 이름, 태그)
   - 반환: 지정된 커밋의 내용
12. `git_init`
   - Git 저장소를 초기화합니다
   - 입력:
     - `repo_path` (문자열): git 저장소를 초기화할 디렉토리 경로
   - 반환: 저장소 초기화 확인

## 설치

### uv 사용 (권장)

[`uv`](https://docs.astral.sh/uv/)를 사용할 때는 특별한 설치가 필요하지 않습니다. 
[`uvx`](https://docs.astral.sh/uv/guides/tools/)를 사용하여 *mcp-server-git*을 직접 실행할 것입니다.

### PIP 사용

또는 pip를 통해 `mcp-server-git`을 설치할 수 있습니다:

```
pip install mcp-server-git
```

설치 후, 다음과 같이 스크립트로 실행할 수 있습니다:

```
python -m mcp_server_git
```

## 구성

### Claude Desktop에서 사용

`claude_desktop_config.json`에 다음을 추가하세요:

<details>
<summary>uvx 사용</summary>

```json
"mcpServers": {
  "git": {
    "command": "uvx",
    "args": ["mcp-server-git", "--repository", "path/to/git/repo"]
  }
}
```
</details>

<details>
<summary>docker 사용</summary>

* 참고: '/Users/username'을 이 도구로 접근하려는 경로로 바꿉니다

```json
"mcpServers": {
  "git": {
    "command": "docker",
    "args": ["run", "--rm", "-i", "--mount", "type=bind,src=/Users/username,dst=/Users/username", "mcp/git"]
  }
}
```
</details>

<details>
<summary>pip 설치 사용</summary>

```json
"mcpServers": {
  "git": {
    "command": "python",
    "args": ["-m", "mcp_server_git", "--repository", "path/to/git/repo"]
  }
}
```
</details>

### [Zed](https://github.com/zed-industries/zed)에서 사용

Zed settings.json에 추가하세요:

<details>
<summary>uvx 사용</summary>

```json
"context_servers": [
  "mcp-server-git": {
    "command": {
      "path": "uvx",
      "args": ["mcp-server-git"]
    }
  }
],
```
</details>

<details>
<summary>pip 설치 사용</summary>

```json
"context_servers": {
  "mcp-server-git": {
    "command": {
      "path": "python",
      "args": ["-m", "mcp_server_git"]
    }
  }
},
```
</details>

## 디버깅

MCP 인스펙터를 사용하여 서버를 디버깅할 수 있습니다. uvx 설치의 경우:

```
npx @modelcontextprotocol/inspector uvx mcp-server-git
```

또는 특정 디렉토리에 패키지를 설치했거나 개발 중인 경우:

```
cd path/to/servers/src/git
npx @modelcontextprotocol/inspector uv run mcp-server-git
```

`tail -n 20 -f ~/Library/Logs/Claude/mcp*.log` 명령을 실행하면 서버의 로그를 볼 수 있으며 문제 해결에 도움이 됩니다.

## 개발

로컬 개발을 하는 경우, 변경 사항을 테스트하는 두 가지 방법이 있습니다:

1. MCP 인스펙터를 실행하여 변경 사항을 테스트합니다. 실행 지침은 [디버깅](#디버깅)을 참조하세요.

2. Claude 데스크톱 앱을 사용하여 테스트합니다. `claude_desktop_config.json`에 다음을 추가하세요:

### Docker

```json
{
  "mcpServers": {
    "git": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "--mount", "type=bind,src=/Users/username/Desktop,dst=/projects/Desktop",
        "--mount", "type=bind,src=/path/to/other/allowed/dir,dst=/projects/other/allowed/dir,ro",
        "--mount", "type=bind,src=/path/to/file.txt,dst=/projects/path/to/file.txt",
        "mcp/git"
      ]
    }
  }
}
```

### UVX
```json
{
"mcpServers": {
  "git": {
    "command": "uv",
    "args": [ 
      "--directory",
      "/<path to mcp-servers>/mcp-servers/src/git",
      "run",
      "mcp-server-git"
    ]
  }
}
```

## Build

Docker build:

```bash
cd src/git
docker build -t mcp/git .
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
