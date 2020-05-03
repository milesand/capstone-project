# Capstone-project

실행방법
==================
1. manage.py가 위치한 폴더(`./app`)에 `googleAccount.txt` 추가 (카톡방에 올려드릴게요)
2. docker-compose.yml이 위치한 폴더(`.`)에서 `docker-compose up --build`
3. 아래에 적혀있는 URL 사용방법대로 사용하면 됩니다.

URL 사용법
------------------
리액트 폼

|URL          | 설명   |
|:--------------:|:-------:|
|/|메인 페이지, 현재 todo로 되어있어서 수정해야합니다.|
|/login|로그인 페이지, 로그인 성공 시 /login-test로 리다이렉트됩니다.|
|/login-test|로그인이 되었는지 확인하는 테스트 페이지입니다.|

현재 JWT 토큰과 사용자 식별 ID를 local storage에 저장하도록 구현해놓은 상태로, 보안 문제로 인해 쿠키에 JWT 토큰을 담는 방식으로
전환하는 중입니다. 


API

127.0.0.1/ 뒤에 아래의 URL을 붙이면 됩니다.

|           | POST    | GET        | DELETE  |
|:--------------:|:-------:|:--------------------------: |:-------:|
| api/users | - | 전체 사용자 출력 |      -     |
| api/user/<사용자 pk>| - | 해당 회원의 정보 출력 | 해당 회원의 정보 제거 |
| api/register | 회원가입 |-|-|
| api/jwt-login | 로그인 |-|-|
| api/jwt-refresh | JWT 토큰 재발급|-|-|
| /active/<str:uidb64>/<str:token> |-| 인증메일에 사용하는 URL |-|

* GET /api/user/<사용자 pk> 와 DELETE /api/user/<사용자 번호> 을 통해서 타인의 계정 정보를 참조하거나 삭제할 수 없습니다. 사용자 pk는 로그인
  수행 시 jwt 토큰과 함께 HTTP response로 주어집니다. 프론트엔드쪽에서 저장하고 있다가 필요할 때 URL에 넣어서 API 요청하면 됩니다.

* POST /api/register 는 HTTP body에 json 형식으로 username, password, email 필드를 필수로 넘겨줘야 하며, phone_num 필드는 선택사항입니다.

* POST /api/jwt-login은 HTTP body에 json 형식으로 username, password를 넘겨줘야 하며, response로 JWT 토큰을 받을 수 있습니다.
   로그인이 필요한 모든 서비스들은 HTTP 헤더에 Authorization : jwt <발급받은 jwt 토큰> 을 넣는 것으로 접근할 수 있습니다. 발급받은 jwt 토큰은 웹페이지의
   로컬 저장소에 저장해두고 인증이 필요한 HTTP request를 보낼 때마다 헤더에 넣어서 보내주면 됩니다.
   한번 로그인했을 때 토큰의 유효시간은 30분입니다.

* POST /api/jwt-refresh는 HTTP body에 json 형식으로 token : <발급받은 토큰>을 넣어주면 유효 시간이 갱신된 새로운 토큰을 받을 수 있습니다.
  발급받은 토큰이 만료되면 새로운 토큰을 받을 수 없으니, 만료 되기 전에 이 URL을 통해 새로운 토큰을 발급받으면 됩니다(페이지에 버튼을 따로 만들거나 하면 될것같아요).

* 로그아웃 기능은 JWT 토큰의 특성 상 따로 구현하지 않고, 로그아웃 했을 때 해당 사용자의 JWT토큰을 폐기하면 됩니다.
   
* /active/<str:uidb64>/<str:token>은 인증메일용 URL로, 이메일 인증에만 사용됩니다.

사용예
------------------
1. 전체 유저 목록 출력
![1  전체 유저 목록 출력](https://user-images.githubusercontent.com/49271247/79839313-4f5ae200-83ef-11ea-99c1-f62e9c794d90.png)

2. 회원가입
![2  회원 가입](https://user-images.githubusercontent.com/49271247/79839454-7e715380-83ef-11ea-960f-f6f6b253f71d.png)

3. 메일 인증 하지 않고 로그인 시도할 때
![3  메일 인증 미수행](https://user-images.githubusercontent.com/49271247/79839458-803b1700-83ef-11ea-95b4-e2621776ed8f.png)

4. 인증 메일
![4  인증 메일](https://user-images.githubusercontent.com/49271247/79839460-80d3ad80-83ef-11ea-80e3-db72271c51e4.png)

5. 메일에 있는 URL을 통한 계정 활성화
![5  메일 활성화](https://user-images.githubusercontent.com/49271247/79839461-80d3ad80-83ef-11ea-88d7-b6b76a149746.png)

6. 로그인 성공
![6  로그인 성공](https://user-images.githubusercontent.com/49271247/79839464-816c4400-83ef-11ea-887c-9c60394b3556.png)

7. 프로필 보기
![프로필 보기](https://user-images.githubusercontent.com/49271247/79839466-8204da80-83ef-11ea-8699-96fc944bd702.png)

8. 회원 탈퇴
![회원 탈퇴](https://user-images.githubusercontent.com/49271247/79839467-8204da80-83ef-11ea-8607-150b67794d55.png)


