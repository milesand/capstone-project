import React,{useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTrashAlt,
  faAlignLeft,
  faStar,
  faShareAlt,
  faCloudUploadAlt,
  faHdd
} from "@fortawesome/free-solid-svg-icons";
import { NavItem, NavLink, Nav,Button,Progress } from "reactstrap";
import classNames from "classnames";
import { Link } from "react-router-dom";
import "./SideBar.css";
import SubMenu from "./SubMenu";

const SideBar = ({ isOpen, toggle }) => {
 
  return (
  <div className={classNames("sidebar", {"is-open": isOpen}, {"is-toggled": !isOpen })}>
    <div className="sidebar-header">
      <span color="info" onClick={toggle} style={{ color: "#fff" }}>
        &times;
      </span>
      <div className="sidebar-logo">
      <h3> <FontAwesomeIcon icon={faCloudUploadAlt} className="sidebar-logo-icon" /> Cloud</h3>
      </div>
      <Button color="blue" onClick={toggle} className="sidebar-toggle-button">
        <FontAwesomeIcon icon={faAlignLeft} color="white"/>
      </Button>
    </div>
    <div className="sidebar-menu">
      <Nav vertical className="list-unstyled pb-3 sidebar-menu-list">
        <NavItem className="sidebar-item">
          <NavLink tag={Link} to={"/"} className={classNames({"is-open": isOpen}, {"is-toggled" : !isOpen})}>
            <FontAwesomeIcon icon={faHome} className={classNames("mr-2",{"is-toggled-icon" : !isOpen})} />
            <span>홈</span>
          </NavLink>
        </NavItem>
        <NavItem className="sidebar-item">
          <NavLink tag={Link} to={"/team"} className={classNames({"is-open": isOpen}, {"is-toggled" : !isOpen})}>
            <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
            <span>팀</span>
          </NavLink>
        </NavItem>
        <NavItem className="sidebar-item">
          <NavLink tag={Link} to={"/share"} className={classNames({"is-open": isOpen}, {"is-toggled" : !isOpen})}>
            <FontAwesomeIcon icon={faShareAlt} className="mr-2" />
            <span>공유파일</span>
          </NavLink>
        </NavItem>
        <NavItem className="sidebar-item"> 
          <NavLink tag={Link} to={"/favorite"} className={classNames({"is-open": isOpen}, {"is-toggled" : !isOpen})}>
            <FontAwesomeIcon icon={faStar} className="mr-2" />
            <span>즐겨찾기</span>
          </NavLink>
        </NavItem>
        <NavItem className="sidebar-item">
          <NavLink tag={Link} to={"/trash"} className={classNames({"is-open": isOpen}, {"is-toggled" : !isOpen})}>
            <FontAwesomeIcon icon={faTrashAlt} className="mr-2" />
            <span>휴지통</span>
          </NavLink>
        </NavItem>
      </Nav>
      <div className="sidebar-volume">
        <div className="sidebar-volume-text">
          <FontAwesomeIcon icon={faHdd} className="mr-2" />
          남은 용량 : 7.5G
        </div>
      <Progress value="25" className="sidebar-volume-bar"></Progress>
      <div className="sidebar-volume-text">
      <span>25% 사용중 </span>
      </div>

    </div>
    </div>
 
  </div>
  );
}


export default SideBar;
