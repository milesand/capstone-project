import React from "react";

import {Card,CardImg,CardTitle,CardText,Container } from "reactstrap";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFile} from "@fortawesome/free-solid-svg-icons";
import "./SubSideBar.css";

const SubSideBar = () => (
  
    <div className="sub-sidebar ">
      <div className="sub-sidebar-wrapper">
           <Card body outline color="white" className="sub-item">
             <div className="sub-item-image">
           <FontAwesomeIcon icon={faFile} className="sub-item-image-icon"></FontAwesomeIcon>
           </div>
           <div className="sub-item-text">
           <CardTitle className="sub-item-name">파일 이름</CardTitle>
           <CardText className="sub-item-info">
           <small className="text-muted">파일 위치<br/></small>
           <small className="text-muted">파일 크기 : <br/></small>
             <small className="text-muted">마지막 수정시간 : 하루 전<br/></small>
           </CardText>
           </div>
         </Card>
         </div>
    </div>
 
);



export default SubSideBar;
