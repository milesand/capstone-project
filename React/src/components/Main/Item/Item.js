import React, { Component, useEffect } from "react";
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

const Item = (props) => {
  const { showFileInfo, uploadDate, size, pk, thumbnailUrl, itemType, name, index} = props;
  let newThumbnailUrl='/images/79e7268b-d314-44ba-b319-10008cff1793.png';
  console.log("newThumbnail : ", newThumbnailUrl);
  const { selectableRef, isSelected, isSelecting } = props;
  useEffect(
    () => {
      if (isSelected) showFileInfo(index);
    },
    [isSelected]
  );
  return (
    <div ref={selectableRef} className="tick">
      <ContextMenuTrigger id="contextMenuItemID">
        <Card
          body
          outline
          onContextMenu={()=>showFileInfo(index)}
          className={classNames("item", { "item-selected": isSelected },{"item-selecting":isSelecting})}
          tabIndex="0"
        >
          <div className="item-image">
            {thumbnailUrl && itemType=="file" && <img src={newThumbnailUrl} className="item-images" />}
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