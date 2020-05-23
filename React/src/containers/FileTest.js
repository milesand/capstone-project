import React, { Component, Fragment } from "react";
import DownloadTestForm from "../components/StorageComponents/DownloadTestForm";
import UploadTestForm from "../components/StorageComponents/UploadTestForm";
import Flow from '@flowjs/flow.js'
import streamSaver from 'streamsaver';

//업로드 테스트
export default class FileTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
        fileName : "",
        fileID: "",
        fid: "",
    };
    this.myRef=React.createRef();
    console.log("업로드 테스트.", this.props.isLoading);
  }

  componentDidMount=()=>{
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
            if(response.status==403){
                throw Error('저장 공간이 부족합니다.');
            }
            else if(response.status==400){
                throw Error("요청 형식을 확인해주세요.");
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
        .then(res=>res.json())
        .then(response=>{ // 실제 서버에서 사용
            //let url = response.headers.get('Location');
            let url=response['Location'];
            console.log('url : ', url);
            fileObj.targetUrl=url;
        })
        .catch(e=>alert(e));
    });

    flow.on('filesAdded', function(array, event){
      for(let i=0; i<array.length; i++){
        console.log('array ', i+1, ' : ', array[i]);
      }
      console.log('file 등록 완료!');
      flow.upload();
    })

    flow.on('uploadStart', function(){
        console.log('업로드 리얼 시작!');
    });

    flow.on('fileRetry', function(file, chunk){
        console.log('재시도중!');
    });

    flow.on('fileSuccess', function(file, message, chunk){
        console.log(file, message, '업로드 성공!');
    });

    flow.on('fileError', function(file, message){
        console.log(file, message, "에러!");
    });
    
    flow.on('progress', function(file){
        console.log(file);
        console.log("업로드중...", flow.timeRemaining(), flow.sizeUploaded());
    })
  }

  valChangeControl(e){
    let target_id=e.target.id;
    let target_val=e.target.value;
    this.setState({
      [target_id]: target_val
    });
    console.log(target_id, " : ", target_val);
  }

  DLTest=()=>{
    let url="http://localhost/api/file/" + this.state.fileID;
    let fileStream=null;

    let errorCheck = response =>{
      if(!response.ok){
        throw Error('파일이 존재하지 않습니다.');
      }
      
      return response;
    }

    fetch(url, {
      method: "GET",
      headers: {
        'Content-Type' : 'application/json'
      },
      credentials: 'include'
    })
    .then(errorCheck)
    .then(res => res.json())
    .then(content =>{
        console.log('content : ', content['name']);
        this.setState({
            filename: content['name']
        })})
        .then(()=>{
          console.log('filename : ', this.state.filename);
          url="http://localhost/api/download/" + this.state.fileID;
          fileStream=streamSaver.createWriteStream(this.state.filename);
          fetch(url, {
            method: "GET",
            headers: {
              'Content-Type' : 'application/json'
            },
            credentials: 'include'
          })
          .then(res=>{
            const readableStream=res.body;
            console.log("start!!!");
            console.log('readableStream : ', readableStream);
            console.log(window.WritableStream);
            console.log(readableStream.pipeTo);
            if(window.WritableStream && readableStream.pipeTo){
                return readableStream.pipeTo(fileStream)
                .then(()=>console.log("finish writing."));
            }
    
            const writer=fileStream.getWriter()
            const reader=readableStream.getReader()
            const pump = () => reader.read()
            .then(res => res.done ? writer.close() : writer.write(res.value).then(pump))
    
            pump();
          })
        })
        .catch(e=>alert(e));
    
  }
  render() {
    console.log('upload button render.');
    return (
      <Fragment>
            <div>
                <UploadTestForm
                    myRef={this.myRef} //이 값을 등록한 버튼을 this.myRef.current를 통해 찾을 수 있다.
                    isLoading={this.props.isLoading}
                    fid={this.state.fid}
                    isLoading={this.props.isLoading}
                />
            </div>
            <div>
                <DownloadTestForm
                    downloadTest={this.DLTest}
                    fileID={this.state.fileID}
                    isLoading={this.props.isLoading}
                    changeFileID={e=>this.valChangeControl(e)}
                />
            </div>
      </Fragment>
    );
  }
}
