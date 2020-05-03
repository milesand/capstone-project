import React, {Fragment} from 'react';
import {Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

// 화면 위쪽에 나타나는 검은색 바의 내용물을 결정한다.
const NavBar = ({isAuthenticated, username, handleLogout}) => {
  return (
    <Navbar inverse>
      <Navbar.Header>
        <Navbar.Brand>
          {isAuthenticated
            ? <Link to="/">{username}</Link>
            : 'Capstone Test' //로그인 화면 왼쪽 위 문구 결정
          }
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        <Nav pullRight>
          {isAuthenticated
            ? <NavItem onClick={handleLogout}>Logout</NavItem>
            : <Fragment>
                <LinkContainer to="/signup">
                  <NavItem>Signup</NavItem>
                </LinkContainer>
                <LinkContainer to="/login">
                  <NavItem>Login</NavItem>
                </LinkContainer>
              </Fragment>
          }
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavBar;
