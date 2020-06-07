import streamSaver from 'streamsaver';

const CustomDownload=(fileName, fileID, notify, loadFilesNFolders)=>{
    let fileStream=null;

    let errorCheck = response =>{
      console.log("response : ", response);
      if(!response.ok){
        loadFilesNFolders('');
        throw Error('파일이 존재하지 않습니다.');
      }
      
      return response;
    }

    let data={};
    let idSplit=fileID.split(' ');
    for(let id in idSplit){
      data['file' + String(Number(id)+1)] = idSplit[id];
    }
    console.log('data : ', data);

    fetch(`https://${window.location.hostname}/api/download`, {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(data),
      credentials: 'include'

    })
    .then(errorCheck)
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
    }).catch(e=>notify(e))
    
}

export default CustomDownload;
