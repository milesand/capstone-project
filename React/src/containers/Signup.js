import React, { Component } from "react";
import SignupForm from "../components/auth/SignupForm";

// 회원가입할 때 사용하는 컴포넌트
export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      password_val: "",
      email: "",
      phone: "",
    };
  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      this.props.history.push("/");
    }
  }

  validateForm(username, password, password_val) { //여기서 회원가입 필드들의 유효성 확인. 아이디 8자 이상, 비밀번호 8자 이상 15자 이하, 비밀번호와 비밀번호 확인필드 동일해야함.
    return (username && username.length >= 8) && (password) && (password==password_val);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value //SignupForm.js에서 정해놓은 input id값 및 value값
    });
  }

  async handleSubmit(submitEvent) {
    let data = {
      username: this.state.username,
      password: this.state.password,
      email: this.state.email,
      phone_num: this.state.phone,
      social_auth: "",
      is_mail_authenticated: false,
    };
    
    console.log("data : " + JSON.stringify(data))
    submitEvent.preventDefault();

    let handleErrors = response => {
      console.log(response);
      if (!response.ok) {
        throw Error("Error Message");
      }
      return response;
    }

    fetch('http://localhost/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(handleErrors)
    .then(res => res.json())
    .then(json => {
      console.log(json);
      if (json.user.username) {
        console.log("회원가입 완료!");
        //this.props.userHasAuthenticated(true, json.user._id, json.user.username); //회원가입 하고 바로 로그인 상태로 바뀌게 하고 싶을 때 사용
        let mailPage = response => {
          console.log(response);
          this.props.history.push({
            pathname: '/mail-auth',
            state: { 
              username: data.username,
              email: response['email'] }
            });
          return response;
        }
    
        let loginData={
          username: this.state.username,
          password: this.state.password
        }
        // 서버로부터 새로운 access token 발급받음
        fetch('http://localhost/api/jwt-login', {
          //보통 fetch는 쿠키를 보내거나 받지 않는다. 쿠키를 전송하거나 받기 위해서는 credentials 옵션을 반드시 설정해야 한다.
          method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials : 'include', //서버에 실을 때 수정
            body: JSON.stringify(loginData)
          })
        .then(res => res.json())
        .then(mailPage)
      }
    }).catch(error => alert(error));
  }

  render() {
    return (
      <SignupForm
        username={this.state.username}
        password={this.state.password}
        password_val={this.state.password_val} //비밀번호 확인 필드를 위해 추가
        handleChangeUsername={e => this.handleChange(e)}
        handleChangePassword={e => this.handleChange(e)}
        handleChangePassword_val={e => this.handleChange(e)}
        handleChangeEmail={e => this.handleChange(e)}
        handleChangePhone={e => this.handleChange(e)}
        handleSubmit={e => this.handleSubmit(e)}
        validate={this.validateForm}
      />
    );
  }
}
