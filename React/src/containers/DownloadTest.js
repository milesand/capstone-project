import React, { Component, Fragment } from "react";
import DownloadTestForm from "../components/LoginComponents/DownloadTestForm";
import streamSaver from 'streamsaver';

//로그인
export default class DownloadTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
    };
    console.log("다운로드 테스트.");
  }

  //유저 로그인 상태 체크
  componentDidMount() {

  }

  DLTest(){
    const fileStream=streamSaver.createWriteStream('eng.pdf');
    fetch('http://localhost/api/download/sunga201/eng.pdf', {
        method: "GET"
    })
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
  }
  render() {
    console.log('download button render.');
    return (
      <Fragment>
            <DownloadTestForm
                downloadTest={this.DLTest}
            />
      </Fragment>
    );
  }
}
