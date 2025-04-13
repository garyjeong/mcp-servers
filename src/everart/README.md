# EverArt MCP 서버

Claude Desktop에서 EverArt API를 사용하는 이미지 생성 서버입니다.

## 설치
```bash
npm install
export EVERART_API_KEY=your_key_here
```

## 구성
Claude Desktop 구성에 추가하세요:

### Docker
```json
{
  "mcpServers": {
    "everart": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "EVERART_API_KEY", "mcp/everart"],
      "env": {
        "EVERART_API_KEY": "your_key_here"
      }
    }
  }
}
```

### NPX

```json
{
  "mcpServers": {
    "everart": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-everart"],
      "env": {
        "EVERART_API_KEY": "your_key_here"
      }
    }
  }
}
```

## 도구

### generate_image
여러 모델 옵션으로 이미지를 생성합니다. 결과를 브라우저에서 열고 URL을 반환합니다.

매개변수:
```typescript
{
  prompt: string,       // 이미지 설명
  model?: string,       // 모델 ID (기본값: "207910310772879360")
  image_count?: number  // 이미지 수 (기본값: 1)
}
```

모델:
- 5000: FLUX1.1 (표준)
- 9000: FLUX1.1-ultra
- 6000: SD3.5
- 7000: Recraft-Real
- 8000: Recraft-Vector

모든 이미지는 1024x1024 해상도로 생성됩니다.

사용 예:
```javascript
const result = await client.callTool({
  name: "generate_image",
  arguments: {
    prompt: "우아하게 앉아있는 고양이",
    model: "7000",
    image_count: 1
  }
});
```

응답 형식:
```
이미지가 성공적으로 생성되었습니다!
이미지가 기본 브라우저에서 열렸습니다.

생성 세부 정보:
- 모델: 7000
- 프롬프트: "우아하게 앉아있는 고양이"
- 이미지 URL: https://storage.googleapis.com/...

위의 URL을 클릭하여 이미지를 다시 볼 수도 있습니다.
```

## Docker로 빌드하기

```sh
docker build -t mcp/everart -f src/everart/Dockerfile . 
```
