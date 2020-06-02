import React, { Component, Fragment} from "react";
import { withRouter } from "react-router-dom"; //로그아웃 했을 때 로그인 화면으로 리다이렉션하기 위해 import
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; //토스트 알림을 위한 css
import Toast from './Toast';

//라우팅용 모듈들
import { Route, Switch } from "react-router-dom";
import NormalRoute from "../components/RoutingComponents/NormalRoute";
import AuthenticatedRoute from "../components/RoutingComponents/AuthenticatedRoute";
import NotAuthenticatedRoute from "../components/RoutingComponents/NotAuthenticatedRoute";
import MailAuthRoute from "../components/RoutingComponents/MailAuthRoute";
import ErrorPage from "../components/LoginComponents/ErrorPage";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import MailResend from "./MailResend";
import MailValidation from "./MailValidation";
import ForgotID from "./ForgotID";
import ForgotPassword from "./ForgotPassword";
import DisplayID from "./DisplayID";
import ReturnToLogin from "./ReturnToLogin";
import ThumbTest from "./ThumbTest";
import FileTest from "./FileTest";
import StreamingTest from "./StreamingTest";

class App extends Component {
  constructor(props) {
    super(props); //App 컴포넌트가 상속받은 Component가 지니고 있던 생성자를 super를 통해 미리 실행한다.
    console.log('App prop test.');
    this.state = { //컴포넌트의 state 정의
      username: "",
      nickname: "",
      email: "",
      isLogin: null, //사용자가 로그인 상태인지 체크한 후에 bool 값이 할당됨.
      isMailAuthenticated: null,
      isLoading: false,
      rootDirID: "",
    };
    console.log(this.state);
  }

  toggleLoadingState=()=>{ //현재 fetch 중이라면 isLoading을 true로, 아니면 false로 바꿔준다. 버튼 스피너를 위해 필요함.
    console.log("toggle!");
    this.setState((prevState)=>({
      isLoading: !this.state.isLoading
    }));
  }

  // user 정보 받아오기
  componentDidMount() { //컴포넌트가 만들어지고 render가 호출된 이후에 호출되는 메소드
    this.getUserInfo();
  }

