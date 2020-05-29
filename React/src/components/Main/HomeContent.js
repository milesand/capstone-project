import React, { useState, Fragment, useEffect } from "react";
import classNames from "classnames";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import UploadContent from "../StorageComponents/UploadContent";

import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardDeck,
  Container,
  CardGroup,
  Input,
  Progress
} from "reactstrap";
import "./Content.css";
import Item from "./Item/Item";
import MyContextMenu from "./ContextMenu/MyContextMenu";
import SubSideBar from "../sidebar/SubSideBar/SubSideBar";
import 'bootstrap/dist/css/bootstrap.min.css';


const HomeContent = ({props, notify}) => {
  console.log('home, notify : ', notify);
  const [uploadModal, setUploadModal] = useState(false);
  const [flow, setFlow] = useState(null);
  const toggle = () => setUploadModal(!uploadModal);

  return (  
    <Fragment>
    <Container fluid className={classNames("round", "content")} color="light">
      <div className="current-content">
        <span className="content-name">최근 작업</span>
        <div className="add-item">
          <button 
            for="add-items" 
            className="add-item-label"
            onClick={toggle}
          >업로드</button>
          {uploadModal&&<Modal isOpen={uploadModal} toggle={toggle} size='lg' unmountOnClose={false}>
            <ModalHeader toggle={toggle}></ModalHeader>
            <ModalBody>
              <UploadContent 
                flow={flow} 
                setFlow={setFlow} 
                notify={notify}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={toggle} className="close-button">닫기</Button>{' '}
            </ModalFooter>
          </Modal>}
        </div>
      </div>
      <MyContextMenu id="contextMenuItemID" ></MyContextMenu>
      <CardDeck className="current-items">
     {/* { file !== '' && <img className='profile_preview' src={previewURL}></img>} */}
     <Progress></Progress>
     <Item></Item>
     <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
     <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
     <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
     <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      </CardDeck>
      <div className="current-content">
      <span className="content-name">폴더</span>
      </div>
      <CardDeck className="current-items">
        
  <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
  <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      </CardDeck>
      <div className="current-content">
      <span className="content-name">파일</span>
      </div>
      <CardDeck className="current-items">
      <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      <ContextMenuTrigger id="contextMenuID"><Item></Item></ContextMenuTrigger>
      </CardDeck>
    </Container>
      <SubSideBar></SubSideBar>
      </Fragment>
  );
}

export default HomeContent;
