import React, { Component, Fragment, forwardRef } from "react";
import streamSaver from 'streamsaver';

//업로드, 다운로드 테스트
const CustomDownload=(fileName, fileID)=>{
    console.log("download, fileName : ", fileName, ', id : ', fileID);
    let fileStream=null;

    let errorCheck = response =>{
      if(!response.ok){
        throw Error('파일이 존재하지 않습니다.');
      }
      
      return response;
    }

    let data={};
    let i=1;
    let idSplit=fileID.split(' ');
    console.log("id : ", fileID, "idSplit : ", idSplit);
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
      console.log("download, content : ", content);
      if(idSplit.length>1){ // 파일 여러 개, 압축 파일 이름 downloadFiles.zip으로 통일
        fileStream=streamSaver.createWriteStream('downloadFiles.zip');
      }

      else{
        console.log("here.");
        console.log("content : ", content);
        fileStream=streamSaver.createWriteStream(fileName); // filename_here에 파일의 실제 이름을 넣는다. 
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

export default CustomDownload;
