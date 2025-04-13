# GitLab MCP 서버

GitLab API를 위한 MCP 서버로, 프로젝트 관리, 파일 작업 등을 가능하게 합니다.

### 특징

- **자동 브랜치 생성**: 파일 생성/업데이트 또는 변경 사항 푸시 시, 브랜치가 존재하지 않으면 자동으로 생성됩니다
- **포괄적인 오류 처리**: 일반적인 문제에 대한 명확한 오류 메시지 제공
- **Git 히스토리 보존**: 강제 푸시 없이 적절한 Git 히스토리를 유지하는 작업
- **배치 작업**: 단일 파일 및 다중 파일 작업 모두 지원


## 도구

1. `create_or_update_file`
   - 프로젝트에서 단일 파일 생성 또는 업데이트
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `file_path` (문자열): 파일을 생성/업데이트할 경로
     - `content` (문자열): 파일 내용
     - `commit_message` (문자열): 커밋 메시지
     - `branch` (문자열): 파일을 생성/업데이트할 브랜치
     - `previous_path` (선택적 문자열): 이동/이름 변경할 파일의 경로
   - 반환: 파일 내용 및 커밋 세부 정보

2. `push_files`
   - 단일 커밋으로 여러 파일 푸시
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `branch` (문자열): 푸시할 브랜치
     - `files` (배열): 푸시할 파일, 각각 `file_path`와 `content` 포함
     - `commit_message` (문자열): 커밋 메시지
   - 반환: 업데이트된 브랜치 참조

3. `search_repositories`
   - GitLab 프로젝트 검색
   - 입력:
     - `search` (문자열): 검색 쿼리
     - `page` (선택적 숫자): 페이지네이션을 위한 페이지 번호
     - `per_page` (선택적 숫자): 페이지당 결과 수 (기본값 20)
   - 반환: 프로젝트 검색 결과

4. `create_repository`
   - 새 GitLab 프로젝트 생성
   - 입력:
     - `name` (문자열): 프로젝트 이름
     - `description` (선택적 문자열): 프로젝트 설명
     - `visibility` (선택적 문자열): 'private', 'internal', 또는 'public'
     - `initialize_with_readme` (선택적 불리언): README로 초기화할지 여부
   - 반환: 생성된 프로젝트 세부 정보

5. `get_file_contents`
   - 파일 또는 디렉토리 내용 가져오기
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `file_path` (문자열): 파일/디렉토리 경로
     - `ref` (선택적 문자열): 내용을 가져올 브랜치/태그/커밋
   - 반환: 파일/디렉토리 내용

6. `create_issue`
   - 새 이슈 생성
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `title` (문자열): 이슈 제목
     - `description` (선택적 문자열): 이슈 설명
     - `assignee_ids` (선택적 숫자[]): 할당할 사용자 ID
     - `labels` (선택적 문자열[]): 추가할 레이블
     - `milestone_id` (선택적 숫자): 마일스톤 ID
   - 반환: 생성된 이슈 세부 정보

7. `create_merge_request`
   - 새 병합 요청 생성
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `title` (문자열): MR 제목
     - `description` (선택적 문자열): MR 설명
     - `source_branch` (문자열): 변경 사항이 포함된 브랜치
     - `target_branch` (문자열): 병합할 대상 브랜치
     - `draft` (선택적 불리언): 초안 MR로 생성할지 여부
     - `allow_collaboration` (선택적 불리언): 업스트림 멤버의 커밋 허용 여부
   - 반환: 생성된 병합 요청 세부 정보

8. `fork_repository`
   - 프로젝트 포크
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `namespace` (선택적 문자열): 포크할 네임스페이스
   - 반환: 포크된 프로젝트 세부 정보

9. `create_branch`
   - 새 브랜치 생성
   - 입력:
     - `project_id` (문자열): 프로젝트 ID 또는 URL 인코딩된 경로
     - `branch` (문자열): 새 브랜치 이름
     - `ref` (선택적 문자열): 새 브랜치의 소스 브랜치/커밋
   - 반환: 생성된 브랜치 참조

## 설정

### 개인 액세스 토큰
적절한 권한으로 [GitLab 개인 액세스 토큰 생성](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html):
   - GitLab에서 사용자 설정 > 액세스 토큰으로 이동
   - 필요한 범위 선택:
     - 전체 API 액세스를 위한 `api`
     - 읽기 전용 액세스를 위한 `read_api`
     - 저장소 작업을 위한 `read_repository` 및 `write_repository`
   - 토큰을 생성하고 안전하게 저장

### Claude Desktop에서 사용
`claude_desktop_config.json`에 다음을 추가하세요:

#### Docker
```json
{
  "mcpServers": { 
    "gitlab": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "GITLAB_PERSONAL_ACCESS_TOKEN",
        "-e",
        "GITLAB_API_URL",
        "mcp/gitlab"
      ],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>",
        "GITLAB_API_URL": "https://gitlab.com/api/v4" // 선택 사항, 자체 호스팅 인스턴스용
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gitlab"
      ],
      "env": {
        "GITLAB_PERSONAL_ACCESS_TOKEN": "<YOUR_TOKEN>",
        "GITLAB_API_URL": "https://gitlab.com/api/v4" // 선택 사항, 자체 호스팅 인스턴스용
      }
    }
  }
}
```

## 빌드

Docker 빌드:

```bash
docker build -t vonwig/gitlab:mcp -f src/gitlab/Dockerfile .
```

## 환경 변수

- `GITLAB_PERSONAL_ACCESS_TOKEN`: GitLab 개인 액세스 토큰 (필수)
- `GITLAB_API_URL`: GitLab API의 기본 URL (선택 사항, 기본값: `https://gitlab.com/api/v4`)

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
