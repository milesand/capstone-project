import React, { Fragment } from "react";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import "./MyContextMenu.css";
import PreviewModal from '../../Modal/PreviewModal/PreviewModal';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEye,
  faShare,
  faArrowRight,
  faPen,
  faTrash,
  faDownload,
  faStar,
  faUndo
} from "@fortawesome/free-solid-svg-icons";

const MyContextMenu = (props) => {
    console.log("context menu props : ", props);
    const handleClick = () => {
      return ("");
    }
    return (
      <Fragment>
        {/*단일 파일*/}
        <ContextMenu id="contextMenuFileID" className="contextMenu">
        <MenuItem className="contextMenuItem" onClick={props.handlePreview}>
          <FontAwesomeIcon icon={faEye} className="contextMenuIcon" /> 
           <span className="contextMenuText">미리보기</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" onClick={props.handleDownload}>
          <FontAwesomeIcon icon={faDownload} className="contextMenuIcon" /> 
            <span className="contextMenuText">다운로드</span>
        </MenuItem>
        <MenuItem divider className="contextMenuDivider"/>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleMove}>
          <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
           <span className="contextMenuText">이동</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleFavorite}>
          <FontAwesomeIcon icon={faStar} className="contextMenuIcon" /> 
           <span className="contextMenuText">즐겨찾기</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleRename}>
          <FontAwesomeIcon icon={faPen} className="contextMenuIcon" /> 
            <span className="contextMenuText">이름바꾸기</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleDelete}>
          <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
            <span className="contextMenuText">삭제</span>
        </MenuItem>
      </ContextMenu>

      {/*즐겨찾기 등록된 단일 파일*/}
      <ContextMenu id="contextMenuFavoriteFileID" className="contextMenu">
        <MenuItem className="contextMenuItem" onClick={props.handlePreview}>
          <FontAwesomeIcon icon={faEye} className="contextMenuIcon" /> 
           <span className="contextMenuText">미리보기</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" onClick={props.handleDownload}>
          <FontAwesomeIcon icon={faDownload} className="contextMenuIcon" /> 
            <span className="contextMenuText">다운로드</span>
        </MenuItem>
        <MenuItem divider className="contextMenuDivider"/>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleMove}>
          <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
           <span className="contextMenuText">이동</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleFavorite}>
          <FontAwesomeIcon icon={faStar} className="contextMenuIcon" /> 
           <span className="contextMenuText">즐겨찾기 해제</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleRename}>
          <FontAwesomeIcon icon={faPen} className="contextMenuIcon" /> 
            <span className="contextMenuText">이름바꾸기</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleDelete}>
          <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
            <span className="contextMenuText">삭제</span>
        </MenuItem>
      </ContextMenu>

      {/*두개 이상의 파일*/}
      <ContextMenu id="contextMenuMultiFileID" className="contextMenu">
        <MenuItem className="contextMenuItem" onClick={props.handleDownload}>
          <FontAwesomeIcon icon={faDownload} className="contextMenuIcon" /> 
            <span className="contextMenuText">다운로드</span>
        </MenuItem>
        <MenuItem divider className="contextMenuDivider"/>
        <MenuItem className="contextMenuItem" onClick={props.handleMove}>
          <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
           <span className="contextMenuText">이동</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" onClick={props.handleDelete}>
          <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
            <span className="contextMenuText">삭제</span>
        </MenuItem>
      </ContextMenu>

      {/*단일 디렉토리*/}
      <ContextMenu onShow={props.onShow} id="contextMenuDirID" className="contextMenu">
      <MenuItem className="contextMenuItem" onClick={props.handleShare}>
        <FontAwesomeIcon icon={faShare} className="contextMenuIcon" /> 
          <span className="contextMenuText">공유 설정 변경</span>
      </MenuItem>
      <MenuItem divider className="contextMenuDivider"/>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleMove}>
        <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
        <span className="contextMenuText">이동</span>
      </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleFavorite}>
          <FontAwesomeIcon icon={faStar} className="contextMenuIcon" /> 
           <span className="contextMenuText">즐겨찾기</span>
        </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleRename}>
        <FontAwesomeIcon icon={faPen} className="contextMenuIcon" /> 
          <span className="contextMenuText">이름바꾸기</span>
      </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleDelete}>
        <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
          <span className="contextMenuText">삭제</span>
      </MenuItem>
      </ContextMenu>

      {/*즐겨찾기 등록된 단일 디렉토리*/}
      <ContextMenu onShow={props.onShow} id="contextMenuFavoriteDirID" className="contextMenu">
      <MenuItem className="contextMenuItem" onClick={props.handleShare}>
        <FontAwesomeIcon icon={faShare} className="contextMenuIcon" /> 
          <span className="contextMenuText">공유 설정 변경</span>
      </MenuItem>
      <MenuItem divider className="contextMenuDivider"/>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleMove}>
        <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
        <span className="contextMenuText">이동</span>
      </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleFavorite}>
          <FontAwesomeIcon icon={faStar} className="contextMenuIcon" /> 
           <span className="contextMenuText">즐겨찾기 해제</span>
        </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleRename}>
        <FontAwesomeIcon icon={faPen} className="contextMenuIcon" /> 
          <span className="contextMenuText">이름바꾸기</span>
      </MenuItem>
      <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleDelete}>
        <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
          <span className="contextMenuText">삭제</span>
      </MenuItem>
      </ContextMenu>

      {/*두개 이상의 디렉토리*/}
      <ContextMenu id="contextMenuMultiFolderID" className="contextMenu">
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleMove}>
          <FontAwesomeIcon icon={faArrowRight} className="contextMenuIcon" /> 
           <span className="contextMenuText">이동</span>
        </MenuItem>
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleDelete}>
          <FontAwesomeIcon icon={faTrash} className="contextMenuIcon" /> 
            <span className="contextMenuText">삭제</span>
        </MenuItem>
      </ContextMenu>

      {/*휴지통*/}
      <ContextMenu id="contextMenuRecycleID" className="contextMenu">
        <MenuItem className="contextMenuItem" data={{ foo: "bar" }} onClick={props.handleRecover}>
          <FontAwesomeIcon icon={faUndo} className="contextMenuIcon" /> 
            <span className="contextMenuText">복구</span>
        </MenuItem>
      </ContextMenu>
      </Fragment>
    );
}
export default MyContextMenu;