import React, {fragement} from 'react';
import "./UploadForm.css"
import {Button, Progress, Col, Row, ListGroup, ListGroupItem} from 'reactstrap';
import {Checkmark} from 'react-checkmark'
// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const UploadForm = ({myRef, isSubmitted, fileList, resume, stop, remove}) => {
  console.log("UploadTestForm start, myRef : ", myRef)
  return(
    <div className="upload-screen">
        {!isSubmitted && 
          <button
            ref={myRef}
            type="button"
            className='Upload-button'
          >이곳을 클릭하거나, 드래그하여 파일을 업로드해주세요.</button>
        } 
        <ListGroup>
          {fileList && fileList.map(file => {
                let percent=file.sizeUploaded() / file.size * 100;
                let uploadSpeed=file.averageSpeed;
                if(uploadSpeed>Math.pow(1024, 2)){ //MB
                  uploadSpeed=Math.round(uploadSpeed/(1024*1024)*10)/10 + 'MB';
                }
                else if(uploadSpeed>Math.pow(1024, 1)){ //KB
                  uploadSpeed=Math.round(uploadSpeed/(1024)*10)/10 + 'KB';
                }
                else{ //Byte
                  uploadSpeed=Math.round(uploadSpeed/10)/10 + 'B';
                }
                let remainingTime=file.timeRemaining();
                if (remainingTime>60){
                  if(remainingTime>3600){
                    remainingTime=parseInt(remainingTime/3600) + '시간 '
                                + parseInt((remainingTime%3600)/60) + '분 ' 
                                + (remainingTime%3600%60) + '초';
                  }
                  else{
                    remainingTime=parseInt((remainingTime)/60) + '분 ' 
                               + (remainingTime%60) + '초';
                  }
                }
                else{
                  remainingTime=remainingTime + '초';
                }
                return(
                  <ListGroupItem>
                  <div>
                    <Row>
                      <span className='upload-text'>{file.name}</span>
                    </Row>
                    <Row>
                      <Col md={8}>
                          <Progress animated striped color="success" value={percent} className="bar"/>
                          <span className='upload-text'>진행도 : {Math.round(percent, 2)}%</span>
                          {!file.isComplete() && percent!=0 &&                     
                              <span className='upload-text'> 속도 : {uploadSpeed}  남은 시간 : {remainingTime}</span>
                          }
                      </Col>
                        <Col md={{span: 1, offset : 2}}>
                          {!file.isComplete()&&file.paused&&
                              <button
                                value={file}
                                onClick={()=>resume(file)}
                                id='resumeButton'
                                type="button"
                                className='button-resume'
                              />
                            }
                            {!file.isComplete()&&!file.paused&&
                              <button
                                value={file}
                                onClick={()=>stop(file)}
                                id='pauseButton'
                                type="button"
                                className='button-pause'
                            />
                            }
                            {file.isComplete()&&<Checkmark size={35}/>}
                        </Col>
                        <Col md={{span: 1, offset : 1}}>
                              {!file.isComplete()&&
                                    <button close 
                                      value={file}
                                      onClick={()=>remove(file)}
                                      id='removeButton'
                                      type="button"
                                      className = 'button-delete'
                                    />
                              }
                        </Col>
                    </Row>
                  </div>
                  </ListGroupItem>
                )
              }          
            )
          }
        </ListGroup>
    </div>
  );
}

export default UploadForm;
