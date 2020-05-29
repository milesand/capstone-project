import React from 'react';
import "./LoginStyle.css";
import {Col} from 'reactstrap';
import logo from './login4.png';

const MailValidationForm=({guideText, toHome, isValid}) => {
    console.log("vali test.");
    return(
        <div className="LS wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormTextS" >{guideText}</span>        
                    
                </div>
            <form>
              {isValid
                ?
                <input
                  type="button"
                  className="fadeIn"
                  value="홈화면으로 이동"
                  onClick={toHome}

                />
                : null
              }  
            </form>

          
          </div>
        </div>
     
    );
}

export default MailValidationForm;