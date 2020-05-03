import React from 'react';
import "./style2.css"
class GoogleLoginButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
  }

  toggleLoggedIn = () => this.setState(state => {
    return { isLoggedIn: !state.isLoggedIn };
  });

  onSignIn = googleUser => {
    this.props.onSignIn(googleUser);
  };

  renderGoogleLoginButton = () => {   
     console.log('rendering google signin button');
    
    //  window.gapi.signin2.render('login-google');

     window.gapi.signin2.render('login-google', { //window.gapi.signin2.render : 구글 로그인 버튼 렌더링하는 함수
      scope: 'profile email', //로그인할 때 구글측에 요청하는 사용자 정보, 여기서는 사용자 프로파일과 이메일 요청함.
       width: 180,
       height: 35,
       longtitle: true,
       theme: 'dark',
       onsuccess: this.onSignIn, //로그인이 성공했을 때, 이 함수를 호출한다.
      //  onsuccess: this.props.onSignIn,
     });
    
  };

  logout = () => {
    console.log('logout');

    let auth2 = window.gapi && window.gapi.auth2.getAuthInstance();
    if (auth2) {
      auth2
        .signOut()
        .then(() => {
          this.toggleLoggedIn();
          console.log('Logged out successfully');
        })
        .catch(err => {
          console.log('Error while logging out', err);
        });
    } else {
      console.log('error while logging out');
    }
  };

  componentDidMount() {
    window.addEventListener('google-loaded', this.renderGoogleLoginButton);
    window.gapi && this.renderGoogleLoginButton();
  }

  render() {
    return (
      <div>
        {/* <input type="button" id="login-google" className="login-google fadeIn register form-control" value="구글로 로그인"></input> */}
        <div id="login-google" ></div>
        {this.state.isLoggedIn && (
           <div style={{ width: 200, height: 40, textAlign: 'center'}} onClick={this.logout}>
            {/* <input type="button" id="login-google" className="fadeIn register form-control" value="로그아웃"onClick={this.logout}/>  */}
          </div>
        )}
      </div>
    );
  }
}

export default GoogleLoginButton;
