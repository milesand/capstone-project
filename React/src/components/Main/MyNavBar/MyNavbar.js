import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faUser,
  faCog,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import "./MyNavbar.css";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Nav,
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverHeader,
  PopoverBody,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import classNames from "classnames";
import axios from "axios";

const MyNavbar = ({ logout, username, nickname, invitationList, invitationNameList,
                    leaderList, leaderNickList, checkInvite, notify}) => {
  console.log("렌더링 시작! invitationList : ", invitationList, invitationNameList);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [update, setUpdate] = useState();

  useEffect(() => {
    // checkInvite();
  });


  const popoverToggle = () => setPopoverOpen(!popoverOpen);

  const option = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
    credentials: "include",
  };

  //팀 초대 수락
  const acceptTeam = (e) => {
    console.log("target : ", e.target);
    const currentTeamId = invitationList[e.target.value];

    console.log("currentTeamId" + currentTeamId);
    axios
      .put(
        `http://localhost/api/team/${currentTeamId}/acceptance`,
        null,
        option
      )
      .then((content) => {
        notify("참가 성공!");
        console.log("here.");
        checkInvite();
      })
      .catch((error) => {
        notify(error.response.data["detail"]);
      });
  };

  //팀 초대 거부
  const denyTeam = (e) => {
    const currentTeamId = e.target.value;

    axios
      .delete(`http://localhost/api/team/${currentTeamId}/acceptance`, option)
      .then((content) => {
        notify("초대를 거절했습니다.");
        checkInvite();
      })
      .catch((error) => {
        notify(error.response.data["detail"]);
      });
    setUpdate(Math.random());
  };

  return (
    <Navbar className="my-navbar" expand="md">
      <NavbarBrand href="/" className="my-navbar-brand">
        Moonge
      </NavbarBrand>
      <NavbarToggler />
      <Collapse navbar>
        <Nav className="mr-auto" navbar />
        <InputGroup className="searchbar-group">
          <InputGroupAddon addonType="append" className="searchbar">
            <Input className="search-input" />
            <Button className="search-icon-button">
              {" "}
              <FontAwesomeIcon icon={faSearch} className="search-icon" />
            </Button>
          </InputGroupAddon>
        </InputGroup>
        <Nav className="myNav-icons">
          <UncontrolledDropdown
            nav
            inNavbar
            className="login-dropdown myNav-item">
            <DropdownToggle nav caret className="login-dropdown-toggle">
              <FontAwesomeIcon icon={faUser} className="login-icon" />
            </DropdownToggle>
            <DropdownMenu right className="login-dropdown-menu slideIn">
              <DropdownItem className="login-dropdown-item login-dropdown-profile">
                <FontAwesomeIcon
                  className="profile-img"
                  size="3x"
                  icon={faUser}/>
                <div>{nickname}님<br/>({username})</div>
              </DropdownItem>
              <DropdownItem className="login-dropdown-item" onClick={logout}>
                로그아웃
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <NavItem className="setting-icon myNav-item">
            <NavLink>
              <FontAwesomeIcon icon={faCog} />
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink>
              <FontAwesomeIcon
                id="Popover1"
                icon={faPaperPlane}
                className="invitation-icon"
              />
              <Popover
                className="invitation-pop-list "
                placement="bottom"
                isOpen={popoverOpen}
                target="Popover1"
                toggle={popoverToggle}
                trigger="legacy"
                hideArrow={true}>
                <PopoverBody className="invitation-pop-body">
                  {invitationList.length == 0 ? 
                    <div className="invitation-pop-item noinvitation">
                      <span>현재 받은 초대가 없습니다.</span>
                    </div>
                    :
                    <div className="invitation-pop-item invitationNum">
                      <span>{invitationList.length}건의 초대 메시지가 있습니다.</span>
                    </div>
                  }
                  
                  {invitationNameList.map((team, index) => {
                    console.log("team : ", team, ', index : ', index);
                    return (
                      <div className="invitation-pop-item" key={index}>
                        <div className="invitation-pop-text">
                          <div className="invitaion-pop-team">팀명 : {team}</div>
                          <div className="invitaion-pop-team">팀장 : {leaderNickList[index]}<br/>({leaderList[index]})</div>
                        </div>
                        <div className="invitation-pop-buttons">
                          <Button
                            className="invitation-pop-button"
                            onClick={acceptTeam}
                            value={index}>
                            수락
                          </Button>
                          <Button
                            className="invitation-pop-button"
                            onClick={denyTeam}
                            value={index}>
                            거부
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </PopoverBody>
              </Popover>
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
};
export default MyNavbar;