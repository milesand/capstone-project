import React from 'react';
import "./LoginStyle.css";
import {Col} from 'reactstrap';
import logo from './mail.png';
import {Link} from 'react-router-dom'
const MailResendForm=({username, email, returnToLogin}) => {

    return(
        <div className="LS MailResend">
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="emailicon" alt="Email Icon" />
            </Col>
                <div className="authTextContainer">
                    <div className="authFormTextS">입력하신 이메일 주소로 임시 비밀번호를</div>
                    <div className="authFormTextS">보내드렸습니다.</div>
                    <div className="authFormTextS">임시 비밀번호를 사용하여 로그인 해주세요.</div>
                </div>
            <form>
            
              <input
                type="button"
                className="fadeIn"
                value="로그인 화면으로"
                onClick={returnToLogin}
              />
            </form>

          
          </div>
        </div>
      </div>
     
    );
}

export default MailResendForm;