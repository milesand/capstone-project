import React from 'react';
import { Row, Col} from "react-bootstrap";
import "./style2.css"
import { Link } from "react-router-dom";
import logo from './login4.png'; 


const ForgotIDForm = ({email, changeEmail, sendID}) => {
    return (
      <div className="Login">
        <div className="wrapper fadeInDown">
          <div id="formContent">
  
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
                    <span className="authFormHeadTextS" >ID 찾기</span><br/><br />
                    <span className="authFormTextS" >가입했을 때 등록한 이메일을 입력해주세요.</span>        
                    
                </div>
            <form onSubmit method="POST">
              <input
                type="text"
                id="email"
                className="fadeIn"
                name="email"
                placeholder="Email"
                autoFocus
                value={email}
                onChange={changeEmail}
              />
               <input
                type="button"
                className="fadeIn"
                value="확인"
                onClick={sendID}
              />  
            </form>

            <div id="formFooter">
              <Row>
                <Col xs={12}>
                   <Link to="/forgot-password" className="underlineHover"> 비밀번호 찾기</Link>
                </Col>
              </Row>
            </div>
          </div>
        </div>
      </div>
    );
  }

export default ForgotIDForm;
