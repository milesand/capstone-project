import React, { useState, useEffect, Fragment } from "react";
import classNames from "classnames";
import axios from "axios";
import {
  Spinner,
  Container,
  Input,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Table,
  InputGroup,
  InputGroupAddon,
} from "reactstrap";
import "./TeamContent.css";
import loadTeamList from './LoadTeamList'

/*modal*/
import TeamAddModal from './Modal/TeamAddModal/TeamAddModal';
import TeamInviteModal from './Modal/TeamInviteModal/TeamInviteModal';
import TeamModifyModal from './Modal/TeamModifyModal/TeamModifyModal';
import TeamLeaveModal from './Modal/TeamLeaveModal/TeamLeaveModal';
import TeamDeleteModal from "./Modal/TeamDeleteModal/TeamDeleteModal";


const TeamContent = (props) => {
  const nickname=props.nickname; //닉네임, 웹페이지 표시용
  const username=props.username; //로그인 아이디, 서버 요청용
// Modal On/Off
  const [teamAddModal, setTeamAddModal] = useState(false);
  const [teamInviteModal, setTeamInviteModal] = useState(false);
  const [teamModifyModal, setTeamModifyModal] = useState(false);
  const [teamLeaveModal, setTeamLeaveModal] = useState(false);
  const [teamDeleteModal, setTeamDeleteModal] = useState(false);


  const [teamList, setTeamList] = useState([]); //내가만든 팀
 
  const [myTeamName, setMyTeamName] = useState(""); //만들거나 수정할 팀 이름 
  const [friendList, setFriendList] = useState([]); //현재는 전체유저리스트
  const [friendName, setFriendName] = useState(""); //검색할 유저 이름 

  const friendChecked = []; //다수 초대할때 선택한 인덱스 
  const [currentTeamId, setCurrentTeamID] = useState(""); //초대하거나 수정할때 현재 팀id
  const [currentTeamName, setCurrentTeamName] = useState("");//초대하거나 수정할때 현재 팀name
  const [teamLeader, setTeamLeader] = useState(""); //버튼 클릭했을때 그 팀의 팀장
  const [teamLeaderNick, setTeamLeaderNick] = useState(""); // 팀장의 닉네임
  const [memberList, setMemberList] = useState([]); //선택한 팀의 멤버
  const [memberListNick, setMemberListNick] = useState([]); //선택한 팀의 멤버 닉네임
  const [memberListId, setMemberListId] = useState([]); //선택한 팀의 멤버id
  const [isLeader, setIsLeader] = useState(false); //선택한 팀이 자신이 만든팀인지 확인
  const [renameTeamCheck, setRenameTeamCheck] = useState(false); //팀 이름 변경  on/off
  const [isLoading, setIsLoading] = useState(true);

 

  useEffect(() => {
    loadTeamList(setIsLoading, setTeamList, props);
  }, []);

  //axios config
  const option = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };


  /*modal toggle function*/

  //팀 생성 modal on/off
  const toggleTeamAddModal = () => {
    setTeamAddModal(!teamAddModal);
    setMyTeamName("");
  };

  //팀 초대 modal on/off
  const toggleTeamInviteModal = () => {
    setTeamInviteModal(!teamInviteModal);
  };

  //팀 수정 modal on/off
  const toggleTeamModifyModal = () => {
    setTeamModifyModal(!teamModifyModal);
    setMyTeamName("");
  };

  //팀 이름변경 on/off
  const toggleRenameTeam = () => {
    setRenameTeamCheck(!renameTeamCheck);
  };

  //팀 탈퇴 modal on/off
  const toggleTeamLeaveModal = () => {
    setTeamLeaveModal(!teamLeaveModal);
  };

  //팀 삭제 modal on/off
  const toggleTeamDeleteModal = () => {
    setTeamDeleteModal(!teamDeleteModal);
  };

  //팀명 change
  const onChangeTeamName = (e) => {
    setMyTeamName(e.target.value);
  };

  //팀 생성
  const teamAdd = () => {
    const TeamNameData = {
      team_name: myTeamName,
      team_leader: username,
    };
    console.log("team name data : ", TeamNameData);
    const body = JSON.stringify(TeamNameData);
    const option = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };

    if (myTeamName == "") {
      props.notify("이름을 입력하세요.");
      setMyTeamName("");
    } else {
      axios.post(`${window.location.origin}/api/team`, body, option)
        .catch(error=>{
          props.errorCheck(error.response);
          if(error.response.status>=400) throw Error(error.response.data['error']);
        }) 
        .then((content) => {
          console.log(content);
          console.log(JSON.stringify(TeamNameData));
          if (content.hasOwnProperty("error")) {
            throw Error("error");
          } else {
            toggleTeamAddModal();
            props.notify("팀 생성 완료!");
            loadTeamList(setIsLoading, setTeamList, props);
          }
        })
        .catch(e=>props.notify(e))
      setMyTeamName("");
      toggleTeamAddModal();
    }
  };

  //사용자 키워드 검색
  const friendSearch = (name) => {
    if(name=='') return;
    if(typeof(name)=='object') name=friendName;
    console.log("search name : ", name);
    axios.get(`${window.location.origin}/api/search-user/${currentTeamId}/${name}`,option) //검색버튼 안눌러도 즉각적으로 결과보여주기
    .then(content => { 
      setFriendList(content.data);
    })
  }

  //초대할 팀 선택
  const setCurrentInviteTeam=(e)=>{
    setCurrentTeamID(e.target.value);
    toggleTeamInviteModal();
  }
  
  //팀 초대
  const teamInvite = () => {
    console.log("here!, frendChecked : ", friendChecked);
    for (let i = 0; i < friendChecked[0].length; i++) {
      const option = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
        credentials: "include",
      };
      const userName = {
        username: friendList[friendChecked[0][i]]["username"],
      };
      console.log('invite check, ', friendList, friendList[friendChecked[0][i]]["username"]);
      const body = JSON.stringify(userName);
      axios.put(
          `${window.location.origin}/api/team/${currentTeamId}/invitation`,
          body,
          option
        )
        .catch(error=>{
          console.log("error : ", error.response.status);
          props.errorCheck(error.response, error.response.data['error']);
          if(error.response.status>=400) throw Error(error.response.data['error']);
        }) 
        .then((content) => {
          console.log("invitation : " + JSON.stringify(content));
          if (content.hasOwnProperty("error")) {
            props.notify("error");
          } else {
            props.notify("초대 완료!");
            toggleTeamInviteModal();
            setFriendName('');
          }
        })
        .catch((e) => {
          props.notify(e);
        });
    }

    toggleTeamInviteModal();
  };

  const onChangeFriendName = (e) => { //검색용
    setFriendName(e.target.value);
    friendSearch(e.target.value);
  };

  //선택한 유저 저장
  const friendOnCheck = (value) => {
    console.log('select val : ', value, ', friend check list : ', friendChecked);
    friendChecked.pop();
    friendChecked.push(value);
    console.log(friendChecked[0]);
  };


  //팀 수정
  const teamModify = (e) => {
    setCurrentTeamID(e.target.value);
    setCurrentTeamName(e.target.name);

    axios.get(`${window.location.origin}/api/team-management/${e.target.value}`, option)
      .catch(error=>{
        props.errorCheck(error.response);
      }) 
      .then((content) => {
        let nameArr=[], nickArr=[], idArr=[];
        console.log(content['data'])
        setTeamLeader(content["data"]["team_leader"]);
        setTeamLeaderNick(content['data']['team_leader_nickname']);
        for(let idx in content['data']['member_list']){
          nameArr.push(content['data']['member_list'][idx]['username']);
          nickArr.push(content['data']['member_list'][idx]['nickname']);
          idArr.push(content['data']['member_list'][idx]['_id']);
        }
        setMemberList(nameArr);
        setMemberListNick(nickArr);
        setMemberListId(idArr);
        if (content["data"]["team_leader"] == username) {
          setIsLeader(true);
        } 
        else {
          setIsLeader(false);
        }
        toggleTeamModifyModal();
      })
      .catch(e=>props.notify(e));
  };

  //팀 이름 변경
  const renameTeam = () => {
    const data = {
      _id: currentTeamId,
      team_name: myTeamName,
      team_leader: username,
    };

    axios.put(
        `${window.location.origin}/api/team-management/${currentTeamId}`,
        data,
        option
      )
      .catch(error=>{
        props.errorCheck(error.response);
        return error.response;
      }) 
      .then((content) => {
        console.log("content : ", content);
        if(content.status>=400){
          setMyTeamName('');
          throw Error(content.data['error']);
        }
        props.notify("이름 변경 완료!");
        setCurrentTeamName(myTeamName);
        loadTeamList(setIsLoading, setTeamList, props);
      })
      .catch(e => props.notify(e));
    setRenameTeamCheck(!renameTeamCheck);
  };

  //팀 탈퇴
  const teamLeave = () => {
    const option = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      credentials: "include",
    };
    console.log("현재 팀 id : " + currentTeamId);
    axios.put(`${window.location.origin}/api/team/${currentTeamId}/secession`, null, option)
    .catch(error=>{
      props.errorCheck(error.response);
    }) 
    .then(() => {
      props.notify("탈퇴가 완료되었습니다.");
      loadTeamList(setIsLoading, setTeamList, props);
      toggleTeamLeaveModal();
      toggleTeamModifyModal();
    })
    .catch(e=>props.notify(e))
    toggleTeamLeaveModal();
  };

  //팀 삭제
  const teamDelete = () => {
    const option = {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
      credentials: "include",
    };
    axios.delete(`${window.location.origin}/api/team-management/${currentTeamId}`, option)
      .catch(error=>{
        props.errorCheck(error.response);
      }) 
      .then((content) => {
        props.notify("팀 삭제완료.");
        loadTeamList(setIsLoading, setTeamList, props);
      })
      .catch(e=>props.notify(e))
    toggleTeamDeleteModal();
    toggleTeamModifyModal();
  };

  return (
    <Fragment>
      <Container
        fluid
        className={classNames("round", "content", "team-content")}
        color="light">
        <div className="current-content">

          {/*--------------- Modal  ---------------*/}

          {/* 팀 생성 modal*/}
          <TeamAddModal
            teamAddModal={teamAddModal}
            toggleTeamAddModal={toggleTeamAddModal}
            myTeamName={myTeamName}
            onChangeTeamName={onChangeTeamName}
            teamAdd={teamAdd}
          />

          {/* 팀 초대 modal*/}
          <TeamInviteModal
            teamInviteModal={teamInviteModal}
            toggleTeamInviteModal={toggleTeamInviteModal}
            friendName={friendName}
            onChangeFriendName={onChangeFriendName}
            friendSearch={friendSearch}
            friendOnCheck={friendOnCheck}
            teamInvite={teamInvite}
            friendList={friendList}
          />

          {/* 팀수정 modal*/}
          <TeamModifyModal
            teamModifyModal={teamModifyModal}
            toggleTeamModifyModal={toggleTeamModifyModal}
            renameTeamCheck={renameTeamCheck}
            isLeader={isLeader}
            currentTeamName={currentTeamName}
            onChangeTeamName={onChangeTeamName}
            toggleRenameTeam={toggleRenameTeam}
            myTeamName={myTeamName}
            renameTeam={renameTeam}
            teamLeaderNick={teamLeaderNick}
            teamLeader={teamLeader} 
            memberListNick={memberListNick}
            memberList={memberList}
            toggleTeamLeaveModal={toggleTeamLeaveModal}
            toggleTeamDeleteModal={toggleTeamDeleteModal}
          />

          {/* //팀 탈퇴 */}
          <TeamLeaveModal
            teamLeaveModal={teamLeaveModal}
            toggleTeamLeaveModal={toggleTeamLeaveModal}
            teamLeave={teamLeave}
          />

          {/* //팀삭제 */}
          <TeamDeleteModal
            teamDeleteModal={teamDeleteModal}
            toggleTeamDeleteModal={toggleTeamDeleteModal}
            teamDelete={teamDelete}
          />

          <span className="content-name">팀</span>
          <div className="add-item">
              <Button onClick={toggleTeamAddModal} className="add-team-button">
                팀 생성
              </Button>
          </div>
        </div>





        {/* 팀 테이블 */}
          <div className="team-table">
            <Table hover className="team-list">
              <tbody className="team-table-body">
                <tr>
                  <th />
                  <th>이름</th>
                  <th>인원</th>
                  <th>팀장</th>
                  <th className="thd-share">공유폴더수</th>
                  <th className="thd-buttons" />
                </tr>
                {isLoading ?
                  <Spinner size='lg' color='primary' className='team-spinner'/>
                :
                teamList.map((team, index) => {
                  return (
                    <tr className="team-item" key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{team["team_name"]}</td>
                      <td>{team["member_list"].length + 1}</td>
                      <td>{team["team_leader_nickname"]}<br/>({team["team_leader"]})</td> 
                      <td className="thd-share">{team["share_folders"].length}</td>
                      <td className="team-table-button thd-buttons">
                        {team["team_leader"] == username && (
                          <Button
                            onClick={(e) => setCurrentInviteTeam(e)}
                            className="team-invite-button"
                            value={team["_id"]}
                            name={team["team_name"]}>
                            초대
                          </Button>
                        )}

                        <Button
                          onClick={teamModify}
                          className="team-modify-button"
                          value={team["_id"]}
                          name={team["team_name"]}>
                          수정
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

      </Container>
    </Fragment>
  );
};

export default TeamContent;
