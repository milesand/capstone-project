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

const PreviewModal=({isOpen, toggle, fileName, fileID, hasThumbnail, isVideo})=>{
    console.log("preview props : ", isOpen, toggle, fileName, fileID, hasThumbnail, isVideo);
    let url=`${window.location.origin}/api/preview/${fileID}`;
    //let url='/images/35536e8e-4f0d-4b43-a78a-7c12d8787c5c.jpg';

    const download=()=>{
        CustomDownload(fileName, fileID);
    }
    return(
        <Fragment>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                size="xl"
                unmountOnClose={false}
                >
                <ModalHeader toggle={toggle} className='modal-header'>
                    <div className="preview-modal-head">미리보기</div>
                </ModalHeader>
                {/*upload modal*/}
                <ModalBody className='test'>
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
                                <img src={url} className='preview-image'/>
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
