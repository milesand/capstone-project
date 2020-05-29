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
                return(
                  <ListGroupItem>
                  <div>
                    <Row>
                      {file.name}
                    </Row>
                    <Row>
                      <Col md={8}>
                          <Progress animated striped color="success" value={percent} className="bar"/>
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
