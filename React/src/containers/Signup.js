import React, { Component } from "react";
import SignupForm from "../components/LoginComponents/SignupForm";

// 회원가입할 때 사용하는 컴포넌트
export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      username_err_message:"",
      nickname: "",
      nickname_err_message:"",
      password: "",
      password_err_message:"",
      password_val: "",
      password_val_err_message:"",
      email: "",
      email_err_message:"",
      phone: "",
      phone_err_message:"",
    };
  }

  componentDidMount() {
    if (this.props.isLogin) {
      this.props.history.push("/");
    }
  }

  
  validateField(id) { //여기서 회원가입 필드들의 유효성 확인.
    let val = true;
    const idPasswordTest=/^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z]).*$/; //8자 이상 15자 이하, 영문자와 숫자를 조합해야함.
    const nicknameTest=/^.*(?=^.{2,15}$)(?=.*[0-9a-zA-Z가-힣]).*$/; //2자 이상 15자 이하, 영문자, 숫자, 한글로 이루어짐.
    const emailTest=/^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/; //이메일 주소
    const phoneNumberTest = /^\d{3}-\d{3,4}-\d{4}$/; //전화번호, XXX-XXX-XXXX 또는 XXX-XXXX-XXXX 형태
    
    if(id==='username'){
      if(!this.state.username||!idPasswordTest.test(this.state.username)) val=false;
    }
    else if(id==='nickname'){
      if(!this.state.nickname||!nicknameTest.test(this.state.nickname)) val=false;
    }
    else if(id==='password'){
      if(!this.state.password||!idPasswordTest.test(this.state.password)) val=false;
    }
    else if(id==='password_val'){
      if(!this.state.password_val||this.state.password!==this.state.password_val) val=false;
    }
    else if(id==='email'){
      if(!this.state.email||!emailTest.test(this.state.email)) val=false;
    }
    else if(id==='phone'){
      if(this.state.phone&&!phoneNumberTest.test(this.state.phone)) val=false;
    }
    return val;
  }

  validateAllField(username, nickname, password, password_val, email, phone) {
    let val = true;
    const idPasswordTest=/^.*(?=^.{8,15}$)(?=.*\d)(?=.*[a-zA-Z]).*$/;
    const nicknameTest=/^.*(?=^.{2,15}$)(?=.*[0-9a-zA-Z가-힣]).*$/;
    const emailTest=/^[\w-]+(\.[\w-]+)*@([a-z0-9-]+(\.[a-z0-9-]+)*?\.[a-z]{2,6}|(\d{1,3}\.){3}\d{1,3})(:\d{4})?$/;
    const phoneNumberTest = /^\d{3}-\d{3,4}-\d{4}$/;
    if(!username||!idPasswordTest.test(username)) val=false;
    if(!nickname||!nicknameTest.test(nickname)) val=false;
    if(!password||!idPasswordTest.test(password)) val=false;
    if(!password_val||password!==password_val) val=false;
    if(!email||!emailTest.test(email)) val=false;
    if(phone&&!phoneNumberTest.test(phone)) val=false;
    return val;
  }

  valChangeControl(e){
    let target="";
    let target_err_message="";
    let target_id=e.target.id;
    let target_val=e.target.value;

    if(target_id==='username'){
      target="username_err_message";
      target_err_message="8자 이상 15자 이하의 숫자, 영문자를 포함한 값으로 입력해주세요.";
    }
    else if(target_id==='nickname'){
      target="nickname_err_message";
      target_err_message="2자 이상 15자 이하의 숫자 또는 영문자를 포함한 값으로 입력해주세요.";
    }
    else if(target_id==='password'){
      target='password_err_message';
      target_err_message="8자 이상 15자 이하의 숫자, 영문자를 포함한 값으로 입력해주세요.";
    }
    else if(target_id==='password_val'){
      target='password_val_err_message';
      target_err_message="비밀번호가 일치하지 않습니다.";
    }
    else if(target_id==='email'){
      target='email_err_message';
      target_err_message="이메일 형식을 확인해주세요.";
    }
    else if(target_id==='phone'){
      target='phone_err_message';
      target_err_message="다음과 같은 형태로 입력해주세요. 010-XXXX-XXXX";
    }

    this.setState({
      [target_id]: target_val //SignupForm.js에서 정해놓은 input id값 및 value값
    }, ()=> {
      if(!this.validateField(target_id)){
        this.setState({
          [target]: target_err_message  //대괄호에 문자열을 넣으면 해당 문자열로 state를 업데이트 할 수 있음.
        }); 
      }
      else{
        this.setState({
          [target]: ""
        });
      }
    }
    );
  }

  submit(e) {       
    e.preventDefault();

    let data = {
      username: this.state.username,
      nickname: this.state.nickname,
      password: this.state.password,
      email: this.state.email,
      phone_num: this.state.phone,
      social_auth: "",
      is_mail_authenticated: false,
    };
    this.props.toggleLoadingState(); // App.js의 isLoading state를 true로 변경
    fetch('http://localhost/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(content => {
      console.log(content);
      if (content.hasOwnProperty('username')) {
        throw Error("이미 존재하는 아이디입니다.");
      }

      else if(content.hasOwnProperty('email')){
        throw Error("이미 가입된 이메일입니다.");
      }

      console.log("user : ", content.user);
      if (content.user.username) {
        console.log("registration here!!!");
        this.props.userStateChange(true,
                                   false, 
                                   content.user.username, 
                                   content.user.nickname, 
                                   content.user.email, 
                                   content.user.root_info.root_dir
                                   ); //회원가입 하고 바로 로그인 상태로 바뀌게 하고 싶을 때 사용
    
        let loginData={
          username: this.state.username,
          password: this.state.password
        }
        // 서버로부터 새로운 access token 발급받아 로그인 상태로 전환
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
        .then(mailPage =>{
          this.props.toggleLoadingState(); 
          this.props.history.push('/mail-resend');
        })
      }
    }).catch(error =>{
        this.props.notify(error);
        this.props.toggleLoadingState(); //fetch 과정에서 에러가 발생했을 때, isLoading state를 false로 돌려놓는다.
      } );
  }

  render() {
    return (
      <SignupForm
        username={this.state.username}
        username_err_message={this.state.username_err_message}
        nickname={this.state.nickname}
        nickname_err_message={this.state.nickname_err_message}
        password={this.state.password}
        password_err_message={this.state.password_err_message}
        password_val={this.state.password_val} //비밀번호 확인 필드를 위해 추가
        password_val_err_message={this.state.password_val_err_message}
        email={this.state.email}
        email_err_message={this.state.email_err_message}
        phone={this.state.phone}
        phone_err_message={this.state.phone_err_message}
        isLoading={this.props.isLoading}
        validate={this.validateAllField}
        changeUsername={e => this.valChangeControl(e)}
        changeNickname={e => this.valChangeControl(e)}
        changePassword={e => this.valChangeControl(e)}
        changePassword_val={e => this.valChangeControl(e)}
        changeEmail={e => this.valChangeControl(e)}
        changePhone={e => this.valChangeControl(e)}
        submit={e => this.submit(e)}
      />
    );
  }
}
