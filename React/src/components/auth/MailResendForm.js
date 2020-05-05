import React from 'react';
import './style2.css';
import {Col} from 'react-bootstrap';
import logo from './mail.png';

const MailResendForm=({username, email, resendAuthEmail}) => {

    return(
        <div className="MailResend">
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="emailicon" alt="Email Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormTextS"  >{username}</span>
                    <span className="authFormText">님. 입력하신 이메일 주소</span>
                    <div className="authFormTextS" >{email}</div>
                    <span className="authFormText">을 통해 인증을 진행해주세요.</span>
                </div>
            <form>
              <input
                type="button"
                className="fadeIn"
                value="메일 재발송"
                onClick={resendAuthEmail}

              />  
            </form>

          
          </div>
        </div>
      </div>
     
    );
}

export default MailResendForm;