import React from 'react';
import "./LoginStyle.css";
import {Col} from 'reactstrap';
import logo from './login4.png';

const MailValidationForm=({guideText, toHome, isValid}) => {
    return(
      <div className='LS Login'>
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormTextS" >{guideText}</span>        
                    
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
        </div>
     
    );
}

export default MailValidationForm;