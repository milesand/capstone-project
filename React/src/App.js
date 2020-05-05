import React, { Component } from "react";
import NavBar from "./components/routing/Nav";
import Routes from "./Routes";
import "./App.css";
import { withRouter } from "react-router-dom"; //로그아웃 했을 때 로그인 화면으로 리다이렉션하기 위해 import

class App extends Component {
  constructor(props) {
    super(props); //App 컴포넌트가 상속받은 Component가 지니고 있던 생성자를 super를 통해 미리 실행한다.
    console.log('App prop test.');
    this.state = { //컴포넌트의 state 정의
      username: "",
      email: "",
      isAuthenticated: localStorage.getItem('isLogin') ? true : false,
      isMailAuthenticated: localStorage.getItem('isMailAuthenticated') ? true : false
    };
    console.log(this.state);
  }

  // user 정보 받아오기
  componentDidMount() { //컴포넌트가 만들어지고 render가 호출된 이후에 호출되는 메소드
    
    console.log("initiate.");

    //로그인 체크 함수
    let loginCheck = response => {
      console.log("loginCheck test.");
      console.log(response);
      if(!response.hasOwnProperty('error')){
        console.log(response);
        this.setState({
          username: response.username,
          userid: response._id
        });
      }
      else{ //로그아웃 상태인데 JWT 토큰 쿠키가 남아있는 경우 삭제
        this.deleteJWTToken();
      }
      return response;
    }

    //사용자가 로그인 상태인지 확인하기 위해 클라이언트에 HTTPonly jwt cookie가 저장되어 있는지 확인
    fetch('http://localhost/api/user', {
      method: "GET",
      credentials: 'include',
    })
    .then(res=>res.json())
    .then(loginCheck)
    .then(json=>{
      // 브라우저에 JWT 쿠키가 존재하는 상황이라면 서버에 GET 요청하여 해당 access token이 유효한지 확인
      console.log("login check.");
      console.log(this.state);
      if (this.state.isAuthenticated) {
        console.log("token test.");
        console.log(this.state);
        let handleErrors = response => {
          if (!response.ok) {
            throw Error(response.statusText);
          }
          return response;
        }

        let data={
          token: ""
        }

        // JWT 토큰 값이 유효한지 확인하기 위해 /api/jwt-verify로 POST 리퀘스트를 보낸다.
        fetch('http://localhost/api/jwt-verify', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(data)
        })
        .then(res => {
          fetch('http://localhost/api/user', {
            method: "GET",
            credentials: 'include',
          })
          .then(handleErrors)
          .then(res => res.json())
          .then(json => {
            // 현재 유저 정보 받아왔다면, 로그인 상태로 state 업데이트 하고
            console.log("success!!!");
            console.log(json);
            if (json.username) {
              this.setState({ username: json.username,
                              email: json.email,
                              isAuthenticated: true,
                              isMailAuthenticated: json.is_mail_authenticated}); //setState : 컴포넌트의 state를 변경한다. state를 변경하려면 setState를 무조건 거쳐야 한다.
            }
            console.log(this.state);
            // Refresh Token 발급 받아 token의 만료 시간 연장
            fetch('http://localhost/api/jwt-refresh', { //토큰 재발급관련
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data),
              credentials: 'include',
            })
            .then(handleErrors)
            .then(res => res.json())
            .then((json)=>{
              console.log(json);

              console.log('Refresh Token 발급');
              console.log(json.token);
              console.log(this.state);
              this.props.history.push('/') //여기에 메인 페이지 URL 넣으면 됨
            })
            .catch(error => {

              console.log(error);

            });
            ;


          })
          .catch(error => {
            console.log("에러발생!!!!!!!!!!!!!!!!!!!!!!2");
            console.log(json);
            this.handleLogout();

          });
        })
        .catch(error => {
          console.log("에러발생!!!!!!!!");
          this.handleLogout();

        });
      }
    });
  }

  userHasAuthenticated = (authenticated, mailAuthenticated, username, email) => {
    console.log("thisStateTest.", this.state);
    if((!this.state.isAuthenticated||this.state.isAuthenticated==false) && authenticated==true) localStorage.setItem('isLogin', true);
    if((!this.state.isMailAuthenticated||this.state.isMailAuthenticated==false) && mailAuthenticated==true) localStorage.setItem('isMailAuthenticated', true);
    if(email=='google'||email=='facebook'){ //소셜 로그인
      this.setState({
        isAuthenticated: authenticated,
        username: username,
        isMailAuthenticated: true
      });
    }
    else{
      this.setState({
        isAuthenticated: authenticated,
        isMailAuthenticated: mailAuthenticated,
        username: username,
        email: email
      });
    }
  }

  deleteJWTToken(){
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
          this.setState({
            isAuthenticated: false,
            isMailAuthenticated: false,
            username: '',
            userid: ''
          });
          console.log('Logged out successfully');
          this.props.history.push("/login");
        }
      });
    
    }catch{
      console.log("error!");
      this.setState({
        isAuthenticated: false,
        userid: ''
      });
      console.log('Logged out successfully');
    }
  }
  // 로그아웃시 서버로 요청 보내서 JWT 토큰이 저장된 httponly 쿠키 제거
  handleLogout = () => {
    localStorage.removeItem('isLogin');
    localStorage.removeItem('isMailAuthenticated');
    this.deleteJWTToken();
  }

  render() {
    const childProps = {
      username: this.state.username,
      useremail: this.state.email,
      isAuthenticated: this.state.isAuthenticated,
      isMailAuthenticated:this.state.isMailAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };
    console.log("child test.");
    console.log(childProps);
    return (
      <div className="App">
          <NavBar
          isAuthenticated={this.state.isAuthenticated}
          username={this.state.username}
          handleLogout={this.handleLogout}
        />
        <Routes childProps={childProps}/>
      </div>
    );
  }
}

//export default App;
export default withRouter(App); //로그아웃 했을 때 로그인화면으로 리다이렉트하기 위해 바꿔준다.
