import React, { Component, Fragment } from "react";
import LoginForm from "../components/auth/LoginForm";
import cookie from 'react-cookies';
// 로그인 로직을 수행하는 컴포넌트
export default class Login extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
    console.log("로그인 시작.");
  }

  // 만약 유저가 이미 로그인된 상태라면 home으로 이동
  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.props.history.push("/");
    }
  }

  validateForm(username, password) {
    return (username && username.length > 0) && (password && password.length > 0);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  // 구글 로그인 버튼을 클릭한 경우 로직
  // 처음 로그인을 시도하는 경우라면 구글 리소스 서버로부터 받은 정보를 이용하여 서버에 User 생성하고 로그인
  // 이미 로그인을 시도한 적 있는 경우라면 서버로부터 해당 정보를 받아와 로그인
  handleGoogleSignIn(googleUser) {
    console.log("클릭 Login.js");
    console.log(googleUser);
    let profile = googleUser.getBasicProfile();

    let username = profile.getName();
    let email = profile.getEmail();
    let id_token = profile.getId();

    let access_token = googleUser.getAuthResponse().id_token;

    console.log('username: ' + username);
    console.log('email: ' + email);
    console.log('id_token: ' + id_token);
    console.log('access_token: ' + access_token);

    let data = {
      username: username,
      email: email,
      password: id_token,
      social_auth: 'google',
      access_token: access_token
    };

    console.log("data : " + JSON.stringify(data));
    // 서버에 Google 계정 저장돼 있지 않다면 Create 작업 수행
    fetch('http://localhost/api/register', {  //서버에 실을 때 :8000 지워야합니다.
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(json => {
      if (json.username && json.token) {
        console.log('token: ' + json.token);
        this.props.userHasAuthenticated(true, true, json.username, "google");
        this.props.history.push("/");

      }else{
        // 서버에 Google 계정 이미 저장돼 있다면 Login 작업 수행
        // 로그인을 시도하기 전에 서버에 접근하기 위한 access token을 발급 받음
        fetch('http://localhost/api/jwt-login', {
        method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({username: username, password: id_token})
        })
        .then(res => res.json())
        .then(json => {
          console.log(Object.keys(json));
          // 발급 완료 되었다면 해당 토큰을 클라이언트 Local Storage에 저장
          if (json.id && json.token) {

            console.log('로그인 성공! token: ' + json.token);
            this.props.userHasAuthenticated(true, true, json.username, json.email);
            this.props.history.push("/");

          }
        })
        .catch(error => {
          console.log(error);
          window.gapi && window.gapi.auth2.getAuthInstance().signOut();
        });

      }

    })
    .catch(error => {
      console.log(error);
      window.gapi && window.gapi.auth2.getAuthInstance().signOut();
    });


  }

  // 서버에 등록되어있는 회원 정보로 로그인을 시도하는 경우
  handleSubmit(submitEvent) {
    let data = { //let은 var를 대체하는 블락변수이다.
      username: this.state.username,
      password: this.state.password
    };

    submitEvent.preventDefault();

    let handleErrors = response => {
      console.log(response);
      if (response.hasOwnProperty("error")) { // response에 error 키를 가진 값이 있을 경우 에러 발생했다는 의미
        if(response.hasOwnProperty("email")){ //이메일 인증 안받았을 때
          this.props.userHasAuthenticated(true, false, data.username, response['email']);
          localStorage.setItem('isLogin', true);
          this.props.history.push('/mail-resend');
        }
        else{ //아이디 비밀번호 틀렸을 때
           throw Error(response['error']);
        }
      }
      return response;
    }

    // 서버로부터 새로운 access token 발급받음
    fetch('http://localhost/api/jwt-login', {
      //보통 fetch는 쿠키를 보내거나 받지 않는다. 쿠키를 전송하거나 받기 위해서는 credentials 옵션을 반드시 설정해야 한다.
      method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials : 'include', //서버에 실을 때 수정
        body: JSON.stringify(data)
      })
    .then(res => res.json())
    .then(handleErrors)
    .then(json => {
      //로그인이 성공하면 response에는 유저의 고유 id와 함께 jwt token이 들어있다.
      // 발급 완료 되었다면 해당 토큰을 클라이언트 Local Storage에 저장
      console.log("로그인 성공!");
      if (json.email && json.username) {
        this.props.userHasAuthenticated(true, true, json.username, json.email);
        localStorage.setItem('isLogin', true);
        localStorage.setItem('isMailAuthenticated', true);       
        this.props.history.push("/");
      }
    })
    .catch(error => alert(error));
  }

  render() {
    return (
      <Fragment>
        <LoginForm
          username={this.state.username}
          password={this.state.password}
          handleChangeUsername={e => this.handleChange(e)}
          handleChangePassword={e => this.handleChange(e)}
          handleSubmit={e => this.handleSubmit(e)}
          handleGoogleSignIn={e => this.handleGoogleSignIn(e)}
          validate={this.validateForm}
        />

      </Fragment>

    );
  }
}
