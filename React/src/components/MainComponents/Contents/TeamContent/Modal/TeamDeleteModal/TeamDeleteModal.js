import React from 'react';
import './TeamDeleteModal.css';
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

const TeamDeleteModal=({teamDeleteModal, toggleTeamDeleteModal, teamDelete})=>{
    return(
        <Modal
            isOpen={teamDeleteModal}
            toggle={toggleTeamDeleteModal}
            className="team-leave-modal"
        >
            <ModalBody className="team-leave-text">팀을 삭제합니다. </ModalBody>
            <ModalFooter className="modal-footer">
                <Button
                    type="submit"
                    color="primary"
                    className="team-delete-button-delete"
                    onClick={teamDelete}>
                    삭제
                </Button>
                <Button
                    color="secondary"
                    className="team-delete-button-cancel"
                    onClick={toggleTeamDeleteModal}>
                    취소
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default TeamDeleteModal;