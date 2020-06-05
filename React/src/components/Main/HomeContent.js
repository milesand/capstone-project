import React, { useState, Fragment, useEffect, useRef } from "react";
import classNames from "classnames";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import UploadContent from "../StorageComponents/UploadContent";
import Moment from 'moment';
import 'moment/locale/ko';

import {
  Input,
  InputGroup,
  InputGroupAddon,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardDeck,
  Container,
  CardGroup,
  Progress,
  Spinner
} from "reactstrap";
import "./Content.css";
import Item from "./Item/Item";
import MyContextMenu from "./ContextMenu/MyContextMenu";
import SubSideBar from "../sidebar/SubSideBar/SubSideBar";
import CustomDownload from "../StorageComponents/CustomDownload";
import CustomFileBrowser from '../StorageComponents/CustomFileBrowser';
import DeleteEntry from "../StorageComponents/DeleteEntry";
import PreviewModal from '../Modal/PreviewModal/PreviewModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { SelectableGroup, DeselectAll } from "react-selectable-fast";

const HomeContent = (props) => {
  const [uploadModal, setUploadModal] = useState(false);
  const [mkdirModal, setMkdirModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [flow, setFlow] = useState(null);
  const [modalHeadText, setModalHeadText] = useState("업로드 경로 선택");
  const toggleUploadModal = () => setUploadModal(!uploadModal);
  const toggleMkdirModal = () => setMkdirModal(!mkdirModal);
  const toggleMoveModal = () => setMoveModal(!moveModal);
  const togglePreviewModal = () => setPreviewModal(!previewModal);
  const [fileList, setFileList] = useState([]);
  const [folderList,setFolderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [curFolderID, setCurFolderID] = useState(props.rootDirID);
  const [curFolderPath, setCurFolderPath] = useState('/');
  const [newPath, setNewPath] = useState(''); // 파일 이동 명령에 사옹할 경로 
  const [newFolderName, setNewFolderName] = useState('');
  const [isRename, toggleRename] = useState(false);
  const [newName, setNewName] = useState(""); // 새로 바꿀 이름
  const myFileGroupRef=useRef(), myFolderGroupRef=useRef();
  //import GroupItem from "./GroupItem";

  axios.defaults.withCredentials=true;
  const option = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const valChange=(e)=>{
    console.log("e : ", e.target);
    setNewFolderName(e.target.value);
  }
  const [currentItemInfo, setCurrentItemInfo] = useState({ //오른쪽 사이드바에 표시할 데이터
  });
  const [multiItemInfo, setMultiItemInfo] = useState({});
  console.log('home, props : ', props, currentItemInfo);
  useEffect(() => {
    loadFilesNFolders('', props.rootDirID);
  },[]);

  const loadFilesNFolders = (dirName, dirID) => { 
    if(dirName!=''&&dirName!='...') setCurFolderPath(curFolderPath+dirName+'/');
    if(dirName=='...'){
      const newPathArr=curFolderPath.split('/');
      let newPath='';
      for(let i=0; i<newPathArr.length-2; i++){
        newPath+=newPathArr[i]+'/';
      }
      console.log("newPath : ", newPath);
      setCurFolderPath(newPath);
    }
    setCurFolderID(dirID);
    console.log('origin : ', window.location.origin);

    //주어진 dirID를 가진 디렉토리에 들어있는 파일들 불러오기
    setIsLoading(true);
    axios.get(`${window.location.origin}/api/user`,option)
     .then((content) => {
        axios.get(`${window.location.origin}/api/directory/${dirID}`,option)
        .then(content2 => { 
            console.log("content2 : ", content2);
            const newFileList=[], newFolderList=[];
            const fileNameList= Object.keys(content2.data.files)
            for(let i=0;i<fileNameList.length;i++) {
              let date=content2.data.files[fileNameList[i]]['uploaded_at'];
              const fileInfo = {
                name:fileNameList[i],
                pk: content2.data.files[fileNameList[i]]['pk'],
                size: content2.data.files[fileNameList[i]]['size'],
                uploaded_at: Moment(date).format('LLL'),
                has_thumbnail: content2.data.files[fileNameList[i]]['has_thumbnail'],
                is_video : content2.data.files[fileNameList[i]]['is_video'],
                type:"file"
              }
              newFileList.push(fileInfo);
            }
            setCurrentItemInfo({});
            setFileList(newFileList);

            const folderNameList= Object.keys(content2.data.subdirectories) // root 하위 폴더불러오기->어차피 root폴더 접근해야해서 파일불러오기와 병행
            if(dirID!=props.rootDirID) newFolderList.push({
              name: '...',
              pk:content2.data.parent,
              type:"folder"
            })
            for(let i=0;i<folderNameList.length;i++){
              const folderInfo = {
                name: folderNameList[i],
                pk:content2.data.subdirectories[folderNameList[i]],
                type:"folder"
              }
              newFolderList.push(folderInfo)
            }
            setFolderList(newFolderList);
            setIsLoading(false);
        })
     })
  };

  const showFileInfo = (index) => {
    setCurrentItemInfo(fileList[index]);
  };

  const showFolderInfo = (index) => {
    console.log(index);
    axios.get(`${window.location.origin}/api/directory/${folderList[index]["pk"]}`,option)
    .then(content => {
      const folderInfo = {
       ...folderList[index],
       subfolderNum:Object.keys(content['data']['subdirectories']).length,
       fileNum:Object.keys(content['data']['files']).length
      }
      setCurrentItemInfo(folderInfo);
      // console.log("folder info 2"+JSON.stringify(folderInfo))
    })
    
    // setCurrentFileInfo(folderList[index]);
  };

  const handleDownload=()=>{ // 오른쪽 클릭 -> 다운로드
    console.log(currentItemInfo, multiItemInfo);
    let chk=false;
    let params='';
    if(multiItemInfo.length>1){
      for(let i in multiItemInfo){
        params+=multiItemInfo[i].pk + (i==multiItemInfo.length-1 ? '' : ' ');
        if(currentItemInfo.pk==multiItemInfo[i].pk){
          console.log("multi, info : ", multiItemInfo);
          if(!chk) chk=true;
        }
      }
      console.log("params : ", params);
    }

    if(chk) CustomDownload('', params); // 파일 여러 개 다운로드
    else{
      CustomDownload(currentItemInfo.name, currentItemInfo.pk); //단일 파일 다운로드, 또는 파일 여러개 선택했지만
                                                                //선택 안한 다른 파일에 다운로드 누른 경우
    }                                                       
  }
  
  const handleDelete=()=>{ //오른쪽 클릭 -> 삭제
    console.log("delete start!");
    let chk=false;
    let params='';
    if(multiItemInfo.length>1){ //한번에 여러개 삭제
      for(let i in multiItemInfo){
        params+=multiItemInfo[i].pk + (i==multiItemInfo.length-1 ? '' : ' ');
        if(currentItemInfo.pk==multiItemInfo[i].pk){
          console.log("multi, info : ", multiItemInfo);
          if(!chk) chk=true;
        }
      }
      console.log("params : ", params);
    }

    if(chk) { //파일 및 폴더 여러 개 삭제
      DeleteEntry(props.notify, props.errorCheck, loadFilesNFolders, curFolderID, params); 
    }
    else { // 파일 및 폴더 한개만 삭제하거나, 여러 개 선택해놓고 다른 단일 파일 삭제 시도할 경우
      DeleteEntry(props.notify, props.errorCheck, loadFilesNFolders, curFolderID, currentItemInfo.pk);
    }
  }

  const handleRename=()=>{ //오른쪽 클릭 -> 이름 바꾸기
    setNewName(currentItemInfo.name);
    console.log("cur data : ", currentItemInfo);
    toggleRename(true);
  }

  const onChangeNewName=(e)=>{
    console.log("target : ", e.target.value);
    setNewName(e.target.value);
  }

  const handleMove=()=>{//오른쪽 클릭 -> 이동
    console.log("move!");
    toggleMoveModal();
  }

  const submitNewPath=()=>{
    console.log("submit, path : ", newPath);
  }

  const handlePreview=()=>{ //오른쪽 클릭 -> 미리보기
    togglePreviewModal();
  }
  const multiFileCheck=(e)=>{
    if(e.length>=1){ // 폴더 그룹 클릭했다가 파일 그룸 클릭할 떄, 폴더 그룹 선택 해제
      console.log('props : ', e['0']);
      if(e['0'].props.itemType=='file') myFolderGroupRef.current.clearSelection();
      else myFileGroupRef.current.clearSelection();
    }

    let arr=[];
    for(let i in e){
      arr.push(e[i].props);
    }
    console.log('multi arr : ', arr);
    setMultiItemInfo(arr);
  }

  const renameCheck=(e)=>{
    console.log("unmount call ! isRename : ", isRename);
    if(isRename) toggleRename(false);
  }

  const check=(flow)=>{
    console.log("check!");
    setFlow(flow);
    if(flow) console.log('isLoading ? ', flow.files, flow.isUploading());
    if(flow&&flow.isUploading()){
      console.log("here, check called!!!");
      props.showRemainingTime(flow);
    }
  }

  const submitNewName=(target)=>{
    if(newName==fileList[multiItemInfo['0'].index].name){ //이름이 안바뀐 경우
      toggleRename(false);
      return; 
    }

    if(target.charCode==13){
      let url=`${window.location.origin}/api/`;
      if(currentItemInfo.type=='file'){ //파일
        url+='file/' + currentItemInfo.pk;
      }

      else{//디렉토리
        url+='directory/' + currentItemInfo.pk;
      }

      console.log("url : ", url);
      let data={
        'name' : newName
      }
      axios.put(url, JSON.stringify(data), option)
      .catch(res=>{
        props.errorCheck(res.response, res.response.data);
        if(res.response.status>=400) throw Error(res.response.data);
      })
      .then(response=>{
        console.log("new name res : ", response);
        let index=multiItemInfo['0'].index;
        if(currentItemInfo.type=='file'){
          fileList[index].name=newName;
          setFileList(fileList);
        }
        else{
          folderList[index].name=newName;
          setFolderList(folderList);
        }
        setNewName('');
        toggleRename(false);
        props.notify("이름 변경 완료!");
      })
      .catch(e=>{
          console.log("catched, e : ", e);
          props.notify(e);
        }
      )
    }
  }
  const createDir=()=>{
    console.log("createDir called!");
    let url=`${window.location.origin}/api/mkdir`;
    let data={
      "parent" : curFolderPath,
      'name' : newFolderName
    }
    fetch(url, {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data)
    })
    .then(res=>{
      if(res.status==400) throw Error('이미 동일한 이름의 폴더가 존재합니다.');
      props.errorCheck(res);
      console.log("err check complete!");
      return res;
    })
    //.then(res=>res.json()) # 개발용
    .then(content=>{
        props.notify('폴더 생성 완료!');
        toggleMkdirModal();
        console.log("create complete!, content : ", content.headers);
        let urlPart=content.headers.get('Location').split('/');
        //let urlPart=content.Location.split('/'); 개발용
        let id=urlPart[urlPart.length-1];
        loadFilesNFolders('', curFolderID);
    })
    .catch(e=>props.notify(e));
  }

  const changePath=(path)=>{
    setNewPath(path);
  }
  return (  
      <Fragment>

      {/*업로드 modal*/}
      {uploadModal && (
              <Modal
                isOpen={uploadModal}
                toggle={toggleUploadModal}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggleUploadModal}>
                  <div className="modal-head">{modalHeadText}</div>
                </ModalHeader>{" "}
                <ModalBody>
                  <UploadContent
                    flow={flow} 
                    setFlow={setFlow}
                    setModalHeadText={setModalHeadText}
                    notify={props.notify}
                    rootDirID={props.rootDirID}
                    errorCheck={props.errorCheck}
                    checkUserState={props.checkUserState}
                    curFolderID={curFolderID}
                    curFolderPath={curFolderPath}
                    loadFilesNFolders={loadFilesNFolders}
                    check={check}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={toggleUploadModal}
                    className="close-button"
                  >
                    닫기
                  </Button>{" "}
                </ModalFooter>
              </Modal>
            )}

      {/*위치 이동 modal*/}
            <Modal
                isOpen={moveModal}
                toggle={toggleMoveModal}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggleMoveModal}>
                  <div className="modal-head">이동 경로 설정</div>
                </ModalHeader>
                <ModalBody>
                  <div className='upload-file-browser'>
                    <CustomFileBrowser 
                      notify={props.notify}
                      rootDirID={props.rootDirID}
                      changePath={changePath}
                      errorCheck={props.errorCheck}
                      checkUserState={props.checkUserState}
                      curFolderID={curFolderID}
                      curFolderPath={curFolderPath}
                      loadFilesNFolders={loadFilesNFolders}
                      guideText='이동 경로'
                    />
                    <Button outline className="custom-button" onClick={submitNewPath}>결정</Button>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={toggleMoveModal}
                    className="close-button"
                  >
                    닫기
                  </Button>
                </ModalFooter>
            </Modal>

      {/*미리보기 modal*/}
      <PreviewModal 
          isOpen={previewModal} 
          toggle={togglePreviewModal} 
          fileName={currentItemInfo.name}
          fileID={currentItemInfo.pk}
          hasThumbnail={currentItemInfo.has_thumbnail && `${window.location.origin}/api/thumbnail/${currentItemInfo.pk}`}
          isVideo={currentItemInfo.is_video}
      />

      <Container fluid className={classNames("round", "content")} color="light">
        <div className="current-content">
          <span className="content-name">파일</span>
          <div className="add-item">
            <button
              className="add-item-label"
              onClick={toggleUploadModal}
            >
              업로드
            </button>
          </div>
        </div>
        
        <MyContextMenu
          handlePreview={handlePreview} 
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          handleRename={handleRename}
          handleMove={handleMove}
        />

        {/*파일 표시*/}
        <div>
          <SelectableGroup
            className="main"
            clickClassName="tick"
            ref={myFileGroupRef}
            enableDeselect={true}
            allowClickWithoutSelected={true}
            tolerance={10}
            resetOnStart
            onSelectionFinish={multiFileCheck}
            onSelectionClear={renameCheck}
          >
            <CardDeck className="current-items">
              <Progress />

              {isLoading ?
                <Spinner size='lg' color='primary' className='file-spinner'/>
                :
                fileList.map((item, index) => (
                <Item
                  showFileInfo={showFileInfo}
                  pk={item.pk}
                  thumbnailUrl={
                    item.has_thumbnail &&
                    `${window.location.origin}/api/thumbnail/${item.pk}`
                  }
                  itemType="file"
                  curName={currentItemInfo.name}
                  name={item.name}
                  index={index}
                  isVideo={item.is_video}
                  isMultiCheck={multiItemInfo.length>1 ? true : false}
                  isRename={isRename}
                  togglePreviewModal={togglePreviewModal}
                  newName={newName}
                  onChangeNewName={onChangeNewName}
                  submitNewName={submitNewName}  
                />
              ))}
            </CardDeck>
          </SelectableGroup>
        
          <div className="current-content">
            <span className="content-name">폴더</span>
              <div className="add-item">
                <button
                  className="add-item-label"
                  onClick={toggleMkdirModal}
                >
                폴더 생성
              </button>
            <Modal
              isOpen={mkdirModal}
              toggle={toggleMkdirModal}
              size="lg"
              unmountOnClose={false}
            >
              <ModalHeader toggle={toggleMkdirModal}>
                <div className="modal-head">폴더 생성</div>
              </ModalHeader>
              <ModalBody>
                <div>새로운 폴더명을 입력해주세요.</div>
                <InputGroup>
                    <Input 
                        type='text' 
                        name="withdrawalText"
                        id='withdrawalText'
                        value={newFolderName} 
                        onChange={valChange}
                    />
                    <InputGroupAddon addonType='append'>
                        <Button 
                            outline 
                            className="profile-button"
                            onClick={createDir}
                        >
                        입력
                        </Button>
                    </InputGroupAddon>
                </InputGroup>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  onClick={toggleMkdirModal}
                  className="close-button"
                >
                  닫기
                </Button>{" "}
              </ModalFooter>
            </Modal>
          </div>
        </div>

            {/*폴더 표시*/}
            <SelectableGroup
              className="main"
              clickClassName="tick"
              enableDeselect
              ref={myFolderGroupRef}
              allowClickWithoutSelected={true}
              tolerance={10}
              resetOnStart
              onSelectionFinish={multiFileCheck}
            >
            
              <CardDeck className="current-items">
                {isLoading ?
                  <Spinner size='lg' color='primary' className='file-spinner'/>
                :
                folderList.map((folder, index) => (
                    <Item
                      showFileInfo={showFolderInfo}
                      pk={folder.pk}
                      itemType="folder"
                      curName={currentItemInfo.name}
                      name={folder.name}
                      index={index}
                      loadFilesNFolders={loadFilesNFolders}
                      isMultiCheck={multiItemInfo.length>1 ? true : false}
                      isRename={isRename}
                      newName={newName}
                      onChangeNewName={onChangeNewName}
                      submitNewName={submitNewName}
                    />
                ))}

              </CardDeck>
            </SelectableGroup>
          </div>

      </Container>

       <SubSideBar    
         name={currentItemInfo.name}
         uploadDate={currentItemInfo.uploaded_at}
         size={currentItemInfo.size}
         pk={currentItemInfo.pk}
         type={currentItemInfo.type}
         thumbnailUrl={
           currentItemInfo.has_thumbnail &&
           `${window.location.origin}/api/thumbnail/${currentItemInfo.pk}`
         }
         subfolderNum={currentItemInfo.subfolderNum}
         fileNum={currentItemInfo.fileNum}
       />

     
 

      
    </Fragment>
  );
}

export default HomeContent;
