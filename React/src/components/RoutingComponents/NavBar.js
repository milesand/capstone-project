import React, {Fragment} from 'react';
import { Navbar, Nav, NavItem, DropdownItem, 
  NavbarBrand,DropdownMenu,NavDropdown, Form, FormControl, Button } from 'reactstrap';

import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

// 네비게이션 바의 내용을 결정한다.
// 참조 : https://react-bootstrap-v3.netlify.app/components/navs/

const NavBar = ({isLogin, logout}) => {
  return(
    <Navbar>

      <NavbarBrand>
        <Link to="/">Capstone Test</Link>
      </NavbarBrand>

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
        <NavItem eventKey={2} onClick={logout}>
          로그아웃
        </NavItem>
        :
        <NavItem eventKey={3} href='/login'>
          로그인
        </NavItem>
      }
      
      {isLogin ?
        <DropdownMenu eventKey={4} title="메뉴" id="basic-nav-dropdown">
          <DropdownItem eventKey={4.1}>여기에</DropdownItem>
          <DropdownItem eventKey={4.2}>회원정보나</DropdownItem>
          <DropdownItem eventKey={4.3}>팀 관리 같은걸</DropdownItem>
          <DropdownItem divider />
          <DropdownItem eventKey={4.4}>넣으면 될것 같아요</DropdownItem>
        </DropdownMenu>
      : <></>
      }
      </Nav>
    </Navbar>
  );
}
export default NavBar;
