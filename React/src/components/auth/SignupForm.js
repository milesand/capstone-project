import React from 'react';
import {Col, Row, Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./style2.css"
import logo from './login4.png'; 
import { Link } from "react-router-dom";

// 구글로 로그인하지 않고 서버에 직접 회원 등록하는 경우 폼
const SignupForm = ({username, password, password_val, email, phone, username_err_message, password_err_message, password_val_err_message,
                     email_err_message, phone_err_message, handleChangeUsername, handleChangePassword, handleChangePassword_val,
                     handleChangeEmail, handleChangePhone, handleSubmit, validate}) => {
    return (
      <div className="Signup wrapper fadeInDown">
        <div id="formContent">
          
          <Col xs={12} className="fadeIn">
            <img src={logo} id="usericon" alt="User Icon" />
          </Col>

        <form method="POST" onSubmit={handleSubmit}>
        <label>아이디</label><br></br>
        <input type="text" id="username" className="fadeIn" name="login" placeholder="ID" /*placeholder : 화면의 입력창에 표시할 글자*/
              autoFocus
              value={username}
              onChange={handleChangeUsername}
              />
        <div style={{ color: "red", fontSize: "12px" }}>
          {username_err_message}
        </div>
        <br></br><label>비밀번호</label><br></br>
        <input type="password" id="password" className="fadeIn" name="login" placeholder="Password"  
              value={password}
              onChange={handleChangePassword}
              />
        <div style={{ color: "red", fontSize: "12px" }}>
          {password_err_message}
        </div>
        <br></br><label>비밀번호 확인</label><br></br>
        <input type="password" id="password_val" className="fadeIn" name="login" placeholder="Password"  
              value={password_val}
              onChange={handleChangePassword_val}
              />
        <div style={{ color: "red", fontSize: "12px" }}>
          {password_val_err_message}
        </div>
        <br></br><label>이메일</label><br></br>
        <input type="email" id="email" className="fadeIn" name="login" placeholder="ex) example@exam.com"
              value={email}
              onChange={handleChangeEmail}
              />
        <div style={{ color: "red", fontSize: "12px" }}>
          {email_err_message}
        </div>
        <br></br><label>전화번호</label><br></br>
        <input type="text" id="phone" className="fadeIn" name="login" placeholder="ex) 010-1234-5678" 
              value={phone}
              onChange={handleChangePhone}/>
        <div style={{ color: "red", fontSize: "12px" }}>
          {phone_err_message}
        </div>
        <input type="submit" id="submit" className="fadeIn" value="회원가입" disabled={!validate(username, password, password_val, email, phone)}/> 
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
