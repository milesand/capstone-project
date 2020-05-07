import React, { Component, Fragment } from "react";
import LoginForm from "../components/LoginComponents/LoginForm";
import GoogleLoginButton from "../components/LoginComponents/GoogleLoginButton";
//로그인
export default class Login extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
    console.log("로그인 시작.");
  }

  //유저 로그인 상태 체크
  componentDidMount() {
    if (this.props.isLogin) {
      this.props.history.push("/");
    }
  }

  valChangeControl(e){
    let target_id=e.target.id;
    let target_val=e.target.value;
    console.log("changeControl!");
    this.setState({
      [target_id]: target_val
    });
  }

  //구글 로그인 구현하기

  googleLogin(){
    let auth2=window.gapi.auth2.getAuthInstance();
    Promise.resolve(auth2.signIn())
    .then(googleUser => {
      console.log("googleUser : ", googleUser);
      console.log("near login : ", this.props);
      console.log("google login called!!!!!", this.props.username);
      let token=googleUser.getAuthResponse(true).access_token;
      console.log("token : ", token);

      let data={
        access_token: token,
        social_auth: "google"
      }

      let errorCheck= response =>{
        if(response.hasOwnProperty('error')){
          throw Error(response['error'])
        }
        return response;
      }
      console.log("here, props : ", this.props);
      if(token!=null){
        fetch("http://localhost/api/google", {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        .then(res=>res.json())
        .then(errorCheck)
        .then(content => {
          console.log('prop logout : ', this.props.isLogout);
          this.props.userStateChange(true, true, content.username, content.email);
          this.props.history.push('/');
        }).catch(e=>alert(e))
      }
    })
  }

  /*googleLogin(googleUser){
    console.log("near login : ", this.props);
    if(this.props.username==""){
      console.log("google login called!!!!!", this.props.username);
      let token=googleUser.getAuthResponse().access_token;
      console.log(token);

      let data={
        access_token: token,
        social_auth: "google"
      }

      let errorCheck= response =>{
        if(response.hasOwnProperty('error')){
          throw Error(response['error'])
        }
        return response;
      }
      console.log("here, props : ", this.props);
      if(token!=null){
        fetch("http://localhost/api/google", {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        .then(res=>res.json())
        .then(errorCheck)
        .then(content => {
          console.log('prop logout : ', this.props.isLogout);
          this.props.userStateChange(true, true, content.username, content.email);
          this.props.history.push('/');
        }).catch(e=>alert(e))
      }
    }
  }*/

  // 일반 로그인
  normalLogin(e) {
    e.preventDefault();

    let isMailAuthenticated=true;
    let data={
      username: this.state.username,
      password: this.state.password
    }

    fetch("http://localhost/api/jwt-login", {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(res=>res.json())
    .then(content => {
      // 아이디와 비밀번호가 올바른지 확인하고, 맞으면 이메일 인증 여부 확인
      if(content.hasOwnProperty('error')){
        if(content.hasOwnProperty('email')){
           isMailAuthenticated=false;
        }
        else
           throw Error(content['error']);
      }

      console.log("content ? ", content);
      this.props.userStateChange(true, isMailAuthenticated, this.state.username, content.email);
      this.props.history.push('/');
    }).catch(error=>alert(error));
  }

  render() {
    console.log('login render.');
    return (
      <Fragment>
        <LoginForm
            username={this.state.username}
            password={this.state.password}
            isLogin={this.isLogin}
            changeUsername={e => this.valChangeControl(e)}
            changePassword={e => this.valChangeControl(e)}
            normalLogin={e => this.normalLogin(e)}
            googleLogin={e => this.googleLogin(e)}
            test={e=>this.test(e)}
        />
      </Fragment>
    );
  }
}
