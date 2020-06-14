import React, { Component, Fragment } from "react";
import FileBrowser, { Icons } from 'react-keyed-file-browser';


export default class RecoverBrowser extends Component{
  constructor(props){
    super(props);
    this.state={
      currentPath: this.props.curFolderPath,
      currentFolderID: this.props.curFolderID,
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

        for(let directory in subdirectories){
          console.log('directory key : ', directory, ', data : ', subdirectories[directory]);
          this.setState(state => {
            state.files = state.files.concat([{
              key: key + directory + '/',
              id: subdirectories[directory].pk
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



  handleOnSelect=(e)=>{ //폴더 클릭, 업로드 경로 설정
    if(e===undefined) return; //폴더 새로 만드는 도중에 클릭한 경우
    let path='';
    if(this.props.isSharing) path=e['key'];
    else path=e['key'].substr(4);
    console.log("current path : ", path);
    console.log("current id : ", e['id'], e['id']['pk']);
    this.props.changePath(path); //현재 클릭중인 디렉토리에 맞춰서 업로드 경로 변경
    this.setState({
      currentPath: path,
      currentFolderID: e['id']
    });
    this.props.changeDirID(e['id']);
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
                        icons={Icons.FontAwesome(4)}
                        onSelectFolder={this.handleOnSelect}
                        onFolderOpen={this.handleOnFolderOpen}
                        detailRenderer={this.myDetailRenderer}

            />
            <h5>{this.props.guideText} : {this.state.currentPath}</h5>
            </div>
          </Fragment>
      );
  }
}