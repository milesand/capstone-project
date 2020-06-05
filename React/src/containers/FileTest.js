import React, { Component, Fragment, forwardRef } from "react";
import DownloadTestForm from "../components/StorageComponents/DownloadTestForm";
import UploadTestForm from "../components/StorageComponents/UploadForm";
import Flow from '@flowjs/flow.js'
import streamSaver from 'streamsaver';

//업로드, 다운로드 테스트
export default class FileTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
        fileName : [],
        fileID: "",
        fileList: [],
    };
    this.myRef=React.createRef();
    console.log("업/다운로드 테스트.", this.props.isLoading);
  }

  componentDidMount=()=>{
    let target=`${window.location.origin}/api/upload/flow`;
    let flow=new Flow({
        target: function(file, url){
            if(file.targetUrl==null){
              console.log("에러!!!!!!!!!!!!!!!!!!!!!!! target 설정 안됨!!!, file : ", file, " url : ", file.targetUrl);
              file.cancel();
              console.log('캔슬!');
              return "test.";
            }
            else
              console.log('success, file : ', file, ' url : ', file.targetUrl);
            return file.targetUrl;
        },

        simultaneousUploads : 1,
        withCredentials : true,
        chunkSize : 10*1024*1024 // 한번에 업로드하는 청크 크기 조정. 업로드 속도 조절로 사용
    });

    flow.assignBrowse(this.myRef.current);
    flow.assignDrop(this.myRef.current);

    if(!flow.support) console.log("flow.js 지원 안함.");

   
    flow.on('fileAdded', function(file){
        let data= {
            fileSize: file.size,
            fileName: file.name,
            directory: '/'
        };
        console.log("data : ", data);
        const formData  = new FormData();
        for(const name in data) {
            console.log("name : ", name, data[name])
            formData.append(name, data[name]);
        }

        console.log('formData : ', formData);
        let errorCheck = response => {
            if(response.status==400){
                throw Error("디렉토리 내에 동일한 파일 이름이 존재합니다.");
            }
            else if(response.status==401){
              throw Error("자동 로그아웃되었습니다. 다시 로그인해주세요.");
              this.props.history.push('/');
            }
            else if(response.status==403){
                throw Error('저장 공간이 부족합니다.');
            }
            console.log("promise 1, response : ", response);
            return response;
        };
        console.log("파일 등록!");
        fetch(`${window.location.origin}/api/upload/flow`, {
            method: "POST",
            credentials: 'include',
            body: formData,
        })
        .then(errorCheck)
        //.then(res=>res.json())
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
        .catch(e=>this.props.notify(e));
        
    });

    flow.on('filesSubmitted', function(array, event){
      for(let i=0; i<array.length; i++){
        console.log('file ', i, ' 추가 완료!, url : ', array[i].targetUrl);     
        
      }
      console.log('파일 큐에 추가 완료!  ', flow.files, ' this : ', this);
      this.setState({
        fileList: array
      });
      console.log(this.state.fileList);
    }.bind(this))

    flow.on('fileRetry', function(file, chunk){ //파일 재시도
        console.log('재시도중!');
    });

    flow.on('fileRemoved', function(file){ //파일이 업로드 큐에서 제거되었을 때 호출되는 이벤트
      console.log('파일 ', file, ' 제거됨!');
      if(flow.files.length==0){
        console.log("all file removed!");
      }
    });

    flow.on('fileSuccess', function(file, message, chunk){ //파일 업로드가 성공헀을 때 호출되는 이벤트
        console.log(file, message, '업로드 성공!');
        flow.removeFile(file)
    });

    flow.on('fileError', function(file, message){ //파일 업로드 실패했을 때 호출되는 이벤트
        console.log(file, message, "에러!");
    });
    
    flow.on('fileProgress', function(file, chunk){
      console.log(file.name, " 업로드중...", file.timeRemaining(), file.sizeUploaded())
      let array=this.state.fileList;
      for(let i=0; i<array.size; i++){
        if(file.uniqueIdentifier==array[i].uniqueIdentifier){
            array[i]=file;
            break;
        }
      }
      this.setState({
        fileList: array
      })
    }.bind(this))

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
    let url=`${window.location.origin}/api/file/${this.state.fileID}`;
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

    fetch(`${window.location.origin}/api/download`, {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(data),
      credentials: 'include'
    })
    .then(content=>{
      console.log("download, content : ", content);
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

      const readableStream=content.body;
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
    }).catch(e=>this.props.notify(e))
    
  }

  stop=(file)=>{
    console.log("pause call!, file : ", file);
    file.pause();
  }

  resume=(file)=>{
    console.log("resume call!, file : ", file);
    file.resume();
  }

  remove=(file)=>{
    console.log("remove call!, file : ", file, 'type : ', typeof(this.state.fileList));
    file.cancel();
    const idx=this.state.fileList.findIndex((f)=>{return f.uniqueIdentifier==file.uniqueIdentifier})
    let list=this.state.fileList;
    let id=file.targetUrl.split('/').reverse()[0];
    let url=`${window.location.origin}/api/partial/${id}`;
    console.log("id : ", id);
    this.setState({
      fileList: list.slice(0, idx).concat(list.slice(idx+1, list.length))
    })

    let errorCheck=(response)=>{
      console.log("reponse : ", response);
      if(!response.ok){
        throw Error("서버 에러 발생!");
      }
      return response;
    }
    fetch(url, {
      method: "DELETE",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
    })
    .then(errorCheck)
    .then(()=>{
      console.log('partial file 제거 완료!');
    })
    .catch(e=>this.props.notify(e))
  }

  render() {
    return (
      <Fragment>
            <div>
                <UploadTestForm
                    myRef={this.myRef} //이 값을 등록한 버튼을 this.myRef.current를 통해 찾을 수 있다.
                    isLoading={this.props.isLoading}
                    fileList={this.state.fileList}
                    stop={this.stop}
                    resume={this.resume}
                    remove={this.remove}
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
