import React, { Component, Fragment } from "react";
import UploadTestForm from "../components/LoginComponents/UploadTestForm";
import Flow from '@flowjs/flow.js'

//업로드 테스트
export default class UploadTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
        fileName : "",
        fileID: "",
    };
    this.myRef=React.createRef();
    console.log("업로드 테스트.", this.props.isLoading);
  }

  componentDidMount(){
    let target='http://localhost/api/upload/flow';
    let flow=new Flow({
        target: function(fileObj){
            return fileObj.targetUrl;
        },
        simultaneousUploads : 1,
        withCredentials : true,
        chunkSize : 100*1024*1024
    });

    console.log('ref : ', this.myRef.current);
    flow.assignBrowse(this.myRef.current);
    flow.assignDrop(this.myRef.current);

    if(!flow.support) console.log("flow.js 지원 안함.");

   
    flow.on('fileAdded', function(fileObj){
        let data= {
            fileSize: fileObj.size
        };
        const formData  = new FormData();
        for(const name in data) {
            formData.append(name, data[name]);
        }

        let errorCheck = response => {
            if(response.status!=201){
                throw Error('업로드 실패!');
            }
            return response;
        };
        console.log("파일 등록!");
        fetch("http://localhost/api/upload/flow", {
            method: "POST",
            credentials: 'include',
            body: formData,
        })
        .then(errorCheck)
        .catch(e=>alert(e))
        .then(response=>{ // 실제 서버에서 사용
            let url = response.headers.get('Location');
            console.log('url : ', url);
            fileObj.targetUrl=url;
            flow.simultaneousUploads=1;
        })
        .then(()=>{
            console.log('파일 등록 완료!');
            flow.upload();
        }).catch(e=>alert(e));
    });

    flow.on('uploadStart', function(){
        console.log('업로드 리얼 시작!');
    });

    flow.on('fileRetry', function(file, chunk){
        console.log('재시도중!');
    });
    flow.on('fileSuccess', function(file,message, chunk){
        console.log(file, message, '업로드 성공!');
    });

    flow.on('fileError', function(file, message){
        console.log(file, message, "에러!");
    });
    
    flow.on('progress', function(){
        console.log("업로드중...", flow.timeRemaining(), flow.sizeUploaded());
    })
  }

  render() {
    console.log('upload button render.');
    return (
      <Fragment>
            <UploadTestForm
                myRef={this.myRef} //이 값을 등록한 버튼을 this.myRef.current를 통해 찾을 수 있다.
                isLoading={this.props.isLoading}

            />
      </Fragment>
    );
  }
}
