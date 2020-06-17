const DeleteEntry=(notify, errorCheck, loadFilesNFolders, curFolderID, fileID, checkUserState)=>{
    let data={};
    let idSplit=fileID.split(' ');
    for(let id in idSplit){
      data['file' + String(Number(id)+1)] = idSplit[id];
    }
    
    console.log("data : ", data)
    fetch(`${window.location.origin}/api/multi-entry`, {
      method: 'DELETE',
      headers: {
        'Content-Type' : 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(errorCheck)
    .then(content=>{
      notify('삭제 완료!');
      checkUserState();
      loadFilesNFolders('', curFolderID);
    })
    .catch(e=>notify(e));
}

export default DeleteEntry;