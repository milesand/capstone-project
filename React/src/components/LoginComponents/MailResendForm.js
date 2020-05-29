import React from 'react';
import "./LoginStyle.css";
import {Col} from 'reactstrap';
import logo from './mail.png';
const MailResendForm=({nickname, email, resendAuthEmail, isLoading}) => {
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
              <button
                 type="button"
                 className={'fadeIn' + (isLoading ? ' button is-loading is-medium':'')}
                 onClick={resendAuthEmail}
              >{isLoading?'':'메일 재발송'}</button>
            </form>

          
          </div>
        </div>
      </div>
     
    );
}

export default MailResendForm;