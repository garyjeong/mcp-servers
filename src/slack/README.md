# Slack MCP 서버

Slack API를 위한 MCP 서버로, Claude가 Slack 워크스페이스와 상호작용할 수 있게 합니다.

## 도구

1. `slack_list_channels`
   - 워크스페이스의 공개 채널 목록 조회
   - 선택적 입력:
     - `limit` (숫자, 기본값: 100, 최대: 200): 반환할 최대 채널 수
     - `cursor` (문자열): 다음 페이지를 위한 페이지네이션 커서
   - 반환: ID 및 정보가 포함된 채널 목록

2. `slack_post_message`
   - Slack 채널에 새 메시지 게시
   - 필수 입력:
     - `channel_id` (문자열): 게시할 채널의 ID
     - `text` (문자열): 게시할 메시지 텍스트
   - 반환: 메시지 게시 확인 및 타임스탬프

3. `slack_reply_to_thread`
   - 특정 메시지 스레드에 답장
   - 필수 입력:
     - `channel_id` (문자열): 스레드가 있는 채널
     - `thread_ts` (문자열): 부모 메시지의 타임스탬프
     - `text` (문자열): 답장 텍스트
   - 반환: 답장 확인 및 타임스탬프

4. `slack_add_reaction`
   - 메시지에 이모지 반응 추가
   - 필수 입력:
     - `channel_id` (문자열): 메시지가 있는 채널
     - `timestamp` (문자열): 반응할 메시지 타임스탬프
     - `reaction` (문자열): 콜론 없는 이모지 이름
   - 반환: 반응 확인

5. `slack_get_channel_history`
   - 채널의 최근 메시지 가져오기
   - 필수 입력:
     - `channel_id` (문자열): 채널 ID
   - 선택적 입력:
     - `limit` (숫자, 기본값: 10): 가져올 메시지 수
   - 반환: 내용 및 메타데이터가 포함된 메시지 목록

6. `slack_get_thread_replies`
   - 메시지 스레드의 모든 답장 가져오기
   - 필수 입력:
     - `channel_id` (문자열): 스레드가 있는 채널
     - `thread_ts` (문자열): 부모 메시지의 타임스탬프
   - 반환: 내용 및 메타데이터가 포함된 답장 목록


7. `slack_get_users`
   - 기본 프로필 정보가 포함된 워크스페이스 사용자 목록 가져오기
   - 선택적 입력:
     - `cursor` (문자열): 다음 페이지를 위한 페이지네이션 커서
     - `limit` (숫자, 기본값: 100, 최대: 200): 반환할 최대 사용자 수
   - 반환: 기본 프로필이 포함된 사용자 목록

8. `slack_get_user_profile`
   - 특정 사용자에 대한 상세 프로필 정보 가져오기
   - 필수 입력:
     - `user_id` (문자열): 사용자 ID
   - 반환: 상세 사용자 프로필 정보

## 설정

1. Slack 앱 생성:
   - [Slack 앱 페이지](https://api.slack.com/apps) 방문
   - "Create New App" 클릭
   - "From scratch" 선택
   - 앱 이름을 지정하고 워크스페이스 선택

2. 봇 토큰 스코프 구성:
   "OAuth & Permissions"로 이동하여 다음 스코프 추가:
   - `channels:history` - 공개 채널의 메시지 및 기타 콘텐츠 보기
   - `channels:read` - 기본 채널 정보 보기
   - `chat:write` - 앱으로 메시지 보내기
   - `reactions:write` - 메시지에 이모지 반응 추가
   - `users:read` - 사용자 및 기본 정보 보기

4. 워크스페이스에 앱 설치:
   - "Install to Workspace" 클릭하고 앱 승인
   - `xoxb-`로 시작하는 "Bot User OAuth Token" 저장

5. [이 가이드](https://slack.com/help/articles/221769328-Locate-your-Slack-URL-or-ID#find-your-workspace-or-org-id)를 따라 팀 ID(T로 시작)를 가져옵니다

### Claude Desktop에서 사용

`claude_desktop_config.json`에 다음을 추가하세요:

#### npx

```json
{
  "mcpServers": {
    "slack": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

#### docker

```json
{
  "mcpServers": {
    "slack": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "SLACK_BOT_TOKEN",
        "-e",
        "SLACK_TEAM_ID",
        "mcp/slack"
      ],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token",
        "SLACK_TEAM_ID": "T01234567"
      }
    }
  }
}
```

### 문제 해결

권한 오류가 발생하면 다음을 확인하세요:
1. 필요한 모든 스코프가 Slack 앱에 추가되었는지
2. 앱이 워크스페이스에 올바르게 설치되었는지
3. 토큰과 워크스페이스 ID가 구성에 올바르게 복사되었는지
4. 앱이 접근해야 하는 채널에 추가되었는지

## 빌드

Docker 빌드:

```bash
docker build -t mcp/slack -f src/slack/Dockerfile .
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
