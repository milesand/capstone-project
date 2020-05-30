import React, { Component, Fragment } from "react";
import Moment from 'moment';
import ko from 'moment/locale/ko'
import FileBrowser, { Icons } from 'react-keyed-file-browser';
import '../../../node_modules/react-keyed-file-browser/dist/react-keyed-file-browser.css';

//react-keyed-file-browser 공식 example 코드 참조
export default class CustonFileBrowser extends Component{
  constructor(props){
    super(props);
    this.state={
      rootDirID: this.props.rootDirID,
      currentPath: '/',
      notify: this.props.notify,
      files: [
        {
          key: 'root/',
          id: this.props.rootDirID
        },
      ],
      isCheck: [] //폴더 정보를 체크했으면, 해당 폴더의 id를 이 배열에 추가하여 다시 정보를 로드하지 않도록 한다.
    };
    console.log("browser state : ", this.props, this.state);
  }  

  getDirectoryInfo(key, folderID){
    if(!this.state.isCheck.includes(folderID)){ //폴더 정보 불러온 적이 없을 경우
      console.log("info get, key : ", key, ", folder ID : ", folderID);
      let url="http://localhost/api/directory/" + folderID;

      let errorCheck=(response)=>{
        if(!response.ok){
          throw Error("서버 에러 발생!");
        }
        return response;
      }

      fetch(url, {
              method: "GET",
              headers: {
                'Content-Type' : 'application/json',
              },
              credentials: 'include',
      })
      .then(errorCheck)
      .then(res=>res.json())
      .then(content=>{
        console.log("initial data load complete! data : ", content, content.files, typeof(content.files));
        let files=content.files; //루트 디렉토리에 들어있는 파일 목록
        let subdirectories=content.subdirectories;
        let path="";
        for(let file in files){
          console.log("file upload time : ", files[file]['uploaded_at']);
          this.setState(state => {
            state.files = state.files.concat([{
              key: key + file,
              modified: Moment(files[file]['uploaded_at']),
              size: files[file]['size'],
              id: files[file].pk
            }])
            return state
          })
        }

        for(let directory in subdirectories){
          console.log('directory key : ', directory, ', data : ', subdirectories[directory]);
          this.setState(state => {
            state.files = state.files.concat([{
              key: key + directory + '/',
              id: subdirectories[directory]
            }])
            return state
          })
        }
        console.log("for end.");
        this.setState(state=>{
          state.isCheck=state.isCheck.concat([folderID]);
          return state;
        })
      })
      .catch(e=>this.state.notify(e));
    }
  }

  deleteFileOrDirectory=(url, type)=>{
    let errorCheck=response=>{
      if(!response.ok){
        throw Error('서버 에러 발생!');
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
      this.state.notify("삭제 완료!");
      let names=this.state.currentPath.split('/'), newPath="";
      for(let i=0; i<names.length-2; i++){
        newPath+=names[i]+'/';
      }
      this.setState({
        currentPath: newPath
      })
    })
    .catch(e=>this.state.notify(e));
  }

