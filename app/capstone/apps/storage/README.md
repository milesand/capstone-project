# Upload API

현재 [flow.js](https://github.com/flowjs/flow.js)를 이용한 업로드를 지원합니다.

`example` 디렉토리에 예시 클라이언트 코드가 포함되어있습니다.


## 사용법

1. 로그인을 한 상태여야 합니다.
2. `/api/upload/flow`에 파일의 크기를 바이트 단위로 `fileSize` 필드에 담아 `multipart/form-data` 형식으로 인코딩하여 `POST`합니다.
3. 정상적으로 처리된 경우 HTTP 201 Created가 반환되며, `Location` 헤더에 `/api/upload/flow/<upload-id>` 형식의 경로가 반환됩니다.
4. `target`을 반환된 경로로, `simultaneousUploads`를 1로 하여 해당 경로에 `flow`를 이용하여
파일을 업로드합니다.
5. 업로드가 정상적으로 종료된 후, 파일은 `files/complete/<user-id>` 디렉토리에 저장됩니다.


## 주요 모델

* `UserStorageCapacity` 모델은 사용자가 사용할 수 있는 남은 저장 공간의 크기를 바이트 단위로 기록합니다. 추후 삭제 등의 기능 구현시 이 모델에 접근할 필요가 있습니다.

* `PartialUpload` 모델은 진행중인 업로드를 나타냅니다. 해당 객체의 id는 `files/partial`에 저장되는 부분파일의 이름과 일치합니다. 해당 객체의 `is_complete` 어트리뷰트를 `True`로 바꾸지 않고 삭제할 경우, 연결된 파일의 삭제와 사용자 저장 공간 복구가 이루어집니다(`signals.py`).


## TODO

* 1보다 큰 `simultaneousUploads` 옵션 지원
* 주기적으로 만료된 부분 업로드 메타데이터 및 파일 제거 (Cron)
* 디렉토리
* 파일/디렉토리 메타데이터를 사용자의 저장 용량 계산 시 고려해야 함
* 테스트