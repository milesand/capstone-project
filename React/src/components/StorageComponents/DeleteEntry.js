import axios from 'axios';

//다중 파일 삭제
const DeleteEntry=(notify, errorCheck, loadFilesNFolders, curFolderID, fileID, checkUserState)=>{
    let data={};
    let idSplit=fileID.split(' ');
    for(let id in idSplit){
      data['file' + String(Number(id)+1)] = idSplit[id];
    }
    
    console.log("data : ", data)
    axios.delete(`${window.location.origin}/api/multi-entry`, {
      data: data,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    })
    .catch(error=>{
      errorCheck(error.response);
    })
    .then(()=>{
      notify('삭제 완료!');
      checkUserState();
      loadFilesNFolders('', curFolderID);
    })
    .catch(e=>notify(e));
}

export default DeleteEntry;