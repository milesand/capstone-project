import React from 'react';
import './style2.css';
import {Col} from 'react-bootstrap';
import logo from './login4.png';

const MailValidationForm=({toHome}) => {
    console.log("vali test.");
    return(
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormTextS" >메일 인증이 완료되었습니다. 사이트 이름(추후에 수정)의 기능을 즐겨보세요!</span>        
                    
                </div>
            <form>
              <input
                type="button"
                className="fadeIn"
                value="홈화면으로 이동"
                onClick={toHome}

              />  
            </form>

          
          </div>
        </div>
     
    );
}

export default MailValidationForm;