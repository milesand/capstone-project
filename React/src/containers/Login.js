import React, { Component, Fragment } from "react";
import LoginForm from "../components/LoginComponents/LoginForm";

//로그인
export default class Login extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
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
            changeUsername={e => this.valChangeControl(e)}
            changePassword={e => this.valChangeControl(e)}
            normalLogin={e => this.normalLogin(e)}
        />
      </Fragment>
    );
  }
}
