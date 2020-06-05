import React, { Component, useState, useEffect } from "react";
import {
  SelectableGroup,
  SelectAll,
  DeselectAll,
  createSelectable,
} from "react-selectable-fast";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile,faFolder } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardText,
  Input,
} from "reactstrap";
import "./Item.css";
import classNames from "classnames";
import PreviewModal from '../../Modal/PreviewModal/PreviewModal'

const Item = (props) => {
  const { showFileInfo, pk, thumbnailUrl, itemType, curName,
          name, index, loadFilesNFolders, isMultiCheck, isRename, 
          togglePreviewModal, newName, onChangeNewName, submitNewName} = props;

  const { selectableRef, isSelected, isSelecting } = props;
  const [toggle, setToggle]=useState(false);
  useEffect(
    () => {
      if (isSelected){
        console.log('rename : ', isRename);
        showFileInfo(index);
      }
    },
    [isSelected]
  );

  const openPreviewModal=()=>{
      console.log("here!!!, host : ", window.location.host);

      togglePreviewModal();
  };

  const handleDirDoubleClick=()=> {
    loadFilesNFolders(name, pk);
  }
  
  return (
    <div ref={selectableRef} className="tick">
      <ContextMenuTrigger id={isMultiCheck 
                              ? itemType=='file' 
                                ? 'contextMenuMultiFileID'
                                : 'contextMenuMultiFolderID'
                              : itemType=='file' 
                                ? "contextMenuFileID" 
                                : "contextMenuDirID"}>
        <Card
          body
          outline
          onContextMenu={()=>showFileInfo(index)}
          className={classNames("item", { "item-selected": isSelected },{"item-selecting":isSelecting})}
          onDoubleClick={itemType=='file' ? openPreviewModal : handleDirDoubleClick}
          tabIndex="0"
        >
          <div className="item-image">
            {thumbnailUrl && itemType=="file" && <img src={thumbnailUrl} className="item-images" />}
            {!thumbnailUrl && itemType=="file" && (
              <FontAwesomeIcon icon={faFile} className="item-image" size="4x" />
            )}
            {itemType=="folder" &&  <FontAwesomeIcon icon={faFolder} className="item-image" size="4x" />}
           
          </div>
          <span className="item-divider" />
          {curName==name&&isRename ? 
              <Input 
                onKeyPress={submitNewName}
                className='item-rename-box'
                value={newName}
                onChange={onChangeNewName}
                autoFocus
              />
              :
            <div className="item-text">
                <CardText className="item-name">{name.length>15 ? name.substr(0, 15) + '...' : name}</CardText>
            </div>
            }
        </Card>
      </ContextMenuTrigger>
    </div>
  );
};

export default createSelectable(Item);