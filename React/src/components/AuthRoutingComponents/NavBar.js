import React, {Fragment} from 'react';
import { Navbar, Nav, NavItem, MenuItem, NavDropdown, Form, FormControl, Button } from 'react-bootstrap';

import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

// 네비게이션 바의 내용을 결정한다.
// 참조 : https://react-bootstrap-v3.netlify.app/components/navs/

const NavBar = ({isLogin, username ,logout}) => {
  return(
    <Navbar>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">Capstone Test</Link>
      </Navbar.Brand>
    </Navbar.Header>
      <Nav bsStyle='pills'>
      {
        isLogin
        ?
        <></>
        :
        <NavItem eventKey={1} href="/signup">
        회원가입
        </NavItem>
      }
      
      {
        isLogin
        ?
        <NavItem eventKey={2} onSelect={logout}>
          로그아웃
        </NavItem>
        :
        <NavItem eventKey={3} href='/login'>
          로그인
        </NavItem>
      }
      
      {isLogin ?
        <NavDropdown eventKey={4} title="메뉴" id="basic-nav-dropdown">
          <MenuItem eventKey={4.1}>여기에</MenuItem>
          <MenuItem eventKey={4.2}>회원정보나</MenuItem>
          <MenuItem eventKey={4.3}>팀 관리 같은걸</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey={4.4}>넣으면 될것 같아요</MenuItem>
        </NavDropdown>
      : <></>
      }
      </Nav>
    </Navbar>
  );
}
export default NavBar;
