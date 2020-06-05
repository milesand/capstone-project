import React, { useState,useEffect } from "react";

import {Card,CardImg,CardTitle,CardText,Container } from "reactstrap";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFile,faFolder} from "@fortawesome/free-solid-svg-icons";
import "./SubSideBar.css";

const SubSideBar = (props) => {
  const {uploadDate,size,name,pk,thumbnailUrl,type,subfolderNum,fileNum} = props;
  const [update,setUpdate]=useState({});
  let sizeText="";

  if(size>Math.pow(1024, 3)){ //GB
    sizeText=Math.round(size/(1000*1000*1000)*10)/10 + 'GB';
  }
  else if(size>Math.pow(1024, 2)){ //MB
    sizeText=Math.round(size/(1000*1000)*10)/10 + 'MB';
  }
  else if(size>Math.pow(1024, 1)){ //KB
    sizeText=Math.round(size/(1000)*10)/10 + 'KB';
  }
  else{ //Byte
    sizeText=Math.round(size/10)/10 + 'Byte';
  }
  useEffect(
    () => {
      setUpdate({});
    },
    [pk]
  );
  

    return (
    <div className="sub-sidebar ">
      <div className="sub-sidebar-wrapper">
           <Card body outline color="white" className="sub-item">
             <div className="sub-item-image">

               {type=="file" && thumbnailUrl && 
               <img src={thumbnailUrl} className="sub-item-image-thumbnail"></img>}
             {type=="file" && !thumbnailUrl &&
           <FontAwesomeIcon icon={faFile} className="sub-item-image-icon"></FontAwesomeIcon>
             }
             {type=="folder" && <FontAwesomeIcon icon={faFolder} className="sub-item-image-icon"></FontAwesomeIcon>}
           </div>
           <div className="sub-item-text">
<CardTitle className="sub-item-name">{name}</CardTitle>
{type=="file" &&
           <CardText className="sub-item-info">
           <small className="text-muted">파일 크기 : {sizeText} <br/></small>
             <small className="text-muted">업로드 시간 : {uploadDate}<br/></small>
           </CardText>}

             {type=="folder" && 
                  <CardText className="sub-item-info">
                  <small className="text-muted">하위 폴더 수 : {subfolderNum} <br/></small>
                  <small className="text-muted">파일 수 : {fileNum} <br/></small>
                  </CardText>}
           </div>
         </Card>
         </div>
    </div>
 
      )  };



export default SubSideBar;
