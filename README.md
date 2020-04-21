# Capstone-project

실행방법
==================
1. manage.py가 위치한 폴더에 googleAccount.txt 추가 (카톡방에 올려드릴게요)
2. pip install -r requirements.txt 실행
3. manage.py가 위치한 폴더에서 python manage.py makemigations
4. python manage.py migrate 실행
5. python manage.py runserver
6. 아래에 적혀있는 URL 사용방법대로 사용하면 됩니다.




URL 사용법
------------------
localhost:8000/ 뒤에 아래의 URL을 붙이면 됩니다.

|           | POST    | GET        | DELETE  |
|:--------------:|:-------:|:--------------------------: |:-------:|
| api/users | - | 전체 사용자 출력 |      -     |
| api/user/<사용자 번호>| - | 해당 회원의 정보 출력 | 해당 회원의 정보 제거 |
| api/register | 회원가입 |-|-|
| api/login | 로그인 |-|-|
| api/logout | 로그아웃 |-|-|
| /active/<str:uidb64>/<str:token> |-| 인증메일에 사용하는 URL |-|

* GET /api/user/<사용자 번호> 와 DELETE /api/user/<사용자 번호> 을 통해서 타인의 계정 정보를 참조하거나 삭제할 수 없습니다.

* POST /api/register 는 HTTP body에 json 형식으로 username, password, email 필드를 필수로 넘겨줘야 하며, phone_num 필드는 선택사항입니다.

* POST /api/login은 HTTP body에 json 형식으로 username, password를 넘겨줘야 하며, response로 로그인 토큰을 받을 수 있습니다.

   로그인이 필요한 모든 서비스들은 HTTP 헤더에 Authorization : Token <로그인 토큰> 을 넣는 것으로 접근할 수 있습니다.
   한번 로그인했을 때 토큰의 유효시간은 30분입니다.
   
* POST /api/logout은 HTTP 헤더에 Authorization : Token <로그인 토큰>을 넣고 HTTP request를 보내야 합니다. 보내면 해당 로그인 토큰이
   비활성화되어 해당 토큰으로는 로그인이 필요한 서비스에 접근할 수 없습니다(로그아웃).
   
* /active/<str:uidb64>/<str:token>은 인증메일용 URL로, 이메일 인증에만 사용됩니다.

사용예
------------------

