# Google Maps MCP 서버

Google Maps API용 MCP 서버로, 지오코딩, 장소 검색, 거리 계산 등을 가능하게 합니다.

## 특징

지원되는 Google Maps API 기능:

- **지오코딩**: 주소를 좌표로 변환
- **역지오코딩**: 좌표를 주소로 변환
- **장소 검색**: 텍스트 검색어로 장소 찾기
- **장소 상세 정보**: 특정 장소에 대한 상세 정보 가져오기
- **거리 계산**: 여러 출발지와 목적지 간 거리 및 이동 시간 계산
- **고도 데이터**: 특정 위치의 고도 정보 검색
- **경로 안내**: 출발지에서 목적지까지의 경로 찾기

## 도구

1. `maps_geocode`
   - 주소를 지리적 좌표(위도/경도)로 변환
   - 입력:
     - `address` (문자열): 변환할 주소 또는 장소 이름
   - 반환: 좌표 및 정규화된 주소 정보

2. `maps_reverse_geocode`
   - 지리적 좌표를 주소로 변환
   - 입력:
     - `latlng` (문자열): 형식 "latitude,longitude"의 좌표
   - 반환: 해당 좌표의 주소 정보

3. `maps_search_places`
   - 장소 검색 수행
   - 입력:
     - `query` (문자열): 검색할 텍스트 쿼리
     - `location` (선택적 문자열): 검색 중심 좌표 (형식: "latitude,longitude")
     - `radius` (선택적 숫자): 검색 반경(미터)
   - 반환: 검색 결과 목록

4. `maps_place_details`
   - 특정 장소에 대한 상세 정보 검색
   - 입력:
     - `place_id` (문자열): Google Maps Place ID
   - 반환: 장소에 대한 상세 정보

5. `maps_distance_matrix`
   - 여러 출발지와 목적지 간의 거리 및 이동 시간 계산
   - 입력:
     - `origins` (문자열 또는 문자열[]): 출발지 주소 또는 좌표
     - `destinations` (문자열 또는 문자열[]): 목적지 주소 또는 좌표
     - `mode` (선택적 문자열): 이동 수단(driving, walking, bicycling, transit)
   - 반환: 각 출발지-목적지 쌍의 거리 및 이동 시간

6. `maps_elevation`
   - 위치의 고도 정보 검색
   - 입력:
     - `locations` (문자열 또는 문자열[]): 고도를 확인할 좌표(형식: "latitude,longitude")
   - 반환: 고도 정보(미터)

7. `maps_directions`
   - 출발지에서 목적지까지의 경로 안내
   - 입력:
     - `origin` (문자열): 출발지 주소 또는 좌표
     - `destination` (문자열): 목적지 주소 또는 좌표
     - `mode` (선택적 문자열): 이동 수단(driving, walking, bicycling, transit)
     - `waypoints` (선택적 문자열[]): 경유지 목록
     - `alternatives` (선택적 불리언): 대체 경로 요청 여부
   - 반환: 경로 정보, 단계별 안내 및 지리적 인코딩 경로

## 설정

### Google Maps API 키
[Google Cloud Console](https://console.cloud.google.com/)에서 API 키를 얻으세요:
1. Google Cloud 계정 생성/로그인
2. 프로젝트 생성/선택
3. Google Maps API 활성화(Maps JavaScript API, Geocoding API, Places API 등)
4. 사용자 인증 정보에서 API 키 생성

### Claude Desktop에서 사용
`claude_desktop_config.json`에 다음을 추가하세요:

#### Docker
```json
{
  "mcpServers": {
    "googleMaps": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "GOOGLE_MAPS_API_KEY",
        "mcp/google-maps"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

#### NPX
```json
{
  "mcpServers": {
    "googleMaps": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-google-maps"
      ],
      "env": {
        "GOOGLE_MAPS_API_KEY": "<YOUR_API_KEY>"
      }
    }
  }
}
```

## 빌드

Docker 빌드:

```bash
docker build -t mcp/google-maps -f src/google-maps/Dockerfile .
```

## 라이선스

이 MCP 서버는 MIT 라이선스 하에 제공됩니다. 이는 MIT 라이선스의 약관 및 조건에 따라 소프트웨어를 자유롭게 사용, 수정 및 배포할 수 있음을 의미합니다. 자세한 내용은 프로젝트 저장소의 LICENSE 파일을 참조하세요.
