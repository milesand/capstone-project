import React from 'react';
import './TeamAddModal.css';
import {
    Input,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    ModalFooter,
  } from "reactstrap";

const TeamAddModal=({teamAddModal, toggleTeamAddModal, myTeamName, onChangeTeamName, teamAdd})=>{
    return(
        <Modal
            isOpen={teamAddModal}
            toggle={toggleTeamAddModal}
            className="team-add-modal"
          >
            <ModalHeader className="team-add-header">팀 생성</ModalHeader>
            <ModalBody className="team-add-body">
              <span className="team-add-name">팀 이름 : </span>
              <Input
                type="text"
                placeholder=""
                value={myTeamName}
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
                onClick={toggleTeamAddModal}
                className="team-add-button-cancel">
                취소
              </Button>
            </ModalFooter>
          </Modal>
    );
}

export default TeamAddModal;