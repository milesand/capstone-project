import React, { useState } from "react";
import classNames from "classnames";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import {
  Card,
  CardBody,
  Button,
  CardTitle,
  CardText,
  CardImg,
  CardDeck,
  Container,
  CardGroup
} from "reactstrap";
import "./Item.css";

const Item = () => {

    return (
      <ContextMenuTrigger id="contextMenuItemID">
        <Card body outline className="item" tabIndex="0">
        <FontAwesomeIcon
          icon={faFile}
          className="item-image"
          size="4x"
        ></FontAwesomeIcon>
        <span className="item-divider"></span>
        <div className="item-text">
          <CardTitle className="item-name">파일 이름</CardTitle>
          <CardText>
            <small className="text-muted item-info">
              마지막 수정시간 : 1시간 전
            </small>
          </CardText>
        </div>
      </Card>
      </ContextMenuTrigger>
    );
}
export default Item