import React from 'react';
import './TeamLeaveModal.css';
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

const TeamLeaveModal=({teamLeaveModal, toggleTeamLeaveModal, teamLeave})=>{
    return(
        <Modal
            isOpen={teamLeaveModal}
            toggle={toggleTeamLeaveModal}
            className="team-leave-modal"
        >
            <ModalBody className="team-leave-text">팀에서 탈퇴하시겠습니까?</ModalBody>
            <ModalFooter className="modal-footer">
                <Button
                    type="submit"
                    color="primary"
                    className="team-leave-button-leave"
                    onClick={teamLeave}>
                    탈퇴
                </Button>
                <Button
                    color="secondary"
                    className="team-leave-button-cancel"
                    onClick={toggleTeamLeaveModal}>
                    취소
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default TeamLeaveModal;