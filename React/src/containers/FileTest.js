import React, { Component, Fragment, forwardRef } from "react";
import DownloadTestForm from "../components/StorageComponents/DownloadTestForm";
import UploadTestForm from "../components/StorageComponents/UploadTestForm";
import Flow from '@flowjs/flow.js'
import streamSaver from 'streamsaver';

//업로드, 다운로드 테스트
export default class FileTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
        fileName : [],
        fileID: "",
    };
    this.myRef=React.createRef();
    console.log("업/다운로드 테스트.", this.props.isLoading);
  }

  componentDidMount=()=>{
    let target='http://localhost/api/upload/flow';
    let flow=new Flow({
        target: function(file, url){
            if(file.targetUrl==null){
              console.log("에러!!!!!!!!!!!!!!!!!!!!!!! target 설정 안됨!!!, file : ", file, " url : ", file.targetUrl);
            }
            else
              console.log('success, file : ', file, ' url : ', file.targetUrl);
            return file.targetUrl;
        },

        simultaneousUploads : 1,
        withCredentials : true,
        chunkSize : 100*1024*1024
    });

    flow.assignBrowse(this.myRef.current);
    flow.assignDrop(this.myRef.current);

    if(!flow.support) console.log("flow.js 지원 안함.");

   
    flow.on('fileAdded', function(file){
        let data= {
            fileSize: file.size
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
            console.log("promise 1, response : ", response);
            return response;
        };
        console.log("파일 등록!");
        fetch("http://localhost/api/upload/flow", {
            method: "POST",
            credentials: 'include',
            body: formData,
        })
        .then(errorCheck)
        .then(response=>{ // 실제 서버에서 사용
            console.log("promise 2, response : ", response);
            let url = response.headers.get('Location'); //docker로 구동 시에 사용
            //let url=response['Location']; //테스트용, build 할 때 지우기
            console.log('url : ', url);
            file.targetUrl=url; //여기서 등록 안될때가 있다.
            console.log('end!');
            return file;
        })
        .then(file=>{
          let isSetting=false;
          function check(file){
            if(file.targetUrl!=null&&file.targetUrl!=''){
              console.log('check!, isSetting', isSetting);
              isSetting=true;
              clearInterval(wait);
            }
            else{
              console.log('here, error check!!, repeat.');
            }
          }
          let wait=setInterval(function(){
            console.log('file : ', file);
            check(file);
            console.log('here, isSetting : ', isSetting);
            if(isSetting) file.resume();
            else console.log('not setting!!!!!');
          }, 200);
          
        })
        .catch(e=>alert(e));
        
    });

    flow.on('filesSubmitted', function(array, event){
      for(let i=0; i<array.length; i++){
        console.log('file ', i, ' 추가 완료!, url : ', array[i].targetUrl);      
      }
      console.log('파일 큐에 추가 완료!  ', flow.files);
    })

    flow.on('fileRetry', function(file, chunk){ //파일 재시도
        console.log('재시도중!');
    });

    flow.on('fileRemoved', function(file){ //파일이 업로드 큐에서 제거되었을 때 호출되는 이벤트
      console.log('파일 ', file, ' 제거됨!');
    });

    flow.on('fileSuccess', function(file, message, chunk){ //파일 업로드가 성공헀을 때 호출되는 이벤트
        console.log(file, message, '업로드 성공!');
        flow.removeFile(file)
    });

    flow.on('fileError', function(file, message){ //파일 업로드 실패했을 때 호출되는 이벤트
        console.log(file, message, "에러!");
    });
    
    flow.on('progress', function(){ //파일 업로드중일 때 발생하는 이벤트, 진행상황 확인용으로 사용
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

    let data={};
    let i=1;
    let idSplit=this.state.fileID.split(' ');
    console.log("id : ", this.state.fileID, "idSplit : ", idSplit);
    for(let id in idSplit){
      console.log('id : ', idSplit[id]);
      data['file' + String(i)] = idSplit[id];
      i++;
    }
    console.log('data : ', data);

    fetch("http://localhost/api/download", {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(data),
      credentials: 'include'
    })
    .then(content=>{
      console.log("start.");
      if(idSplit.length>1){ // 파일 여러 개, 압축 파일 이름 downloadFiles.zip으로 통일
        fileStream=streamSaver.createWriteStream('downloadFiles.zip');
      }

      else{
        console.log("here.");
        console.log("content : ", content);
        fileStream=streamSaver.createWriteStream('filename_here'); // filename_here에 파일의 실제 이름을 넣는다. 
                                                                   // 특정 디렉토리에 들어갈 때 파일의 이름 및 썸네일 정보를 가져오므로
                                                                   // 거기에서 이름을 가져오면 됨.
      }

      console.log('content : ', content);
      const readableStream=content.body;
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
    }).catch(e=>alert(e))
    
  }
  render() {
    return (
      <Fragment>
            <div>
                <UploadTestForm
                    myRef={this.myRef} //이 값을 등록한 버튼을 this.myRef.current를 통해 찾을 수 있다.
                    isLoading={this.props.isLoading}
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
