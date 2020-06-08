import React, {Fragment, useEffect} from 'react';
import RecoverBrowser from './RecoverBrowser';
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

const RecoverModal=({recoverModal, toggleRecoverModal, notify, changePath, errorCheck, checkUserState, curFolderID,
                    curFolderPath, loadFilesNFolders, isSharing, rootDirID,itemRecover,changeDirID})=>{


    useEffect(()=>{
      console.log('curFolderID',curFolderID);
    },[curFolderID]);
    let pathElements = curFolderPath.split('/');
    return(
        <Fragment>
            <Modal
                isOpen={recoverModal}
                toggle={toggleRecoverModal}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggleRecoverModal}>
                  <div className="replacement-modal-head">복구 경로 설정</div>
                </ModalHeader>
                <ModalBody>
                  <div className='replacement-file-browser'>
                    <RecoverBrowser
                      notify={notify}
                      rootDirID={rootDirID}
                      changePath={changePath}
                      changeDirID = {changeDirID}
                      errorCheck={errorCheck}
                      checkUserState={checkUserState}
                      curFolderID={curFolderID}
                      curFolderPath={curFolderPath}
                      loadFilesNFolders={loadFilesNFolders}
                      rootKey={isSharing ? pathElements[pathElements.length-2] + '/' : 'root/'}
                      guideText='복구 경로'
                    />
                  </div>
                </ModalBody>
                <ModalFooter>
                <Button
                    color="primary"
                    onClick={itemRecover}
                    className="replacement-modal-button"
                  >
                    복구
                  </Button>
                  <Button
                    color="secondary"
                    onClick={toggleRecoverModal}
                    className="replacement-modal-button"
                  >
                    닫기
                  </Button>
                </ModalFooter>
            </Modal>
        </Fragment>
    );
}

export default RecoverModal;
