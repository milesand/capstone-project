import React, { Component } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";

import SideBar from "../components/sidebar/SideBar/SideBar";
import HomeContent from "../components/Main/HomeContent";
import TeamContent from "../components/Main/Team/TeamContent";
import SharingContent from "../components/Main/Sharing/SharingContent";
import ProfileContent from "../components/Main/ProfileContent";
import MyNavbar from "../components/Main/MyNavBar/MyNavbar";
import ErrorPage from "../components/LoginComponents/ErrorPage";
import 'bootstrap/dist/css/bootstrap.css';
import "./Home.css";
import {
  Container
} from "reactstrap";

import axios from "axios";
import { Route, Switch } from "react-router-dom";
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
    spaceLeft: -1,
    spacePercentage:-1,
    option: {
      headers: {
          "Content-Type": "application/json",
        },
        withCredentials:true
    }

  };
  this.maxSpace=5; //기가바이트 단위
  console.log("in home, props : ", this.props);
  this.toggleSidebar=this.toggleSidebar.bind(this);
  this.toggle=this.toggle.bind(this);
}

  componentDidMount() {
    console.log("home.js start, props : ", this. props);
    // fetch(`https://${window.location.hostname}/api/user`, {
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
    this.checkUserState();
}


  checkUserState=()=> {
  console.log("check User staet !!!!");
  let getSpace=(size)=>{
    return Math.round(100*(this.maxSpace-size/Math.pow(1000, 3)))/100; 
    //사용자별로 남은 공간 구하기
  }

  let getPercent=(size)=>{
    return Math.round(((this.maxSpace-getSpace(size))/this.maxSpace) * 100);
  }
  
  axios.get(`https://${window.location.hostname}/api/user`, this.state.option)
  .catch(error=>{
    this.props.errorCheck(error.response);
  }) 
  .then(content => {
    this.setState(state=>{
      state.nickname=content['data']['nickname'];
      state.invitationList=content['data']['invitationList'];
      state.spaceLeft= getSpace(content['data']['root_info']['file_size_total']);
      state.percent=getPercent(content['data']['root_info']['file_size_total']);
      return state;
    });

   console.log(JSON.stringify(this.state.invitationList));
   console.log("invitationList: "+JSON.stringify(this.state.invitationList));
  })
  .then(()=>{
    let nameArr=[], leaderArr=[], leaderNickArr=[];
    for(let team in this.state.invitationList){
      let teamID=this.state.invitationList[team]
      console.log("in loop, team : ", teamID);
      axios.get(`https://${window.location.hostname}/api/team-management/${teamID}`, this.state.option)
      .catch(error=>{
        this.props.errorCheck(error.response);
      }) 
      .then(content => {
        console.log('Name team, content : ', content);
        nameArr.push(content['data']['team_name']);
        leaderArr.push(content['data']['team_leader']);
        leaderNickArr.push(content['data']['team_leader_nickname']);
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
  .catch(e=>this.props.notify(e))
  
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

  toProfile=()=>{
    this.props.history.push('/profile');
  }
  render() {

    console.log(`${this.props.match.path}team`)
    return (
      <div className="Home">

       <SideBar toggle={this.toggleSidebar}
                isOpen={this.state.sidebarIsOpen} 
                spaceLeft={this.state.spaceLeft} 
                percent={this.state.percent}
       />
       <Container fluid>
       <MyNavbar logout={this.props.logout}
                 profile={this.toProfile}
                 username={this.state.username}
                 nickname={this.state.nickname}
                 invitationList={this.state.invitationList}
                 invitationNameList={this.state.invitationNameList}
                 leaderList={this.state.leaderList}
                 leaderNickList={this.state.leaderNickList}
                 checkUserState={this.checkUserState}
                 notify={this.props.notify}
                 errorcheck={this.props.errorCheck}
                 >

       </MyNavbar>
       <Container fluid className="content-wrapper" >
        <Switch>
        <AuthenticatedRoute exact path={this.props.match.path}
                            component={HomeContent}
                            checkUserState={this.checkUserState}
                            props={this.props} />

        <AuthenticatedRoute exact path='/profile'
                            component={ProfileContent}
                            checkUserState={this.checkUserState}
                            props={this.props} />

        <AuthenticatedRoute exact path='/sharing'
                            component={SharingContent}
                            checkUserState={this.checkUserState}
                            props={this.props} />

        <AuthenticatedRoute path={`${this.props.match.path}team`} 
                            props={this.props} 
                            component={TeamContent}/>
        </Switch>

      </Container>
     
       </Container>
        <div className="lander">
        </div>
      </div>
    
    );
  }
}
