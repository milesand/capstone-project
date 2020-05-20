import React, { Component, Fragment } from "react";
import DownloadTestForm from "../components/LoginComponents/DownloadTestForm";
import streamSaver from 'streamsaver';

//로그인
export default class DownloadTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
        fileName : "",
        fileID: ""
    };
    console.log("다운로드 테스트.", this.props.isLoading);
    this.DLTest=this.DLTest.bind(this);
  }

  valChangeControl(e){
    let target_id=e.target.id;
    let target_val=e.target.value;
    this.setState({
      [target_id]: target_val
    });
    console.log('change!');
    console.log(target_id, " : ", target_val);
  }

  DLTest(){
    const fileStream=streamSaver.createWriteStream(this.state.fileName); // 여기서 파일 저장 이름 결정
    this.props.toggleLoadingState();
    let idURL="http://localhost/api/file-id/" + this.state.fileName;

    let downloadURL="";

    let idErrorCheck = response =>{
      console.log(response);
      if(response.hasOwnProperty('error')){
        throw Error(response['error']);
      }
      return response;
    }

    let downloadErrorCheck = response => {
      if(!response.ok){
        throw Error('파일이 존재하지 않습니다!');
      }
      return response;
    }

    console.log('idURL : ', idURL);

    fetch(idURL, {
      method : "GET",
      headers : {
        'Content-Type' : 'application/json',
      },
      credentials : 'include'
    })
    .then(res=>res.json())
    .then(idErrorCheck)
    .then(content=>{
        this.setState({
          fileID: content['id']
        })
        downloadURL="http://localhost/api/download/" + this.state.fileID;
        console.log("downloadURL : ", downloadURL);
    })
    .then(() =>{
      fetch(downloadURL, {
        method: "GET",
        headers: {
          'Content-Type' : 'application/json',
        },
        credentials: 'include'
      })
      .then(downloadErrorCheck)
      .then(r=>{
        console.log(r);
        return r;
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
      .then(()=>{
        this.props.toggleLoadingState();
      }).catch(e=>{
          alert(e);
          this.props.toggleLoadingState();
        })

    }).catch(e=>{
      alert(e);
      this.props.toggleLoadingState();
    })
    
    
  }
  render() {
    console.log('download button render.');
    return (
      <Fragment>
            <DownloadTestForm
                downloadTest={this.DLTest}
                isLoading={this.props.isLoading}
                fileanme={this.state.fileName}
                changeFilename={e => this.valChangeControl(e)}
            />
      </Fragment>
    );
  }
}
