import React from 'react';
import '../style2.css';
import {Col} from 'react-bootstrap';
import logo from './login4.png';

const MailValidationForm=({guideText, toHome, isValid}) => {
    console.log("vali test.");
    return(
        <div className="wrapper fadeInDown">
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