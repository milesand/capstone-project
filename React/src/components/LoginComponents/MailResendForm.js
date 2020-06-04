import React from 'react';
import "./LoginStyle.css";
import {Row, Col, Spinner} from 'reactstrap';
import logo from './mail.png';
const MailResendForm=({nickname, email, resendAuthEmail, isLoading, logout}) => {
    console.log("MailResendForm called!!!");
    return(
        <div className="LS MailResend">
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="emailicon" alt="Email Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormTextS"  >{nickname}</span>
                    <span className="authFormText">님. 입력하신 이메일 주소</span>
                    <div className="authFormTextS" >{email}</div>
                    <span className="authFormText">을 통해 인증을 진행해주세요.</span>
                </div>
            <form>
              <Row>
              <Col xs={6}>
              <button
                 type="button"
                 className={'fadeIn'}
                 onClick={resendAuthEmail}
                 disabled={isLoading}
              >{isLoading ? <Spinner size="sm" color='light'/>:'메일 재발송'}</button>
              </Col>
              <Col xs={6}>
              <button
                 type="button"
                 className={'fadeIn'}
                 onClick={logout}
              >로그아웃</button>
              </Col>
              </Row>
            </form>

          
          </div>
        </div>
      </div>
     
    );
}

export default MailResendForm;