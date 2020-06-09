import React, { Component, useState, useEffect } from "react";
import {
  SelectableGroup,
  SelectAll,
  DeselectAll,
  createSelectable,
} from "react-selectable-fast";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile, faFolder, faStar } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardText,
  Input,
} from "reactstrap";
import "./Item.css";
import classNames from "classnames";
import PreviewModal from '../../Modal/PreviewModal/PreviewModal'

const Item = (props) => {
  const { showFileInfo, pk, thumbnailUrl, itemType, curPk, browserPath,
          name, index, loadFilesNFolders, isMultiCheck, isRename, 
          togglePreviewModal, newName, onChangeNewName, submitNewName, favorite ,isRecycle} = props;

  const { selectableRef, isSelected, isSelecting } = props;
  useEffect(
    () => {
      console.log("in item, props : ", props)
      if (isSelected){
        console.log('rename : ', isRename);
        showFileInfo(index);
      }
    },
    [isSelected]
  );

  const openPreviewModal=()=>{
      togglePreviewModal();
  };

  const handleDirDoubleClick=()=> {
    loadFilesNFolders(name, pk, browserPath);
  }
  
  return (
    <div ref={selectableRef} className="tick">
      <ContextMenuTrigger id={isRecycle 
                              ? 'contextMenuRecycleID'
                              : isMultiCheck 
                                ? itemType=='file' 
                                  ? 'contextMenuMultiFileID'
                                  : 'contextMenuMultiFolderID'
                                : itemType=='file' 
                                  ? favorite
                                    ? "contextMenuFavoriteFileID" 
                                    : "contextMenuFileID" 
                                  : name=='...' ? ''
                                    : favorite
                                      ? "contextMenuFavoriteDirID"
                                      : "contextMenuDirID"}>
        <Card
          body
          outline
          disable={true}
          onContextMenu={()=>showFileInfo(index)}
          className={classNames("item", { "item-selected": isSelected }, {"item-selecting":isSelecting})}
          onDoubleClick={isRecycle ? null : itemType=='file' ? openPreviewModal : handleDirDoubleClick}
          tabIndex="0"
        >
          <div className="item-image">
            {thumbnailUrl && itemType=="file" && <img src={thumbnailUrl} className="item-images" />}
            {!thumbnailUrl && itemType=="file" && (
              <FontAwesomeIcon icon={faFile} className="item-image" size="4x" />
            )}
            {itemType=="folder" &&  <FontAwesomeIcon icon={faFolder} className="item-image" size="4x" />}
            {favorite && <FontAwesomeIcon icon={faStar} className="item-favorite"/>}
          </div>
          <span className="item-divider" />
          {curPk==pk&&isRename ? 
              <Input 
                onKeyPress={submitNewName}
                className='item-rename-box'
                autoFocus
                value={newName}
                onChange={onChangeNewName}
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