import React, { Component } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

import SideBar from "../components/sidebar/SideBar/SideBar";
import HomeContent from "../components/Main/HomeContent";
import TeamContent from "../components/Main/TeamContent";
import SubSideBar from "../components/sidebar/SubSideBar/SubSideBar";
import MyNavbar from "../components/Main/MyNavBar/MyNavbar";
import ErrorPage from "../components/LoginComponents/ErrorPage";
import 'bootstrap/dist/css/bootstrap.css';
import "./Home.css";
import {
  Container
} from "reactstrap";

import axios from "axios";
import { Route, Switch, Router } from "react-router-dom";
import NormalRoute from "../components/RoutingComponents/NormalRoute";
import AuthenticatedRoute from "../components/RoutingComponents/AuthenticatedRoute";

export default class Home extends Component { 
  constructor(props) {
    super(props);
  this.state = {
    profile: [],
    sidebarIsOpen:true,
    isOpen:true,
    nickname:this.props.nickname,
    username:this.props.username,
    invitationList:[],
    invitationNameList:[],
    leaderList:[],
    leaderNickList:[],
    option: {
      headers: {
          "Content-Type": "application/json",
        },
        withCredentials:true
    }

  };
  console.log("in home, props : ", this.props);
  this.toggleSidebar=this.toggleSidebar.bind(this);
  this.toggle=this.toggle.bind(this);
}

  componentDidMount() {

    // fetch('http://localhost/api/user', {
    //   method: "GET",
    //   credentials: 'include',
    // })
    // .then(res => res.json())
    // .then(content => {
    //   console.log('json test.');
    //   console.log("profile"+ content[0]);
    //   this.setState({
    //     profile: content
    //   });
    // })
    // .catch(error => alert(error));
    this.checkInvite();
}


  checkInvite=()=> {
  
  axios.get("http://localhost/api/user", this.state.option)
  .then(content => {
    // console.log(content);
    this.setState({invitationList: content['data']['invitationList']});

   console.log(JSON.stringify(this.state.invitationList));
   console.log("invitationList: "+JSON.stringify(this.state.invitationList));
  })
  .then(()=>{
    let nameArr=[], leaderArr=[], leaderNickArr=[];
    for(let team in this.state.invitationList){
      let teamID=this.state.invitationList[team]
      console.log("in loop, team : ", teamID);
      axios.get("http://localhost/api/team-management/" + teamID, this.state.option)
      .then(content => {
        console.log('Name team, content : ', content);
        nameArr.push(content['data']['teamName']);
        leaderArr.push(content['data']['teamLeader']);
        leaderNickArr.push(content['data']['teamLeaderNick']);
      })
    }
    this.setState({
      invitationNameList: nameArr,
      leaderList: leaderArr,
      leaderNickList: leaderNickArr
    });
    console.log("result : ", JSON.stringify(this.state.invitationNameList));
    console.log("invitationList: "+JSON.stringify(this.state.invitationList));
  })
  
}

  toggleSidebar() {
    this.setState({
      sidebarIsOpen: !this.state.sidebarIsOpen
    });
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {

    console.log(`${this.props.match.path}team`)
    return (
      <div className="Home">

       <SideBar toggle={this.toggleSidebar} isOpen={this.state.sidebarIsOpen} />
       <Container fluid>
       <MyNavbar logout={this.props.logout}
                 username={this.state.username}
                 nickname={this.state.nickname}
                 invitationList={this.state.invitationList}
                 invitationNameList={this.state.invitationNameList}
                 leaderList={this.state.leaderList}
                 leaderNickList={this.state.leaderNickList}
                 checkInvite={this.checkInvite}
                 notify={this.props.notify}
                 >

       </MyNavbar>
       <Container fluid className="content-wrapper" >
       <Switch>
       <AuthenticatedRoute exact path={this.props.match.path} component={HomeContent} props={this.props}></AuthenticatedRoute>
       {/* <NormalRoute 
       path={`${this.props.match.path}team`}  
       component={TeamContent} 
       props= {this.props}>      </NormalRoute>  */}
       <Route
        path={`${this.props.match.path}team`}  
        //render={() => <TeamContent username={this.state.username} />}/>      
        render={() => <TeamContent props={this.props} />}/>      
       <Route component={ErrorPage}></Route>
       </Switch>
       {/* <Content /> */}

      </Container>
     
       </Container>
        <div className="lander">
        </div>
      </div>
    
    );
  }
}
// import React, { useState, useEffect } from "react";
// import { BrowserRouter as Router } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";


// import SideBar from "../components/sidebar/SideBar/SideBar";
// import Content from "../components/content/Content";
// import SubSideBar from "../components/sidebar/SubSideBar/SubSideBar";
// import MyNavbar from "../components/content/MyNavBar/MyNavbar";
// import "./Home.css";
// import {
//    Container
// } from "reactstrap";

//  const Home = () => {
//   const [sidebarIsOpen, setSidebarOpen] = useState(true);
//   const toggleSidebar = () => setSidebarOpen(!sidebarIsOpen);

//   const [isOpen, setIsOpen] = useState(false);
//   const toggle = () => setIsOpen(!isOpen);

//   const [profile,setProfile] = useState([]);

//   useEffect(()=> {

//     fetch('http://localhost/api/user', {
//       method: "GET",
//       credentials: 'include',
//     })
//     .then(res => res.json())
//     .then(content => {
//       console.log('json test.');
//       console.log(content);
//       setProfile(content);
//     })
//     .catch(error => alert(error));
// });
//   return (
      
//       <div className="App">
//       <SideBar toggle={toggleSidebar} isOpen={sidebarIsOpen} />
//       <Container fluid>
//       <MyNavbar isOpen={sidebarIsOpen}>
//          {/* { profile['username'] && 
//           <h3>안녕하세요, {profile['nickname']}님.</h3>} */}
//       </MyNavbar>
     
//       <Container fluid className="content-wrapper" >
//       <Content toggleSidebar={toggleSidebar} sidebarIsOpen={sidebarIsOpen}/>
//       <SubSideBar></SubSideBar>
//       </Container>
     
//       </Container>
    
//       </div>
//   );
// };

// export default Home;
