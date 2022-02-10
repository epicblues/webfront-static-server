# '요건 다 내꺼' 이미지, 채팅 관리 서버
- https://github.com/epicblues/webfront-final-main

## 정적 이미지 파일 요청 처리
- 이미지 삭제 수정 등록
- 이미지 메타데이터(URL)는 MongoDB ATLAS가 관리
- PUSH 시 자동으로 AWS로 빌드 유발(Webhook & Jenkins & Docker)

## 채팅 / 실시간 공지 처리(Socket.io)
- 사용자 채팅, 알림 중개
- 알림 대상 요청(컨텐츠 작성, 좋아요 클릭)에 응답하기 전 알림 메시지를 생성하여 DB에 저장하고 전달한다.
- 클라이언트에서 socket에 전달한 chat 채널을 통해 채팅 메시지가 전달되고 서버는 DB에 해당 메시지를 저장하고 전달한다.


## 수정 1
- I/O 의 결과값을 메인 스레드가 기다리고 있는 것은 Node.js의 장점을 가리는  기능
- 메인 스레드는 promise로 I/O 작업을 호출한 다음 그 입출력 결과에 따른 callback을 받도록 하고
- 그동안 다른 사용자의 요청을 처리하는 것이 I/O 장치보다 처리속도가 빠른 CPU를 효율적으로 사용하는 것이 바람직하다.
```javascript
export const resizeAndDeleteOriginalImg = async (
  originalPath: string,
  outputPath: string
) => {
  try {
    await sharp(originalPath)
      .resize(640, 480)
      .withMetadata()
      .toFile(outputPath);
    fs.unlink(originalPath); // unlinkSync => unlink
  } catch (error) {
    throw error;
  }
};
```
