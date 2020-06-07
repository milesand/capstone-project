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
import {
  BaseTable,
  Tbody,
  Tr,
  Td,
} from "react-row-select-table";
import "./TeamContent.css";
import loadTeamList from './LoadTeamList'
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faSearch
} from "@fortawesome/free-solid-svg-icons";

const CustomTable = styled.div`
  table {
    border-collapse: inherit;
    border-spacing: 0px;
    width: 99% !important;
    /* float: right; */
    border-radius: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: #c9c9c9;
    color: #505050 !important;
  }
  thead {
    float: left;
    width: 100%;
  }
  tbody {
    overflow-y: scroll !important;
    overflow-x: hidden;
    float: left;
    width: 100%;
    height: 300px;
  }
  tbody::-webkit-scrollbar {
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-track {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-thumb {
    max-height: 100px !important;
    min-height: 100px !important;
    height: 100px;
    outline-color: transparent !important;
    outline-width: 0px !important;
  }
  tr {
    display: block;

    border-width: 0px 0px 1px 0px;
    border-style: solid;
    border-color: #c9c9c9;
    height: 50px;
    width: 100%;
  }
  tr:first-child {
    border-top-left-radius: 5px !important;
    border-top-right-radius: 5px !important;
  }
  tr:last-child {
    border-bottom-left-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
    border-color: transparent;
  }
  tr.tr-body:hover {
    background-color: #f5f5f5;
  }

  tr.tr-checked {
    background-color: #c3d8ff !important;
  }

  th {
    width: 100px;
    padding: 0.5rem;
    text-align: left;
  }

  td {
    padding: 0.5rem;
    width: 300px;
    text-align: left;
  }
  td:first-child {
    width: 10px;
  }
  tbody input[type="checkbox"] {
    display: none;
  }
  tbody input[type="checkbox"]:checked {
    color: green !important;
    background-color: green !important;
  }
`;
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
 
  const [myteamName, setMyTeamName] = useState(""); //만들거나 수정할 팀 이름 
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
  const [searchKeyword, setSearchKeyword] = useState('');

 

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

  //팀 생성 modal 열기 
  const teamAddToggle = () => {
    setTeamAddModal(!teamAddModal);
    setMyTeamName("");
  };
  //팀명 change
  const onChangeTeamName = (e) => {
    setMyTeamName(e.target.value);
  };

  //팀 생성
  const teamAdd = () => {
    const TeamNameData = {
      team_name: myteamName,
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

    if (myteamName == "") {
      props.notify("이름을 입력하세요.");
      setMyTeamName("");
    } else {
      axios.post(`https://${window.location.hostname}/api/team`, body, option)
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
            setTeamAddModal(!teamAddModal);
            props.notify("팀 생성 완료!");
            loadTeamList(setIsLoading, setTeamList, props);
          }
        })
        .catch(e=>props.notify(e))
      setMyTeamName("");
      setTeamAddModal(!teamAddModal);
    }
  };


  //팀 초대 modal on/off
  const teamInviteToggle = (e) => {
    setCurrentTeamID(e.target.value);
    setTeamInviteModal(!teamInviteModal);
  };

  //사용자 키워드 검색
  const friendSearch = (name) => {
    if(name=='') return;
    if(typeof(name)=='object') name=friendName;
    console.log("search name : ", name);
    axios.get(`https://${window.location.hostname}/api/search-user/${currentTeamId}/${name}`,option) //검색버튼 안눌러도 즉각적으로 결과보여주기
    .then(content => { 
      setFriendList(content.data);
    })
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
          `https://${window.location.hostname}/api/team/${currentTeamId}/invitation`,
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
            setFriendName('');
          }
        })
        .catch((e) => {
          props.notify(e);
        });
    }

    setTeamInviteModal(!teamInviteModal);
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

 //팀 수정 modal off
  const teamModifyToggle = () => {
    setTeamModifyModal(!teamModifyModal);
    setRenameTeamCheck(false);
    setMyTeamName("");
  };

  //팀 수정 modal on
  const teamModify = (e) => {
    setCurrentTeamID(e.target.value);
    setCurrentTeamName(e.target.name);
    console.log("팀 id : " + e.target.value);
    console.log("팀 이름 : " + e.target.name);

    axios.get(`https://${window.location.hostname}/api/team-management/${e.target.value}`, option)
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
        console.log("멤버 : " + JSON.stringify(memberList));
        if (content["data"]["team_leader"] == username) {
          // console.log("isLeader : true");
          setIsLeader(true);
        } else {
          // console.log("isLeader : false");
          setIsLeader(false);
        }
        setTeamModifyModal(!teamModifyModal);
        setRenameTeamCheck(false);
        setMyTeamName("");
      })
      .catch(e=>props.notify(e));
  };

  //팀 탈퇴 modal on/off
  const teamLeaveToggle = () => {
    setTeamLeaveModal(!teamLeaveModal);
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
    axios.put(`https://${window.location.hostname}/api/team/${currentTeamId}/secession`, null, option)
    .catch(error=>{
      props.errorCheck(error.response);
    }) 
    .then(() => {
      props.notify("탈퇴완료");
      window.location.reload();
    })
    .catch(e=>props.notify(e))
    setTeamLeaveModal(!teamLeaveModal);
  };

  //팀 삭제 modal on/off
  const teamDeleteToggle = () => {
    setTeamDeleteModal(!teamDeleteModal);
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
    axios.delete(`https://${window.location.hostname}/api/team-management/${currentTeamId}`, option)
      .catch(error=>{
        props.errorCheck(error.response);
      }) 
      .then((content) => {
        console.log("팀 삭제 : " + content);
        props.notify("삭제완료.");
        loadTeamList(setIsLoading, setTeamList, props);
      })
      .catch(e=>props.notify(e))
    setTeamDeleteModal(!teamDeleteModal);
    setTeamModifyModal(!teamModifyModal);
  };

  //팀 이름변경 on/off
  const renameTeamToggle = () => {
    setRenameTeamCheck(!renameTeamCheck);
  };
  //팀 이름 변경
  const renameTeam = () => {
    const data = {
      _id: currentTeamId,
      team_name: myteamName,
      team_leader: username,
    };

    axios.put(
        `https://${window.location.hostname}/api/team-management/${currentTeamId}`,
        data,
        option
      )
      .catch(error=>{
        props.errorCheck(error.response);
      }) 
      .then((content) => {
        props.notify("이름 변경 완료");
        window.location.reload();
      })
      .catch(() => props.notify("올바르지 않은 이름입니다."));
    setRenameTeamCheck(!renameTeamCheck);
  };

  const onChangeSearchKeyword=(e)=>{
    setSearchKeyword(e.target.value);
  }

  const submitKeyword=()=>{
    console.log("submit keyword, team ID : ", currentTeamId, ', keyword : ', searchKeyword);
    let url=`https://${window.location.hostname}/api/${currentTeamId}/${searchKeyword}`;
    axios.get(url, option)
    .catch(error=>{
      props.errorCheck(error.response);
    }) 
    .then((content) => {
      console.log("content : ", content);
    })
    .catch((error) => props.notify(error));
  }

  return (
    <Fragment>
      <Container
        fluid
        className={classNames("round", "content", "team-content")}
        color="light">
        <div className="current-content">

          {/*--------------- Modal  ---------------*/}
          {/* 팀 생성 */}
          <Modal
            isOpen={teamAddModal}
            toggle={teamAddToggle}
            className="team-add-modal"
          >
            <ModalHeader className="team-add-header">팀 생성</ModalHeader>
            <ModalBody className="team-add-body">
              <span className="team-add-name">팀 이름 : </span>
              <Input
                type="text"
                placeholder=""
                value={myteamName}
                onChange={onChangeTeamName}
                className="team-add-text"/>
            </ModalBody>
            <ModalFooter className="team-add-footer">
              <Button
                type="submit"
                onClick={teamAdd}
                className="team-add-button-create">
                생성
              </Button>
              <Button
                onClick={teamAddToggle}
                className="team-add-button-cancel">
                취소
              </Button>
            </ModalFooter>
          </Modal>

            <Modal
              isOpen={teamInviteModal}
              toggle={teamInviteToggle}
              className="team-invite-modal"
              backdrop="static">
            <ModalHeader className="modal-header">사용자 검색</ModalHeader>
            <ModalBody>
            <div className="search-friend">
                  <InputGroup>
                    <Input
                      className="search-friend-input"
                      onChange={onChangeFriendName}
                      value={friendName}/>

                    <InputGroupAddon>
                      <Button
                        className="search-friend-icon-button"
                        onClick={friendSearch}>
                        <FontAwesomeIcon icon={faSearch} className="search-friend-icon" />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  </div>
                <CustomTable>
                <BaseTable onCheck={friendOnCheck}>
                  <Tbody className="friend-list-body">
                    {friendList.map((friend, index) => (
                      <Tr key={index} value={friend["name"]}>
                        <Td>{index + 1}</Td>
                        <Td>{friend["nickname"]}</Td>
                        <Td>{friend["email"]}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </BaseTable>
                </CustomTable>
            </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                type="submit"
                color="primary"
                className="team-invite-button-invite"
                onClick={teamInvite}>
                초대
              </Button>
              <Button
                color="secondary"
                className="team-invite-button-cancel"
                onClick={teamInviteToggle}>
                취소
              </Button>
            </ModalFooter>
          </Modal>




          {/* 팀수정 */}
          <Modal
            isOpen={teamModifyModal}
            toggle={teamModifyToggle}
            className="team-modify-modal"
          >
            <ModalHeader>팀 정보 수정</ModalHeader>
            <ModalBody>
              <div className="team-rename ">
                <span className="team-rename-text ">팀 이름 : </span>
                {!renameTeamCheck && (
                  <Fragment>
                    <Input
                      className="rename-input rename-disabled"
                      disabled={!renameTeamCheck}
                      placeholder={currentTeamName}
                      onChange={onChangeTeamName}/>
                    {isLeader && (
                      <Button
                        className="rename-icon-button"
                        onClick={renameTeamToggle}>
                        <FontAwesomeIcon icon={faPen} className="rename-icon" />
                      </Button>
                    )}
                  </Fragment>
                )}
                {renameTeamCheck && (
                  <Fragment>
                    <Input
                      className="rename-input"
                      disabled={!renameTeamCheck}
                      placeholder={currentTeamName}
                      onChange={onChangeTeamName}
                      value={myteamName}/>

                    <Button
                      className="rename-icon-button"
                      onClick={renameTeam}
                      onChange={onChangeTeamName}>
                      <FontAwesomeIcon icon={faPen} className="rename-icon" />
                    </Button>
                  </Fragment>
                )}
              </div>

              <div>
                <span className="modify-textS">팀장</span>
              </div>
              <Table hover className="team-leader">
                <tbody className="team-leader-body">
                  <tr className="leader-item">
                    <th scope="row" />
                    <td>{teamLeaderNick} ({teamLeader})</td>
                    <td />

                    <td className="leader-table-button " />
                  </tr>
                </tbody>
              </Table>

              <div className="modify-textS">
                <span className="modify-textS">멤버</span>
              </div>
              <Table hover className="member-list">
                <tbody className="member-table-body">
                  {memberListNick.map((member, index) => {
                    return (
                      <tr className="member-item" key={index}>
                        <th scope="row">{index + 1}</th>
                        <td>{member} ({memberList[index]})</td>
                        <td />

                        <td className="member-table-button thd-buttons">
                          {/* <Button
                        onClick={e => teamInviteToggle(e)}
                        className="team-invite-button"
                        value={member}
                        name=''>
                        추방
                      </Button> */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </ModalBody>
            <ModalFooter>
              {!isLeader && (
                <Button onClick={teamLeaveToggle} className="leave-team-button">
                  팀 탈퇴
                </Button>
              )}
              {isLeader && (
                <Button
                  onClick={teamDeleteToggle}
                  className="leave-team-button">
                  팀 삭제
                </Button>
              )}
              <Button color="secondary" onClick={teamModifyToggle}>
                취소
              </Button>
            </ModalFooter>
          </Modal>


          {/* //팀 탈퇴 */}
          <Modal
            isOpen={teamLeaveModal}
            toggle={teamLeaveToggle}
            className="team-leave-modal"
          >
            <ModalBody className="team-leave-text">팀을 탈퇴합니다</ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                type="submit"
                color="primary"
                className="team-invite-button-invite"
                onClick={teamLeave}>
                탈퇴
              </Button>
              <Button
                color="secondary"
                className="team-invite-button-cancel"
                onClick={teamLeaveToggle}>
                취소
              </Button>
            </ModalFooter>
          </Modal>



          {/* //팀삭제 */}
          <Modal
            isOpen={teamDeleteModal}
            toggle={teamDeleteToggle}
            className="team-leave-modal"
          >
            <ModalBody className="team-leave-text">팀을 삭제합니다. </ModalBody>
            <ModalFooter className="modal-footer">
              <Button
                type="submit"
                color="primary"
                className="team-invite-button-invite"
                onClick={teamDelete}>
                삭제
              </Button>
              <Button
                color="secondary"
                className="team-invite-button-cancel"
                onClick={teamDeleteToggle}>
                취소
              </Button>
            </ModalFooter>
          </Modal>

          <span className="content-name">팀</span>
          <div className="add-item">
            <Button onClick={teamAddToggle} className="add-team-button">
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
                            onClick={(e) => teamInviteToggle(e)}
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
