import React from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import "./MyContextMenu.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faShare,
  faArrowRight,
  faPen,
  faTrash
} from "@fortawesome/free-solid-svg-icons";

const MyContextMenu = () => {

    const handleClick = () => {
      return ("");
    }
    return (
        <ContextMenu id="contextMenuItemID" className="contextMenu">
        <a href="/">
        <MenuItem className="contextMenuItem" onClick={handleClick()}>
          <FontAwesomeIcon icon={faEye} className="contextMenuIcon" /> 
           <span className="contextMenuText">미리보기</span>
        </MenuItem>
        </a>
        <a href="/">
        <MenuItem className="contextMenuItem" onClick={handleClick()}>
        <FontAwesomeIcon icon={faShare} className="contextMenuIcon" /> 
           <span className="contextMenuText">공유</span>
        </MenuItem>
        </a>
        <MenuItem divider className="contextMenuDivider"/>
        <a href="/">
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={handleClick()}>
          <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
           <span className="contextMenuText">이동</span>
        </MenuItem>
        </a>
        <a href="/">
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={handleClick()}>
        <FontAwesomeIcon icon={faPen} className="contextMenuIcon" /> 
           <span className="contextMenuText">이름바꾸기</span>
        </MenuItem>
        </a>
        <a href="/">
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={handleClick()}>
        <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
           <span className="contextMenuText">삭제</span>
        </MenuItem>
        </a>
      </ContextMenu>

    );
}
export default MyContextMenu;