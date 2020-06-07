import React, { Component, Fragment } from "react";
import Moment from 'moment';
import { Button } from 'reactstrap';
import FileBrowser, { Icons } from 'react-keyed-file-browser';
import '../../../node_modules/react-keyed-file-browser/dist/react-keyed-file-browser.css';
import './UploadContent.css';

//react-keyed-file-browser 공식 example 코드 참조
export default class UploadFileBrowser extends Component{
  constructor(props){
    super(props);
    this.state={
      currentPath: this.props.curFolderPath,
      currentFolderID: '',
      notify: this.props.notify,
      files: [
        {
          key: this.props.rootKey,
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
      let url=`${window.location.origin}/api/directory/${folderID}`;

      fetch(url, {
              method: "GET",
              headers: {
                'Content-Type' : 'application/json',
              },
              credentials: 'include',
      })
      .then(this.props.errorCheck)
      .then(res=>res.json())
      .then(content=>{
        console.log("initial data load complete! data : ", content, content.files, typeof(content.files));
        let files=content.files; //루트 디렉토리에 들어있는 파일 목록
        let subdirectories=content.subdirectories;

        for(let file in files){
          let size=files[file]['size'];
          console.log('file : ', file, ' size : ', size);
          //표시된 파일 크기를 실제 크기와 맞추기 위해 사용 
          size=size>1024
                ? size>Math.pow(1024, 2)
                  ? size=(size/1000/1000) * Math.pow(1024, 2)
                  : size=(size/1000) * 1024
                : size;

          this.setState(state => {
            state.files = state.files.concat([{
              key: key + file,
              modified: Moment(files[file]['uploaded_at']),
              size: size,
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
        this.setState(state=>{
          state.files=Array.from(new Set(state.files));
          state.isCheck=state.isCheck.concat([folderID]);
          return state;
        })
      })
      .catch(e=>this.state.notify(e));
    }
  }

  deleteFileOrDirectory=(url)=>{

    fetch(url, {
      method: "DELETE",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
    })
    .then(this.props.errorCheck)
    .then(()=>{
      this.state.notify("삭제 완료!");
      this.props.checkUserState();
      let names=this.state.currentPath.split('/'), newPath="";
      for(let i=0; i<names.length-2; i++){
        newPath+=names[i]+'/';
      }
      this.setState({
        currentPath: newPath
      })
      this.props.loadFilesNFolders('', this.props.curFolderID);
    })
    .catch(e=>this.state.notify(e));
  }

  isDuplicated=(name)=>{
    for(let i in this.state.files){
      let key=this.state.files[i].key;
      if(name===key){ //디렉토리 이름이 같을 경우
          return true;
      }
    }
    return false;
  }

  handleCreateFolder = (key) => { //디렉토리 만들기 기능
    console.log('currentFolderID : ', this.state.currentFolderID);
    if(this.state.currentFolderID==''){
      this.state.notify('최상위 폴더 아래에만 폴더 생성이 가능합니다.');
      return;
    }
    console.log("key : ", key);
    if(key.substr(0, this.props.rootKey.length-1)!==this.props.rootKey.substr(0, this.props.rootKey.length-1)){ //최상위 폴더가 루트 디렉터리가 아닌 경우
      key=this.props.rootKey + key;
    }
    if(this.isDuplicated(key)){
      this.state.notify("현재 폴더 안에 동일한 이름을 가진 폴더가 존재합니다.");
      return;
    }

    console.log("here!!!, key : ", key);
    let url=`${window.location.origin}/api/mkdir`;
    let folders=key.split('/'); //폴더명에 특문 못쓰게 해야함.
    let name=folders[folders.length-2], parent="/";
    if(this.props.isSharing){
      parent=this.state.currentFolderID;
    }
    else{
      for(let i=1; i<folders.length-2; i++){ //만든 폴더 전(부모 디렉토리)까지 경로 생성
        console.log("i : ", i, ', folder : ', folders[i]);
        parent+=folders[i]+'/';
      }
    }
    let data={
      "parent" : parent,
      'name' : name
    }
    console.log("parent : ", parent, ', name : ', name);
    fetch(url, {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(this.props.errorCheck)
    //.then(res=>res.json()) //개발용
    .then(content=>{
        this.setState({
          currentPath:parent+name+'/'
        }, ()=>this.props.changePath(this.state.currentPath));
        
        console.log("create complete!, content : ", content);
        let urlPart=content.headers.get('Location').split('/');
        //let urlPart=content['Location'].split('/'); //개발용
        let id=urlPart[urlPart.length-1];
        this.setState(state => {
          state.files = state.files.concat([{
            key: key,
            id: id
          }])
          return state
        })
        this.state.notify('생성 완료!');
        this.props.loadFilesNFolders('', this.props.curFolderID);
    })
    .catch(e=>this.state.notify(e));
  }

  handleRenameFolder = (oldKey, newKey) => { //폴더 이름 변경
    if(this.isDuplicated(newKey)){
      this.state.notify("현재 폴더 안에 동일한 이름을 가진 폴더가 존재합니다.");
      return;
    }
    if(oldKey==this.props.rootKey){
      this.state.notify("root 폴더의 이름은 변경할 수 없습니다.");
      return;
    }
    let url="", names=newKey.split('/');
    let data={
      name: names[names.length-2]
    }

    console.log('oldkey : ', oldKey, "newKey : ",names[names.length-2]);  
    for(let i in this.state.files){
      if(this.state.files[i].key===oldKey){
        url=`${window.location.origin}/api/directory/${this.state.files[i].id}`;
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
    .then(this.props.errorCheck)
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
    this.props.loadFilesNFolders('', this.props.curFolderID);
    this.props.notify("폴더 이름 변경 완료!");
  }

  handleDeleteFolder = (folderKey) => { //폴더 삭제
    console.log("folderKey : ", folderKey);
    if(folderKey.length==0){
      return;
    }

    let newFiles = []
    for(let i in folderKey){
      console.log("delete folder key : ", folderKey[i]);
      if(folderKey[i]===this.props.rootKey){
        this.state.notify('루트 디렉터리는 삭제할 수 없습니다.');
        return;
      }
      console.log("folderKey : ", folderKey, folderKey.length);
      let url=`${window.location.origin}/api/directory/`;
      this.state.files.map((file) => {
        if(file.key === folderKey[i]){
          console.log("matching here, key : ", file.key);
          url+=file.id;
        }
      })

      this.deleteFileOrDirectory(url);
    }

    //console.log("final new files : ", newFiles);
    for(let i in folderKey){
      this.setState(state => {
        state.files = state.files.filter(file=>file.key.substr(0, folderKey[i].length) !== folderKey[i]);
        return state
      });
    }
  }

  handleDeleteFile = (fileKey) => { //파일 삭제
    console.log("delete file!, key : ", fileKey, 'state key : ', this.state.files);
    if(fileKey.length==0){
      return;
    }
    let newFiles = []
    for(let i in fileKey){
      let url=`${window.location.origin}/api/file/`;
      this.state.files.map((file) => {
        if(file.key === fileKey[i]){
          console.log("matching here, key : ", file.key);
          url+=file.id;
        }
      })

      this.deleteFileOrDirectory(url);
    }

    /*this.state.files.map((file) => {
      if (!fileKey.includes(file.key)) {
        newFiles.push(file);
      }
    })

    this.setState(state => {
      state.files = newFiles
      return state
    });*/

    for(let i in fileKey){
      this.setState(state => {
        state.files = state.files.filter(file=>file.key !== fileKey[i]);
        console.log("into file setState, files : ", state.files);
        return state
      });
    }
  }

  handleOnSelect=(e)=>{ //폴더 클릭, 업로드 경로 설정
    if(e===undefined) return; //폴더 새로 만드는 도중에 클릭한 경우
    let path='';
    if(this.props.isSharing) path=e['key'];
    else path=e['key'].substr(4);
    console.log("current path : ", path);
    if(this.props.isSharing) this.props.changePath(e['id']);
    else this.props.changePath(path); //현재 클릭중인 디렉토리에 맞춰서 업로드 경로 변경
    this.setState({
      currentPath: path,
      currentFolderID: e['id']
    });
  }

  handleOnFolderOpen=(e)=>{ //폴더 열릴 때, 서버에서 해당 폴더의 정보 받아오기
    console.log("folder open!!, e : ", e);
    this.getDirectoryInfo(e.key, e.id);
  }

  myDetailRenderer=()=>{
    return(<div/>);
  }

  myDeletionRenderer=(e)=>{
    console.log("on delete, e : ", e);
    return(
      <Fragment>
        <h6>{e.children[1]}</h6>
        <Button outline color='danger ' onClick={e.handleDeleteSubmit} className='delete-button'>삭제</Button>
      </Fragment>
    );
  }
  
  myMultipleDeletionRenderer=(e)=>{
    console.log("on multi delete, e : ", e);
    return(
      <Fragment>
        <Button outline color='danger ' onClick={e.handleDeleteSubmit} className='delete-button'>삭제</Button>
      </Fragment>
    );
  }

  render(){
      return(
          <Fragment>
            <div>
            <FileBrowser
                        files={this.state.files}
                        icons={Icons.FontAwesome(4)}
                        onCreateFolder={this.handleCreateFolder}
                        onMoveFolder={this.handleRenameFolder}
                        onRenameFolder={this.handleRenameFolder}
                        onDeleteFolder={this.handleDeleteFolder}
                        onDeleteFile={this.handleDeleteFile}
                        onSelectFolder={this.handleOnSelect}
                        onFolderOpen={this.handleOnFolderOpen}
                        detailRenderer={this.myDetailRenderer}
                        confirmDeletionRenderer={this.myDeletionRenderer}
                        confirmMultipleDeletionRenderer={this.myMultipleDeletionRenderer}
            />
            <h5>{this.props.guideText} : {this.state.currentPath}</h5>
            </div>
          </Fragment>
      );
  }
}