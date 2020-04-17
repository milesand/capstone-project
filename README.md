# Capstone-project

<body>
<h2> 실행방법 </h2>
  <block>
    <ol>
      <li> manage.py가 위치한 폴더에서 python manage.py makemigations 실행 </li>
      <li> python manage.py migrate 실행 </li>
      <li> python manage.py runserver </li>
      <li> localhost:8000/register나 localhost:8000/login, localhost:8000/users로 진입하면 됩니다. </li>
    </ol>
  </block>
  <br><br>
  <block>
    <ul>
      <li> /register - 회원가입 </li>
      <li> /login - 로그인 </li>
      <li> /users - 가입한 사용자들의 프로파일 출력 </li>
    </ul>
  <block>
<br><br>
회원가입을 하면 등록한 이메일로 인증 URL이 보내지며, 이 URL을 클릭해서 인증을 수행할 수 있습니다. 인증을 완료하면 로그인이 가능합니다.
<br>
  <block>
    필요한 모듈
    <ul>
        <li> django </li>
        <li> pythonrestframework </li>
        <li> python-rest-knox </li>
    </ul>
  <block>
</body>
