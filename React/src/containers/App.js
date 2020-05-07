import React, { Component, Fragment} from "react";
import NavBar from "../components/AuthRoutingComponents/NavBar";
import { withRouter } from "react-router-dom"; //로그아웃 했을 때 로그인 화면으로 리다이렉션하기 위해 import

//라우팅용 모듈들
import { Route, Switch } from "react-router-dom";
import NormalRoute from "../components/AuthRoutingComponents/NormalRoute";
import AuthenticatedRoute from "../components/AuthRoutingComponents/AuthenticatedRoute";
import MailAuthRoute from "../components/AuthRoutingComponents/MailAuthRoute";
import ErrorPage from "../components/LoginComponents/ErrorPage";
import Home from "./Home";
import Login from "./Login";
import Signup from "./Signup";
import MailResend from "./MailResend";
import MailValidation from "./MailValidation";

class App extends Component {
  constructor(props) {
    super(props); //App 컴포넌트가 상속받은 Component가 지니고 있던 생성자를 super를 통해 미리 실행한다.
    console.log('App prop test.');
    this.state = { //컴포넌트의 state 정의
      username: "",
      email: "",
      isLogin: null, //사용자가 로그인 상태인지 체크한 후에 bool 값이 할당됨.
      isMailAuthenticated: null
    };
    console.log(this.state);
  }

  test(){
    console.log("Click Test.");
  }
  // user 정보 받아오기
  componentDidMount() { //컴포넌트가 만들어지고 render가 호출된 이후에 호출되는 메소드
    let errorCheck = response => {
      console.log("err check.");
      console.log(response);
      if(!response.hasOwnProperty('error')){
        this.setState({
          isLogin: true,
          isMailAuthenticated: response.is_mail_authenticated,
          username: response.username,
          email: response.email,
        });
      }
      else{
        console.log('here.');
        this.setState({
          isLogin: false,
        });
        this.deleteJWTToken();
      }
      console.log('wwwwwstate : ', this.state);
      return response;
    } 

    let jwtErrorCheck = response => {
       if(!response.ok){
          this.deleteJWTToken();
          Promise.reject(); //서버에서 jwt 토큰 유효시간 줄여서 테스트해보기
       }
       return response;
    }
    
    if(this.state.username==''){
      fetch('http://localhost/api/user', { // JWT 토큰이 저장되어 있는지, 그리고 저장되어 있다면 해당 JWT 토큰이 유효한지 확인
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
              //react-router-dom에서 알아서 이메일 인증 안받은사람 인증 페이지로 리다이렉션시키므로, 여기선 안해도됨.
          }).catch(error=>console.log('JWT 토큰 재발급 에러!'));
        }
      }).catch(error=>console.log('로그인 체크 에러!'));
    }
  }

  userStateChange = (authenticated, mailAuthenticated, username, email) => {
    console.log("thisStateTest.", this.state);
    if(email=='google'||email=='facebook'){ //소셜 로그인
      this.setState({
        isLogin: authenticated,
        username: username,
        isMailAuthenticated: true
      });
    }
    else{
      this.setState({
        isLogin: authenticated,
        isMailAuthenticated: mailAuthenticated,
        username: username,
        email: email
      });
    }
  }

  async deleteJWTToken(){
    console.log('JWT 토큰 제거중.');
    let isTokenStored=true;
    let tokenCheck = response => {
      if(!response.ok){
        isTokenStored=false;
      }
      return response;
    }

    try {
      fetch('http://localhost/api/logout', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
      .then(tokenCheck)
      .then(res=>{
        if(isTokenStored){
          console.log(res);
          this.setState(state => {
            return{
              isLogin: false,
              isMailAuthenticated: false,
              username: '',
              email: '',
            }
          });
          
        }
      })
      .then(data => {
        console.log('True Log out.', this.state);
      });
    
    }catch{
      console.log("error!");
      this.setState({
        isLogin: false,
        userid: ''
      });
      console.log('Log out.');
    }
  }

  // 로그아웃시 서버로 요청 보내서 JWT 토큰이 저장된 httponly 쿠키 제거
  logout = () => {
    console.log("logout called!");
    let auth2 = window.gapi && window.gapi.auth2.getAuthInstance();
    console.log("isSignedIN test : ", auth2.isSignedIn.get());
    auth2.signOut()
    .then(function () {
      auth2.disconnect();
      console.log("signOut complete.", auth2.isSignedIn.get());
    })
    .then(() => {
      this.deleteJWTToken();
    })
    .then(() => {
      this.props.history.push("/login");
      console.log('Log out to login page.', this.state);
      this.setState({
        isLogout: false
      });
    });  
  }

  render() {
    const baseProps = {
      username: this.state.username,
      useremail: this.state.email,
      isLogin: this.state.isLogin,
      isLogout: this.state.isLogout,
      isMailAuthenticated:this.state.isMailAuthenticated,
      userStateChange: this.userStateChange,
    };

    console.log("base test.", baseProps);
    return (   
       <Fragment>
          { this.state && this.state.isLogin!=null &&
          <NavBar        
            isLogin={this.state.isLogin}
            username={this.state.username}
            isLogout={this.state.isLogout}
            logout={this.logout}
          />
          }
          { this.state && this.state.isLogin!=null &&
            <Switch>
              <AuthenticatedRoute path="/" exact component={Home} props={baseProps} />
              <NormalRoute path="/login" exact component={Login} props={baseProps} />
              <NormalRoute path="/signup" exact component={Signup} props={baseProps} />
              <MailAuthRoute path="/mail-resend" exact component={MailResend} props={baseProps} />
              <NormalRoute path="/mail-validation/*" exact component={MailValidation} props={baseProps} />
              <Route component={ErrorPage} />
            </Switch>
          }
      </Fragment>
    );
  }
}

//export default App;
export default withRouter(App); //로그아웃 했을 때 로그인화면으로 리다이렉트하기 위해 바꿔준다.