  isDuplicated=(name)=>{
    for(let i in this.state.files){
      let key=this.state.files[i].key;
      if(name==key){ //디렉토리 이름이 같을 경우
          return true;
      }
    }
    return false;
  }
  handleCreateFolder = (key) => { //디렉토리 만들기 기능
    if(key.substr(0, 4)!='root'){ //최상위 폴더가 루트 디렉터리가 아닌 경우
      this.state.notify('root 폴더 아래에만 폴더 생성이 가능합니다.');
      return;
    }
    if(this.isDuplicated(key)){
      this.state.notify("현재 폴더 안에 동일한 이름을 가진 폴더가 존재합니다.");
      return;
    }

    console.log("here!!!, key : ", key);
    let url="http://localhost/api/mkdir";
    console.log("url : ", url);
    let folders=key.split('/'); //폴더명에 특문 못쓰게 해야함.
    let name=folders[folders.length-2], parent="/";

    for(let i=1; i<folders.length-2; i++){ //만든 폴더 전(부모 디렉토리)까지 경로 생성
      console.log("i : ", i, ', folder : ', folders[i]);
      parent+=folders[i]+'/';
    }
    let data={
      "parent" : parent,
      'name' : name
    }

    let errorCheck=(response)=>{
      if(!response.ok){
        throw Error("서버 에러 발생!");
      }
      return response;
    }
    fetch(url, {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(errorCheck)
    .then(res=>res.json())
    .then(content=>{
        this.setState({
          currentPath:parent+name+'/'
        }, ()=>this.props.changeUploadPath(this.state.currentPath));
        
        console.log("create complete!, content : ", content);
        let urlPart=content.Location.split('/');
        let id=urlPart[urlPart.length-1];
        this.setState(state => {
          state.files = state.files.concat([{
            key: key,
            id: id
          }])
          return state
        })
        
    })
    .catch(e=>this.state.notify(e));
  }

  handleRenameFolder = (oldKey, newKey) => { //폴더 이름 변경
    if(this.isDuplicated(newKey)){
      this.state.notify("현재 폴더 안에 동일한 이름을 가진 폴더가 존재합니다.");
      return;
    }
    let url="", names=newKey.split('/');
    let data={
      name: names[names.length-2]
    }

    let errorCheck=response=>{
      if(!response.ok){
        throw Error('서버 에러 발생!');
      }
      return response;
    }

    console.log('oldkey : ', oldKey, "newKey : ",names[names.length-2]);  
    for(let i in this.state.files){
      if(this.state.files[i].key==oldKey){
        url="http://localhost/api/directory/" + this.state.files[i].id;
        break;
      }
    }

    fetch(url, {
      method: "PUT",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(errorCheck)
    .catch(e=>this.state.notify(e))

    this.setState(state => {
      const newFiles = []
      state.files.map((file) => {
        if (file.key.substr(0, oldKey.length) === oldKey) { //이름 바꾸는 폴더 및 그 아래에 있는 폴더, 파일들 key 전부 변경
          newFiles.push({
            ...file,
            key: file.key.replace(oldKey, newKey),
            modified: +Moment(),
          })
        } else {
          newFiles.push(file)
        }
      })
      state.files = newFiles
      return state
    })
  }

  handleDeleteFolder = (folderKey) => { //폴더 삭제
    if(folderKey=='root/'){
      this.state.notify('루트 디렉터리는 삭제할 수 없습니다.');
      return;
    }
    folderKey=folderKey[0]; //folderKey가 배열 형태이므로, 원소 꺼내서 다시 변수 설정
    console.log("folderKey : ", folderKey, folderKey.length);
    let url="http://localhost/api/directory/";

    const newFiles = []
    this.state.files.map((file) => {
      if(file.key==folderKey){
        url+=file.id;
      }
      if (file.key.substr(0, folderKey.length) != folderKey) {
        newFiles.push(file);
      }
    })

    this.setState(state => { // 브라우저 상에서 삭제
      state.files = newFiles
      return state
    })

    this.deleteFileOrDirectory(url, 'directory');
  }

  handleDeleteFile = (fileKey) => { //파일 삭제
    let url="http://localhost/api/file/";
    const newFiles = []

    this.state.files.map((file) => {
      if(file.key == fileKey){
        url+=file.id;
      }

      if (file.key != fileKey) {
        newFiles.push(file);
      }
    })
    this.setState(state => {
      state.files = newFiles
      return state
    })

    this.deleteFileOrDirectory(url, 'file');
  }

  handleOnSelect=(e)=>{ //폴더 클릭, 업로드 경로 설정
    if(e==undefined) return; //폴더 새로 만드는 도중에 클릭한 경우

    console.log("click here!!!!, e : ", e, e['key'].substr(4));
    console.log("files : ", this.state.files);
    let path=e['key'].substr(4);
    console.log("current path : ", path);
    this.props.changeUploadPath(path); //현재 클릭중인 디렉토리에 맞춰서 업로드 경로 변경
    this.setState({
      currentPath: path
    });
  }

  handleOnFolderOpen=(e)=>{ //폴더 열릴 때, 서버에서 해당 폴더의 정보 받아오기
    console.log("folder open!!, e : ", e);
    this.getDirectoryInfo(e.key, e.id);
  }

  myDetailRenderer=()=>{
    return(<div/>);
  }

  render(){
      return(
          <Fragment>
            <div>
            <FileBrowser
                        files={this.state.files}
                        onCreateFolder={this.handleCreateFolder}
                        onMoveFolder={this.handleRenameFolder}
                        onRenameFolder={this.handleRenameFolder}
                        onDeleteFolder={this.handleDeleteFolder}
                        onDeleteFile={this.handleDeleteFile}
                        onSelectFolder={this.handleOnSelect}
                        onFolderOpen={this.handleOnFolderOpen}
                        detailRenderer={this.myDetailRenderer}
            />
            <h5>업로드 경로 : {this.state.currentPath}</h5>
            </div>
          </Fragment>
      );
  }
}