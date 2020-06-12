import React from 'react';
import './EmptyTrashModal.css';
import {
    Button,
    Modal,
    ModalBody,
    ModalFooter,
} from "reactstrap";

const EmptyTrashModal=({clearModal, toggleClearModal, clearTrash})=>{
    return(
        <Modal
        isOpen={clearModal}
        toggle={toggleClearModal}
        size='md'
        className="trash-remove-modal"
      >
        <ModalBody className="team-leave-text">휴지통을 비웁니다. 이 작업은 되돌릴 수 없습니다.</ModalBody>
        <ModalFooter className="modal-footer">
          <Button
            type="submit"
            color="primary"
            className="empty-trash-button-empty"
            onClick={clearTrash}>
            비우기
          </Button>
          <Button
            color="secondary"
            className="empty-trash-button-cancel"
            onClick={toggleClearModal}
          >
            취소
          </Button>
        </ModalFooter>
      </Modal>
    );
}

export default EmptyTrashModal;