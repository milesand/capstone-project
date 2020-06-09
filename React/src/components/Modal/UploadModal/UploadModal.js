import React, { Component, Fragment, useEffect } from 'react';
import './UploadModal.css';
import UploadContent from "../../StorageComponents/UploadContent";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
  } from "reactstrap";

const UploadModal=({uploadModal, toggleUploadModal, isSharing, flow, setFlow, setModalHeadText,
                    notify, rootDirID, errorCheck, checkUserState, curFolderID, curFolderPath,
                    loadFilesNFolders, modalHeadText, check})=>{

    return(
        <Fragment>
            <Modal
                isOpen={uploadModal}
                toggle={toggleUploadModal}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggleUploadModal}>
                  <div className="upload-modal-head">{modalHeadText}</div>
                </ModalHeader>{" "}
                <ModalBody>
                  <UploadContent
                    isSharing={isSharing} //공유 폴더일 때 업로드 처리
                    flow={flow} 
                    setFlow={setFlow}
                    setModalHeadText={setModalHeadText}
                    notify={notify}
                    rootDirID={rootDirID}
                    errorCheck={errorCheck}
                    checkUserState={checkUserState}
                    curFolderID={curFolderID}
                    curFolderPath={curFolderPath}
                    loadFilesNFolders={loadFilesNFolders}
                    toggleUploadModal={toggleUploadModal}
                    check={check}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={toggleUploadModal}
                    className="upload-modal-close-button"
                  >
                    닫기
                  </Button>{" "}
                </ModalFooter>
              </Modal>
        </Fragment>
    );
}

export default UploadModal;
