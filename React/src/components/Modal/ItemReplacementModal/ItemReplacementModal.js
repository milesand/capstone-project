import React, {Fragment} from 'react';
import './ItemReplacementModal.css';
import UploadFileBrowser from '../../StorageComponents/UploadFileBrowser'
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

const UploadModal=({moveModal, toggleMoveModal, notify, changePath, errorCheck, checkUserState, curFolderID,
                    curFolderPath, loadFilesNFolders, isSharing, rootDirID, submitReplace})=>{

    let pathElements = curFolderPath.split('/');
    return(
        <Fragment>
            <Modal
                isOpen={moveModal}
                toggle={toggleMoveModal}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggleMoveModal}>
                  <div className="replacement-modal-head">이동 경로 설정</div>
                </ModalHeader>
                <ModalBody>
                  <div className='replacement-file-browser'>
                    <UploadFileBrowser
                      isSharing={isSharing}
                      notify={notify}
                      rootDirID={isSharing ? curFolderID : rootDirID}
                      changePath={changePath}
                      errorCheck={errorCheck}
                      checkUserState={checkUserState}
                      curFolderID={curFolderID}
                      curFolderPath={curFolderPath}
                      loadFilesNFolders={loadFilesNFolders}
                      rootKey={isSharing ? pathElements[pathElements.length-2] + '/' : 'root/'}
                      guideText='이동 경로'
                    />

                  </div>
                </ModalBody>
                <ModalFooter>
                <Button className="replacement-modal-button content-button-y" onClick={submitReplace}>결정</Button>
                  <Button
                    color="secondary"
                    onClick={toggleMoveModal}
                    className="replacement-modal-button content-button "
                  >
                    닫기
                  </Button>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
}

export default UploadModal;
