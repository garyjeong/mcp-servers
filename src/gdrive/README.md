# Google Drive 서버

이 MCP 서버는 Google Drive와 통합되어 파일 목록 조회, 읽기 및 검색 기능을 제공합니다.

## 구성 요소

### 도구

- **search**
  - Google Drive에서 파일 검색
  - 입력: `query` (문자열): 검색 쿼리
  - 일치하는 파일의 파일 이름 및 MIME 유형 반환

### 리소스

이 서버는 Google Drive 파일에 대한 접근을 제공합니다:

- **파일** (`gdrive:///<file_id>`)
  - 모든 파일 유형 지원
  - Google Workspace 파일은 자동으로 내보내기됩니다:
    - 문서 → 마크다운
    - 스프레드시트 → CSV
    - 프레젠테이션 → 일반 텍스트
    - 그림 → PNG
  - 다른 파일은 원래 형식으로 제공됩니다

## 시작하기

1. [새 Google Cloud 프로젝트 생성](https://console.cloud.google.com/projectcreate)
2. [Google Drive API 활성화](https://console.cloud.google.com/workspace-api/products)
3. [OAuth 동의 화면 구성](https://console.cloud.google.com/apis/credentials/consent) (테스트용으로는 "내부"가 적합)
4. OAuth 범위 `https://www.googleapis.com/auth/drive.readonly` 추가
5. 애플리케이션 유형 "Desktop App"으로 [OAuth 클라이언트 ID 생성](https://console.cloud.google.com/apis/credentials/oauthclient)
6. 클라이언트의 OAuth 키가 포함된 JSON 파일 다운로드
7. 키 파일 이름을 `gcp-oauth.keys.json`으로 변경하고 이 저장소의 루트에 배치 (예: `servers/gcp-oauth.keys.json`)

`npm run build` 또는 `npm run watch`로 서버를 빌드하세요.

### 인증

인증 및 자격 증명 저장 방법:

1. `auth` 인수와 함께 서버 실행: `node ./dist auth`
2. 시스템 브라우저에서 인증 플로우가 열립니다
3. 인증 과정을 완료하세요
4. 자격 증명이 이 저장소의 루트에 저장됩니다 (예: `servers/.gdrive-server-credentials.json`)

### 데스크톱 앱에서 사용

이 서버를 데스크톱 앱과 통합하려면 앱의 서버 구성에 다음을 추가하세요:

#### Docker

인증:

Google Cloud에서 OAuth 애플리케이션 설정을 완료했다고 가정하면, 이제 다음 명령으로 서버를 인증할 수 있습니다. `/path/to/gcp-oauth.keys.json`을 OAuth 키 파일 경로로 바꾸세요:

```bash
docker run -i --rm --mount type=bind,source=/path/to/gcp-oauth.keys.json,target=/gcp-oauth.keys.json -v mcp-gdrive:/gdrive-server -e GDRIVE_OAUTH_PATH=/gcp-oauth.keys.json -e "GDRIVE_CREDENTIALS_PATH=/gdrive-server/credentials.json" -p 3000:3000 mcp/gdrive auth
```

이 명령은 브라우저에서 열 URL을 출력합니다. 브라우저에서 이 URL을 열고 인증 과정을 완료하세요. 자격 증명은 `mcp-gdrive` 볼륨에 저장됩니다.

인증이 완료되면 앱의 서버 구성에서 서버를 사용할 수 있습니다:

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "mcp-gdrive:/gdrive-server", "-e", "GDRIVE_CREDENTIALS_PATH=/gdrive-server/credentials.json", "mcp/gdrive"]
    }
  }
}
```

#### NPX

```json
{
  "mcpServers": {
    "gdrive": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gdrive"
      ]
    }
  }
}
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
