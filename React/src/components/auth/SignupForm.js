import React from 'react';
import {Col, Row, Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./style2.css"
import logo from './login4.png'; 
import { Link } from "react-router-dom";

// 구글로 로그인하지 않고 서버에 직접 회원 등록하는 경우 폼
const SignupForm = ({username, password, password_val, email, phone, handleChangeUsername, handleChangePassword, handleChangePassword_val, handleChangeEmail, handleChangePhone, handleSubmit, validate}) => {
    return (
      <div className="Signup wrapper fadeInDown">
        <div id="formContent">
          
          <Col xs={12} className="fadeIn">
            <img src={logo} id="usericon" alt="User Icon" />
          </Col>

        <form methode="POST" onSubmit={handleSubmit}>
        <input type="text" id="username" className="fadeIn" name="login" placeholder="Username" /*placeholder : 화면의 입력창에 표시할 글자*/
              autoFocus
              value={username}
              onChange={handleChangeUsername}
              />
        <input type="password" id="password" className="fadeIn" name="login" placeholder="Password"  
              autoFocus
              value={password}
              onChange={handleChangePassword}
              />
        <input type="password" id="password_val" className="fadeIn" name="login" placeholder="Password_val"  
              autoFocus
              value={password_val}
              onChange={handleChangePassword_val}
              />
        <input type="email" id="email" className="fadeIn" name="login" placeholder="Email"
              value={email}
              onChange={handleChangeEmail}
              />
        <input type="phone" id="phone_num" className="fadeIn" name="login" placeholder="Phone Number" 
              autoFocus
              value={phone}
              onChange={handleChangePhone}/>
        <input type="submit" id="submit" className="fadeIn" value="회원가입" disabled={!validate(username, password, password_val)}/> 
        </form>
        <div id="formFooter">
              <Row>
                <Col xs={6}>
               
                    <Link to="/login" className="underlineHover">로그인</Link>
                 
                </Col>
                <Col xs={6}>
                   <Link to="/" className="underlineHover"> ID/비밀번호 찾기</Link>
                  
                </Col>
              </Row>
            </div>
        </div>
      </div>
    );
  }

export default SignupForm;
