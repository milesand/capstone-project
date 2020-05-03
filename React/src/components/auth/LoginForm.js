import React from 'react';
import { Row, Col,  Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./style2.css"
import GoogleLoginButton from "./GoogleLoginButton";
import { LinkContainer } from "react-router-bootstrap";
import { Link } from "react-router-dom";
import logo from './login4.png'; 



// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const LoginForm = ({
    username, password, 
    handleChangeUsername,  
    handleChangePassword, 
    handleSubmit,
    handleGoogleSignIn,
    validate,
    isAuthenticated
  }) => {
    return (
      <div className="Login">
        <div className="wrapper fadeInDown">
          <div id="formContent">
            <div className="register-sns">
              <form>
              <Col xs={6} >
                <input
                  type="button"
                  id="login-facebook"
                  className="fadeIn register form-control"
                  value="페이스북으로 로그인"
                />
              </Col>
              <Col xs={6} className="Login-google">
                <GoogleLoginButton 
                  // id="login-google"
                  className="fadeIn register form-control"
                  //value="구글 계정으로 로그인" 
                  onSignIn={handleGoogleSignIn}
                  isAuthenticated={isAuthenticated}
                >Test</GoogleLoginButton>
              </Col>
              </form>
            
            </div>
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
            <form onSubmit={handleSubmit} method="POST">
              <input
                type="text"
                id="username"
                className="fadeIn"
                name="id"
                placeholder="ID"
                autoFocus
                value={username}
                onChange={handleChangeUsername}
              />
              <input
                type="password"
                id="password"
                className="fadeIn"
                name="password"
                placeholder="Password"
                autoFocus
                value={password}
                onChange={handleChangePassword}
              />
              <input
                type="submit"
                id="submit"
                className="fadeIn"
                value="로그인"
                disabled={!validate(username, password)}
              />

             
            </form>

            <div id="formFooter">
              <Row>
                <Col xs={6}>
               
                    <Link to="/signup" className="underlineHover">회원가입</Link>
                 
                </Col>
                <Col xs={6}>
                   <Link to="/" className="underlineHover"> ID/비밀번호 찾기</Link>
                  
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default LoginForm;
