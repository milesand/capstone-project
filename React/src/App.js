import React, { Component } from "react";
import NavBar from "./components/routing/Nav";
import Routes from "./Routes";
import "./App.css";
import { withRouter } from "react-router-dom"; //로그아웃 했을 때 로그인 화면으로 리다이렉션하기 위해 import
import cookie from 'react-cookies';

class App extends Component {
  constructor(props) {
    super(props); //App 컴포넌트가 상속받은 Component가 지니고 있던 생성자를 super를 통해 미리 실행한다.

    this.state = { //컴포넌트의 state 정의
      username: "",
      userid: "",
    };
  }

  // user가 로그인 중인지 확인하고, 로그인 중이라면 유저의 정보를 서버로부터 받아온다.
  componentDidMount() { //컴포넌트가 만들어지고 render가 호출된 이후에 호출되는 메소드
    
    console.log("initiate.");
    let isLogin=false;

    //로그인 체크 함수
    let loginCheck = response => {
      if(!response.hasOwnProperty('error')){
        console.log(response);
        this.setState({
          username: response.username,
          userid: response._id
        });
        isLogin=true;
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
      if (isLogin) {
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
        fetch('http://localhost/api/jwt-verify', { //서버에 실을 때는 :8000 지워야합니다.
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
                              userid: json._id}); //setState : 컴포넌트의 state를 변경한다. state를 변경하려면 setState를 무조건 거쳐야 한다.
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
              this.setState({
                  isAuthenticated: true
              });

              console.log('Refresh Token 발급');
              console.log(json.token);
              console.log(this.state);
              this.props.history.push('/login-test') //여기에 메인 페이지 URL 넣으면 됨
            })
            .catch(error => {

              console.log(error);

            });
            ;


          })
          .catch(error => {
            console.log("에러발생2!!!!!!!!");
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

  // 새로운 User가 로그인 했다면 (서버로 부터 access token을 발급받았을 것이고) 해당 토큰을 localStorage에 저장
  userHasAuthenticated = (authenticated, id, username) => {
    this.setState({
      isAuthenticated: authenticated,
      userid: id,
      username: username
    });
  }

  // 로그인 상태였던 유저가 로그아웃을 시도한다면 토큰을 지움
  handleLogout = () => {

    // 이 부분 이슈 잡아야 하는데, 사실 f5 리프레쉬 됐을때 구글 로그인 로직이 자동 호출되는 것만 막으면 됨
    // Login.js -> handleGoogleSignIn() 함수
    try {
      fetch('http://localhost/api/logout', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      })
      .then(res=>{
        console.log(res);
        this.setState({
          isAuthenticated: false,
          userid: ''
        });
        console.log('Logged out successfully');
        this.props.history.push("/login");
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

  render() {
    const childProps = {
      username: this.state.id,
      isAuthenticated: this.state.isAuthenticated,
      userHasAuthenticated: this.userHasAuthenticated
    };
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
