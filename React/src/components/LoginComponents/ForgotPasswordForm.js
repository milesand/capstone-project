import React from 'react';
import { Row, Col} from "react-bootstrap";
import "../style2.css"
import { Link } from "react-router-dom";
import logo from './login4.png'; 


const ForgotPasswordForm = ({email, username, isLoading, changeEmail, changeUsername, sendPassword}) => {
    console.log('fpForm : ', isLoading);
    return (
      <div className="Login">
        <div className="wrapper fadeInDown">
          <div id="formContent">
  
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormHeadTextS" >비밀번호 찾기</span><br/><br />
                    <span className="authFormTextS" >가입했을 때 등록한 ID, 이메일 주소를</span><br/>
                    <span className="authFormTextS" >입력해주세요.</span>        
                    
                </div>
            <form onSubmit method="POST">
            <input
                type="text"
                id="username"
                className="fadeIn"
                placeholder="Username"
                autoFocus
                value={username}
                onChange={changeUsername}
              />
              <input
                type="text"
                id="email"
                className="fadeIn"
                placeholder="Email"
                value={email}
                onChange={changeEmail}
              />
              
              <button
                 type="button"
                 className={'fadeIn' + (isLoading ? ' button is-loading is-medium':'')}
                 onClick={sendPassword}
              >{isLoading ? '':'확인'}</button>
             
            </form>

            <div id="formFooter">
              <Row>
                <Col xs={12}>
                   <Link to="/login" className="underlineHover"> 로그인</Link>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default ForgotPasswordForm;
