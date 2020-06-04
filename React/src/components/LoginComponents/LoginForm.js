import React from 'react';
import { Row, Col, Spinner } from "reactstrap";
import "./LoginStyle.css";
import { Link } from "react-router-dom";
import logo from './login4.png'; 
import FacebookLogin from 'react-facebook-login';
// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute

const LoginForm = ({username, password, isLoading, changeUsername,  changePassword,
                    normalLogin, googleLogin, facebookLogin}) => {
    return (
      <div className="LS Login">
        <div className="wrapper fadeInDown">
          <div id="formContent">
          <form method="POST" onSubmit={normalLogin}>
            <div className="register-sns">

              <Col xs={6}>
                <FacebookLogin
                appId="240402274007270"
                autoLoad={true}
                fields="name,email,picture"
                callback={facebookLogin} 
                icon="fa-facebook-square"  
                cssClass="fadeIn register form-control"
                size = "medium"
                textButton = " 페이스북으로 로그인"
                />
              </Col>     
              <Col xs={6}>
              <input
                  onClick={googleLogin}
                  type="button"
                  id="login-google"
                  class="fadeIn register form-control"
                > 
              </input>
              </Col>    
              
            </div>
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
              <input
                type="text"
                id="username"
                className="fadeIn"
                name="id"
                placeholder="ID"
                autoFocus
                value={username}
                onChange={changeUsername}
              />
              <input
                type="password"
                id="password"
                className="fadeIn"
                name="password"
                placeholder="Password"
                autoFocus
                value={password}
                onChange={changePassword}
              />
              <button
                 type="submit"
                 className={'fadeIn'}
                 disabled={isLoading}
              >{isLoading ? <Spinner size="sm" color='light'/>:'로그인'}</button>


            <div id="formFooter">
              <Row>
                <Col xs={6}>
               
                    <Link to="/signup" className="underlineHover">회원가입</Link>
                 
                </Col>
                <Col xs={6}>
                   <Link to="/forgot-id" className="underlineHover"> ID/비밀번호 찾기</Link>
                  
                </Col>
              </Row>
             </div>
            </form>
           </div>
         </div>
       </div>
    );
  }

export default LoginForm;