  getUserInfo=()=>{
    let errorCheck = response => {
      console.log("user check, here!!!!, response : ", response);
      if(!response.hasOwnProperty('error')&&!response.hasOwnProperty('detail')){
        this.setState({
          isLogin: true,
          isMailAuthenticated: response.is_mail_authenticated,
          username: response.username,
          nickname: response.nickname,
          email: response.email,
          rootDirID: response.root_info.root_dir
        });
      }
      else{
        this.userStateChange(false, false);
        this.deleteJWTToken();
      }
      return response;
    } 

    let jwtErrorCheck = response => {
       if(!response.ok){
          this.deleteJWTToken();
          Promise.reject(); //서버에서 jwt 토큰 유효시간 줄여서 테스트해보기
       }
       return response;
    }
    
    return fetch('http://localhost/api/user', { // JWT 토큰이 저장되어 있는지, 그리고 저장되어 있다면 해당 JWT 토큰이 유효한지 확인
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
      .then(res=>res.json())
      .then(errorCheck)
      .then(content=>{
        console.log("login? : ", this.state.isLogin);
        if(this.state.isLogin){ // 사용자가 로그인 중일 때
          fetch('http://localhost/api/jwt-refresh', { //JWT 토큰 재발급
              method: "POST", 
              headers: {
                'Content-Type' : 'application/json',
              },
              credentials: 'include',
          })
          .then(jwtErrorCheck)
          .then(res=>res.json())
          .then(content=>{
              console.log("토큰이 재발급되었습니다.");
              console.log(content);
              console.log(this.state);
          }).catch(error=>console.log('JWT 토큰 재발급 에러!'));
        }
        return content;
      }).catch(error=>console.log('로그인 체크 에러!'));
  }

  userStateChange = (authenticated, mailAuthenticated, username="", nickname="", email="", root_dir="") => {
    console.log("thisStateTest.", this.state);
    if(email=='google'||email=='facebook'){ //소셜 로그인
      this.setState({
        isLogin: authenticated,
        isMailAuthenticated: true,
        username: username,
        nickname : nickname,
        email: email,
        rootDirID: root_dir
      });
    }
    else{
      this.setState({
        isLogin: authenticated,
        isMailAuthenticated: mailAuthenticated,
        username: username,
        nickname: nickname,
        email: email,
        rootDirID: root_dir
      });
    }
  }

  async deleteJWTToken(){
    console.log('JWT 토큰 제거중.');
    let isTokenStored=true;
    let tokenCheck = response => {
      if(!response.ok){
        throw Error();
      }
      return response;
    }

      fetch('http://localhost/api/logout', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
      .then(tokenCheck)
      .then(data => {
        console.log('True Log out.', this.state);
      })
      .catch(()=>{
        console.log("error!");
        this.userStateChange(false, false);
        console.log('Log out.');
      })
  }

  // 로그아웃시 서버로 요청 보내서 JWT 토큰이 저장된 httponly 쿠키 제거
  logout = () => {
    console.log("logout called!");
    this.userStateChange(false, false);
    window.FB.logout();
    let auth2 = window.gapi && window.gapi.auth2.getAuthInstance();
    auth2.signOut()
    .then(function () {
      auth2.disconnect();
    })
    .then(() => {
      this.deleteJWTToken();
    })
    .then(() => {
      this.props.history.push("/login");
      console.log('Log out to login page.', this.state);
    });  
  }

  notify = (message) => { //toast notification
    if(String(message)!='[object Object]'){ //이름이 긴 파일을 업로드 했을 때 처리
      message=String(message);
    } 
    Toast.info(message);
  };

  errorCheck=(response, message="서버 에러 발생!")=>{
    console.log("error check, state : ", this.state);
    if(response.status==401){
      this.userStateChange(false, false);
      this.props.history.push('/login');
      throw Error("로그인 인증시간이 만료되었습니다. 다시 로그인 해주세요.");
    }
    if(('ok' in response&&!response.ok)){
      console.log("errchk here!!");
      throw Error(message);
    }
    return response;
  }

  render() {
    const baseProps = {
      username: this.state.username,
      nickname: this.state.nickname,
      useremail: this.state.email,
      rootDirID: this.state.rootDirID,
      isLogin: this.state.isLogin,
      isMailAuthenticated:this.state.isMailAuthenticated,
      isLoading: this.state.isLoading,
      getUserInfo: this.getUserInfo,
      userStateChange: this.userStateChange,
      toggleLoadingState: this.toggleLoadingState,
      errorCheck: this.errorCheck,
      logout: this.logout,
      notify: this.notify
    };

    console.log("base test.", baseProps);
    return (   
       <Fragment>
          <ToastContainer />
          { this.state && this.state.isLogin!=null &&
            <Switch>        
              <NormalRoute path="/login" exact component={Login} props={baseProps} />
              <NormalRoute path="/mail-validation/*" exact component={MailValidation} props={baseProps} />
              <NormalRoute path="/thumb-test" exact component={ThumbTest} props={baseProps} />
              <MailAuthRoute path="/mail-resend" exact component={MailResend} props={baseProps} />
              <NotAuthenticatedRoute path="/signup" exact component={Signup} props={baseProps} />
              <NotAuthenticatedRoute path="/forgot-id" exact component={ForgotID} props={baseProps} />
              <NotAuthenticatedRoute path="/forgot-password" exact component={ForgotPassword} props={baseProps} />
              <NotAuthenticatedRoute path="/display-id" exact component={DisplayID} props={baseProps} />
              <NotAuthenticatedRoute path="/return-to-login" exact component={ReturnToLogin} props={baseProps} />
              <AuthenticatedRoute path="/file-test" exact component={FileTest} props={baseProps} />
              <AuthenticatedRoute path="/streaming-test" fileID="25d9ddeb-bddf-4f8d-a179-b36697b9a65f" component={StreamingTest} props={baseProps} />
              <AuthenticatedRoute path="/" component={Home} props={baseProps} />
              <Route component={ErrorPage} />
            </Switch>
          }
      </Fragment>
    );
  }
}

export default withRouter(App); //로그아웃 했을 때 로그인화면으로 리다이렉트하기 위해 바꿔준다.
