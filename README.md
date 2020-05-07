# Capstone-project

실행방법
==================
1. manage.py가 위치한 폴더(`./app`)에 `googleAccount.txt` 추가 (카톡방에 올려드릴게요)
2. docker-compose.yml이 위치한 폴더(`.`)에서 `docker-compose up --build`
3. 아래에 적혀있는 URL 사용방법대로 사용하면 됩니다.

5/3 수정사항
------------------
1. 메일 인증을 받지 않은 사용자가 로그인 했을 때, 메일 인증을 받게 하는 안내 페이지를 제작했습니다. 여기서 인증 메일을 다시 전송받을 수 있습니다.
2. JWT 토큰 저장 방식을 local storage에서 httponly cookie로 변경했습니다.
   - 보안상 httponly cookie로 저장하는 것이 더 안전하기 때문입니다. local storage에 저장하면 xss공격에 취약해지고, httponly cookie에 저장하면 xss 공격은 막을 수 있지만 csrf 공격에 취약해집니다. 하지만 csrf 공격이 상대적으로 더 막기 쉬우므로, 상용 서비스에서는 일반적으로 httponly cookie에 JWT 토큰을 저장합니다. 
   
5/4 수정사항
------------------
1. 로그인한 사용자가 새로고침 했을 때, 로그인 화면으로 이동하는 현상을 수정했습니다.
2. 로그인 확인 페이지를 /로 수정했습니다. 해당 페이지에서 로그인한 사용자의 아이디를 확인할 수 있습니다.

5/5 수정사항
------------------
1. 회원가입 폼의 각 입력 필드의 입력값을 검증하고, 유효하지 않을 경우 입력 필드 아래에 조건을 표시하도록 구현했습니다
.
![signup](https://user-images.githubusercontent.com/49271247/81073996-5facaa00-8f23-11ea-9c50-b52dee452ee5.gif)

2. 메일 재전송 페이지 및 인증 페이지와 서버를 연결했습니다.

5/7 수정사항
-----------------
1. 구글 로그인을 구현하여 로그인 폼에 추가하였습니다. 구현 과정에서 몇 가지 어려웠던 점들이 있었습니다.
  1. Django 서버 내부의 특정 view에서 다른 view로 리퀘스트를 전달하는 문제
    - 구글 로그인을 수행했을 때 서버에 동일한 이메일을 가진 사용자가 존재한다면 그 사용자로 로그인시키고, 아니면 회원가입시키는 방식으로 구현했는데,
      이를 위해서는 계정이 존재하는지 판정한 뒤 login view 또는 registration view로 request를 전달해야 했습니다. 이를 위해 새롭게             
      GoogleLoginAPI라는 view를 새로 만들고, /api/google URL과 연결했습니다. 또한 LoginAPI와 RegistrationAPI를 상속받게 하여 판정 후에
      적절한 view에서 처리할 수 있도록 하였습니다.
      
  2. 구글 계정으로 로그인했을 때 로그아웃을 수행해도 다시 로그인이 되던 문제
    - 기존에 구글에서 제공하는 gapi.auth2.render()를 통해 로그인 버튼을 만들면 로그인 버튼이 렌더링 될 때마다 구글 계정 로그인 여부를 체크하고,
      구글계정이 로그인 되어 있는 경우 자동으로 로그인이 되던 문제가 발생했습니다. 이를 해결하기 위해 직접 custom button을 만들고, onClick
      이벤트를 통해 렌더링 될 때가 아닌 버튼을 클릭했을 때 로그인 이벤트를 발생시키도록 했습니다. 버튼을 클릭하면 gapi.auth2.getAuthInstance()
      를 통해 사용자 계정 객체를 생성하고, gapi.auth2.signIn()을 통해 구글 서버에 로그인을 요청합니다. 이를 통해 googleUser 객체를 받아
      이 객체의 메소드인 getAuthResponse를 통해 access token을 뽑아내고, /api/google로 POST 요청을 보내 서버에서 유효성을 판정한 뒤
      사용자에 대한 정보를 이용할 수 있도록 구현했습니다.
  

URL 사용법
------------------
리액트 폼

|URL          | 설명   |
|:--------------:|:-------:|
|/|메인 페이지, 로그인한 사용자의 아이디를 확인할 수 있습니다.|
|/login|로그인 페이지, 로그인 성공 시 /login-test로 리다이렉트됩니다.|
|/signup|회원가입 페이지입니다.|
|/mail-auth|메일인증을 받지 않은 계정으로 로그인했을 때, 이 페이지로 이동합니다. 이 페이지에서 가입 시에 등록한 이메일을 확인할 수 있고, 인증 메일을 다시 전송받을 수 있습니다.|

현재 JWT 토큰과 사용자 식별 ID를 local storage에 저장하도록 구현해놓은 상태로, 보안 문제로 인해 쿠키에 JWT 토큰을 담는 방식으로
전환하는 중입니다. 


API

127.0.0.1/ 뒤에 아래의 URL을 붙이면 됩니다.

|           | POST    | GET        | DELETE  |
|:--------------:|:-------:|:--------------------------: |:-------:|
| api/users | - | 전체 사용자 출력 |      -     |
| api/user| - | 해당 회원의 정보 출력 | 해당 회원의 정보 제거 |
| api/register | 회원가입 |-|-|
| api/jwt-login | 로그인 |-|-|
| api/logout | 로그아웃 |-|-|
| api/send-auth-email | 인증 메일 보내기 |-|-|
| api/jwt-refresh | JWT 토큰 재발급|-|-|
| api/jwt-verify | JWT 토큰 유효성 확인 |-|-|
| /active/<str:uidb64>/<str:token> |-| 인증메일에 사용하는 URL |-|

* GET /api/user와 DELETE /api/user를 통해서 사용자의 정보를 확인하거나, 삭제할 수 있습니다. 어떤 사용자인지는 클라이언트 브라우저에 저장되어 있는
  HttpOnly JWT 토큰 쿠키를 통해 서버에서 식별합니다. 

* POST /api/register 는 HTTP body에 json 형식으로 username, password, email 필드를 필수로 넘겨줘야 하며, phone_num 필드는 선택사항입니다.

* POST /api/jwt-login은 HTTP body에 json 형식으로 username, password를 넘겨줘야 하며, 서버는 response로 HttpOnly 속성을 지닌 쿠키에 JWT            토큰을 담아서 보내줍니다.
   한번 로그인했을 때 토큰의 유효시간은 30분입니다.

* POST /api/jwt-refresh는 HTTP body에 json 형식으로 token : <발급받은 토큰>을 넣어주면 유효 시간이 갱신된 새로운 토큰을 받을 수 있습니다.
  발급받은 토큰이 만료되면 새로운 토큰을 받을 수 없으니, 만료 되기 전에 이 URL을 통해 새로운 토큰을 발급받으면 됩니다(페이지에 버튼을 따로 만들거나 하면 될것같아요).
  
* POST /api/jwt-verify는 현재 클라이언트 브라우저에 저장되어 있는 HttpOnly 쿠키 안에 있는 jwt 토큰의 유효성을 확인합니다. 

* POST /api/logout을 통해 로그아웃을 수행할 수 있으며, 클라이언트 브라우저에서 JWT 토큰이 저장된 쿠키를 삭제합니다.
   
* /active/<str:uidb64>/<str:token>은 인증메일용 URL로, 이메일 인증에만 사용됩니다.

현재 사이트에는 아래와 같은 문제점들이 있습니다.
1. 새로고침을 여러 번 했을 때 로그아웃되는 현상
2. 구글 로그인, 페이스북 로그인, ID/비밀번호 찾기 구현

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


