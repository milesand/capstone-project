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
  CardBody,
  Button,
  CardTitle,
  CardText,
  CardImg,
  CardDeck,
  Container,
  CardGroup,
} from "reactstrap";
import "./Item.css";
import classNames from "classnames";
import PreviewModal from '../../Modal/PreviewModal/PreviewModal'
const Item = (props) => {
  const { showFileInfo, uploadDate, size, userPk, pk, thumbnailUrl, isVideo, itemType, name, index, handleDownload} = props;
  const { selectableRef, isSelected, isSelecting } = props;
  const [toggle, setToggle]=useState(false);
  useEffect(
    () => {
      if (isSelected) showFileInfo(index);
    },
    [isSelected]
  );

  const togglePreviewModal=()=>{
      setToggle(!toggle);
  };

  return (
    <div ref={selectableRef} className="tick">
      {isSelected && <PreviewModal 
          isOpen={toggle} 
          toggle={togglePreviewModal} 
          fileName={name}
          fileID={pk}
          hasThumbnail={thumbnailUrl}
          isVideo={isVideo}
        />
      }
      <ContextMenuTrigger id="contextMenuItemID">
        <Card
          body
          outline
          onContextMenu={()=>showFileInfo(index)}
          className={classNames("item", { "item-selected": isSelected },{"item-selecting":isSelecting})}
          onDoubleClick={itemType=='file' && togglePreviewModal}
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
            <div className="item-text">
              <CardText className="item-name">{name.length>15 ? name.substr(0, 15) + '...' : name}</CardText>
            </div>
        </Card>
      </ContextMenuTrigger>
    </div>
  );
};

export default createSelectable(Item);