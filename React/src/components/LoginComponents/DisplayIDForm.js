import React from 'react';
import '../style2.css';
import {Col, Row} from 'react-bootstrap';
import { Link } from "react-router-dom";
import logo from './login4.png';

const DisplayIDForm=({username}) => {

    return(
        <div className="DisplayID">
        <div className="wrapper fadeInDown">
          <div id="formContent">
            
            <Col xs={12} className="fadeIn">
              <img src={logo} id="usericon" alt="User Icon" />
            </Col>
                <div className="authTextContainer">
 
                    <span className="authFormText">회원님의 닉네임은 </span>
                    <span className="authFormTextS">{username}</span>
                    <span className="authFormText">입니다.</span>
                </div>
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

export default DisplayIDForm;