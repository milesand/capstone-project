import React, {Fragment} from 'react';
import './TeamModifyModal.css';
import {
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
    Table
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen
} from "@fortawesome/free-solid-svg-icons";

const TeamModifyModal=({teamModifyModal, toggleTeamModifyModal, renameTeamCheck, isLeader, currentTeamName, 
                        onChangeTeamName, toggleRenameTeam, myTeamName, renameTeam, teamLeaderNick, teamLeader,
                        memberListNick, memberList, toggleTeamLeaveModal, toggleTeamDeleteModal})=>{
    return(
        <Modal
            isOpen={teamModifyModal}
            toggle={toggleTeamModifyModal}
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
                                onChange={onChangeTeamName}
                            />
                            {isLeader && (
                                <Button
                                    className="rename-icon-button"
                                    onClick={toggleRenameTeam}>
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
                                value={myTeamName}
                            />

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
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </ModalBody>
            <ModalFooter>
                {!isLeader && (
                    <Button onClick={toggleTeamLeaveModal} className="leave-team-button">
                    팀 탈퇴
                    </Button>
                )}
                {isLeader && (
                    <Button
                    onClick={toggleTeamDeleteModal}
                    className="leave-team-button">
                    팀 삭제
                    </Button>
                )}
                <Button color="secondary" onClick={toggleTeamModifyModal} className="leave-team-cancel">
                    취소
                </Button>
            </ModalFooter>
        </Modal>
    )
}

export default TeamModifyModal;