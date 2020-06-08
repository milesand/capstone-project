import React, { Component, Fragment, useEffect } from 'react';
import ReactPlayer from 'react-player';
import CustomDownload from '../../StorageComponents/CustomDownload';
import './PreviewModal.css';
import {
    Row, Col,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    CardDeck,
    Container,
    CardGroup,
    Input,
    Progress,
    Spinner
  } from "reactstrap";

const PreviewModal=({isOpen, toggle, fileName, fileID, hasThumbnail, isVideo, notify, loadFilesNFolders})=>{
    console.log("preview props : ", isOpen, toggle, fileName, fileID, hasThumbnail, isVideo);
    let url=`${window.location.origin}/api/preview/${fileID}`;
    //let url='/images/photo-1589011352120-510c9fca6d31.png';

    const download=()=>{
        CustomDownload(fileName, fileID, notify, loadFilesNFolders);
    }
    return(
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                unmountOnClose={false}
                size='xl'
                contentClassName='modal-xl'
                centered={true}
                >
                <ModalHeader toggle={toggle} className='modal-header'>
                    <div className="preview-modal-head">미리보기</div>
                </ModalHeader>
                {/*upload modal*/}
                <ModalBody className='preview-modal-body'>
                    <Container>
                        <Row>
                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                        {isVideo ? 
                            <div className='preview-video'>
                                <ReactPlayer 
                                    url={url}
                                    controls={true}
                                />
                            </div>
                        :
                            hasThumbnail ?
                                <div className='inline-wrap'>
                                    <img src={url} className='preview-image'/>
                                </div>
                            :
                                <div className='preview-others'>
                                    <div>미리보기가 지원되지 않는 파일입니다.</div>
                                </div>
                        }
                        </Col>
                        </Row>
                        <Row>
                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                        <Button 
                            outline 
                            className='preview-modal-button' 
                            onClick={download}
                        >
                            다운로드
                        </Button>
                        </Col>
                        </Row>
                    </Container>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={toggle}
                    className="close-button"
                      >
                    닫기
                  </Button>{" "}
                </ModalFooter>
              </Modal>
        </Fragment>
    );
}

export default PreviewModal;
