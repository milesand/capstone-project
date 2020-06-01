import React, { Component, Fragment } from "react";
import LoginForm from "../components/LoginComponents/LoginForm";

//로그인
export default class Login extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    console.log('login props : ', props);
    this.state = {
      username: "",
      password: "",
      isLoading: false
    };
  }

  //유저 로그인 상태 체크
  componentDidMount() {
    console.log("login check.");
    if (this.props.isLogin) {
      this.props.history.push("/");
    }
  }

  valChangeControl(e){
    let target_id=e.target.id;
    let target_val=e.target.value;
    this.setState({
      [target_id]: target_val
    });
    console.log('change!');
    console.log(target_id, " : ", target_val);
  }

  validateAllField(username, password){
     console.log('username : ', username, ' password : ', password);
     let val=true;
     const idPasswordTest=/^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z]).*$/;
     if(!username||!idPasswordTest.test(username)) val=false;
     if(!password||!idPasswordTest.test(password)) val=false;
     console.log("validate val : ", val);
     return val;
  }
  //구글 로그인 구현하기

  googleLogin(){
    let auth2=window.gapi.auth2.getAuthInstance();
    Promise.resolve(auth2.signIn())
    .then(googleUser => {
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
      if(token!=null){
        fetch("http://localhost/api/social-login", {
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
          this.props.userStateChange(true,
                                     true,
                                     content.username, 
                                     content.nickname, 
                                     content.email, 
                                     content.rootDir
                                     );
          this.props.history.push('/');
        }).catch(e=>this.props.notify(e))
      }
    })
  }

  //페이스북 로그인
  facebookLogin = (response) => {
    console.log("facebook profile : ", response);
    let data={
      access_token: response.accessToken,
      social_auth: "facebook"
    }

    let errorCheck = (response) =>{
      console.log(data);
      return response;
    }

    fetch("http://localhost/api/social-login", {
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
      console.log('facebook content : ', content);
      this.props.userStateChange(true,
                                 true,
                                 content.username, 
                                 content.nickname, 
                                 content.email, 
                                 content.rootDir
                                 );
      this.props.history.push('/');
    }).catch(e=>this.props.notify(e))
  }

  // 일반 로그인
  normalLogin(e) {
    e.preventDefault();
    let isMailAuthenticated=true;
    let data={
      username: this.state.username,
      password: this.state.password
    }
    
    this.props.toggleLoadingState();
    console.log("isLoading : ", this.state.isLoading);
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
        else if(!this.validateAllField(this.state.username, this.state.password))
            throw Error('아이디와 비밀번호는 영문자, 숫자를 포함한 8자 이상 15자 이하로 입력해주세요.');
        else
           throw Error(content['error']);
      }

      this.props.userStateChange(true,
                                 isMailAuthenticated, 
                                 this.state.username, 
                                 content.nickname, 
                                 content.email, 
                                 content.rootDir
                                 );
      this.setState({
        isLoading: true
      });
      this.props.toggleLoadingState();
      this.props.history.push('/');
    }).catch(e=>{
          this.props.notify(e);
          this.props.toggleLoadingState();
    });
  }

  render() {
    return (
      <Fragment>
            <LoginForm
                username={this.state.username}
                password={this.state.password}
                isLoading={this.props.isLoading}
                isLogin={this.isLogin}
                changeUsername={e => this.valChangeControl(e)}
                changePassword={e => this.valChangeControl(e)}
                normalLogin={e => this.normalLogin(e)}
                googleLogin={e => this.googleLogin(e)}
                facebookLogin={e => this.facebookLogin(e)}
            />
      </Fragment>
    );
  }
}
