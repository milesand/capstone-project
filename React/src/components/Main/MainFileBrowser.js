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

import {
  BaseTable,
  Tbody,
  Thead,
  Th,
  Tr,
  Td,
} from "react-row-select-table";

import "./Content.css";
import Item from "./Item/Item";
import MyContextMenu from "./ContextMenu/MyContextMenu";
import SubSideBar from "../sidebar/SubSideBar/SubSideBar";
import CustomDownload from "../StorageComponents/CustomDownload";
import CustomFileBrowser from '../StorageComponents/UploadFileBrowser';
import DeleteEntry from "../StorageComponents/DeleteEntry";
import PreviewModal from '../Modal/PreviewModal/PreviewModal';
import loadTeamList from './Team/LoadTeamList';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { SelectableGroup} from "react-selectable-fast";
import styled from "styled-components";

const CustomTable = styled.div`
  table {
    border-collapse: inherit;
    border-spacing: 0px;
    width: 99% !important;
    /* float: right; */
    border-radius: 6px;
    border-width: 1px;
    border-style: solid;
    border-color: #c9c9c9;
    color: #505050 !important;
  }
  thead {
    float: left;
    width: 100%;
  }
  tbody {
    overflow-y: scroll !important;
    overflow-x: hidden;
    float: left;
    width: 100%;
    height: 300px;
  }
  tbody::-webkit-scrollbar {
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-track {
    margin-top: 0px !important;
    margin-bottom: 0px !important;
    background-color: transparent !important;
  }
  tbody::-webkit-scrollbar-thumb {
    max-height: 100px !important;
    min-height: 100px !important;
    height: 100px;
    outline-color: transparent !important;
    outline-width: 0px !important;
  }
  tr {
    display: block;

    border-width: 0px 0px 1px 0px;
    border-style: solid;
    border-color: #c9c9c9;
    height: 50px;
    width: 100%;
  }
  tr:first-child {
    border-top-left-radius: 5px !important;
    border-top-right-radius: 5px !important;
  }
  tr:last-child {
    border-bottom-left-radius: 5px !important;
    border-bottom-right-radius: 5px !important;
    border-color: transparent;
  }
  tr.tr-body:hover {
    background-color: #f5f5f5;
  }

  tr.tr-checked {
    background-color: #c3d8ff !important;
  }

  th {
    width: 168px;
    padding: 0.5rem;
    text-align: left;
  }

  td {
    padding: 0.5rem;
    width: 300px;
    text-align: left;
  }

  td:first-child {
    width: 10px;
  }
  
  thead input[type='checkbox'] {
    display: none;
  }



  tbody input[type="checkbox"]:checked {
    color: green !important;
    background-color: green !important;
  }
`;

const MainFileBrowser = (props) => {
  const [uploadModal, setUploadModal] = useState(false);
  const [mkdirModal, setMkdirModal] = useState(false);
  const [moveModal, setMoveModal] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [shareModal, setShareModal] = useState(false);
  const [flow, setFlow] = useState(null);
  const [modalHeadText, setModalHeadText] = useState("업로드 경로 선택");
  const toggleUploadModal = () => setUploadModal(!uploadModal);
  const toggleMkdirModal = () => setMkdirModal(!mkdirModal);
  const toggleMoveModal = () => setMoveModal(!moveModal);
  const togglePreviewModal = () => setPreviewModal(!previewModal);
  const toggleShareModal =() => setShareModal(!shareModal);
  const [newPath, setNewPath] = useState(''); // 파일 이동 명령에 사옹할 경로 
  const [newFolderName, setNewFolderName] = useState('');
  const [isRename, toggleRename] = useState(false);
  const [newName, setNewName] = useState(""); // 새로 바꿀 이름
  const [isTeamLoading, setIsTeamLoading] = useState(false);
  const [teamList, setTeamList] = useState([]);
  const [defaultCheckTeam, setDefaultCheckTeam] = useState([]); //공유 설정 modal에서 현재 공유설정 되어있는
                                                                // 팀 목록 저장할때 사용
  let shareTeamChecked=[];
  const myFileGroupRef=useRef(), myFolderGroupRef=useRef();
  //import GroupItem from "./GroupItem";

  const option = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
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
    if(!props.isSharingInit) props.loadFilesNFolders('', props.rootDirID);
    else props.loadFilesNFolders('', ''); // 공유폴더 목록 불러오기
  },[]);

  /*const loadFilesNFolders = (dirName, dirID) => { 
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
  };*/

  const showFileInfo = (index) => {
    setCurrentItemInfo(props.fileList[index]);
  };

  const showFolderInfo = (index) => {
    console.log(index);
    axios.get(`${window.location.origin}/api/directory/${props.folderList[index]["pk"]}`,option)
    .then(content => {
      const folderInfo = {
       ...props.folderList[index],
       subfolderNum:Object.keys(content['data']['subdirectories']).length,
       fileNum:Object.keys(content['data']['files']).length,
      }
      setCurrentItemInfo(folderInfo);
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
      CustomDownload(currentItemInfo.name, currentItemInfo.pk, props.notify, props.loadFilesNFolders); //단일 파일 다운로드, 또는 파일 여러개 선택했지만
                                                                //선택 안한 다른 파일에 다운로드 누른 경우
    }                                                       
  }
  
  const handleDelete=()=>{ //오른쪽 클릭 -> 삭제
    console.log("delete start, cur : ", currentItemInfo);
    let chk=false;
    let params='';
    if(multiItemInfo.length>1){ //한번에 여러개 삭제
      for(let i in multiItemInfo){
        if(multiItemInfo[i].type=='folder' && multiItemInfo[i].name=='...') continue;
        params+=multiItemInfo[i].pk + (i==multiItemInfo.length-1 ? '' : ' ');
        if(currentItemInfo.pk==multiItemInfo[i].pk){
          console.log("multi, info : ", multiItemInfo);
          if(!chk) chk=true;
        }
      }
      console.log("params : ", params);
    }

    if(chk) { //파일 및 폴더 여러 개 삭제
      DeleteEntry(props.notify, props.errorCheck, props.loadFilesNFolders, props.curFolderID, params); 
    }
    else { // 파일 및 폴더 한개만 삭제하거나, 여러 개 선택해놓고 다른 단일 파일 삭제 시도할 경우
      DeleteEntry(props.notify, props.errorCheck, props.loadFilesNFolders, props.curFolderID, currentItemInfo.pk);
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
    if(e.length>=1){ // 폴더 그룹 클릭했다가 파일 그룸 클릭할 때, 폴더 그룹 선택 해제
      console.log('props : ', e['0'], myFileGroupRef);
      if(e['0'].props.itemType=='file') myFolderGroupRef.current.clearSelection();
      else if(myFileGroupRef.current) myFileGroupRef.current.clearSelection(); //처음 공유폴더목록을 보여줄 때 
                                                                               //파일 목록이 나타나지 않기 때문에
                                                                               //current가 존재하는지 체크해준다. 
    }

    let arr=[];
    for(let i in e){
      arr.push(e[i].props);
    }
    setMultiItemInfo(arr);
  }

  const renameCheck=(e)=>{
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
    if(newName==props.fileList[multiItemInfo['0'].index].name){ //이름이 안바뀐 경우
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
          props.fileList[index].name=newName;
          props.setFileList(props.fileList);
        }
        else{
          props.folderList[index].name=newName;
          props.setFolderList(props.folderList);
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

  const handleShare=()=>{//폴더에 오른쪽 클릭 -> 공유 설정
    //console.log("handle share!", currentItemInfo.pk);
    loadTeamList(setIsTeamLoading, setTeamList, props, setDefaultCheckTeam, currentItemInfo.pk);
    toggleShareModal(!shareModal);
  }

  const shareTeamOnCheck=(value)=>{
    console.log("select val : ", value);
    if(shareTeamChecked.length>value.length){
      console.log('unCheck!!!!');
    }
    shareTeamChecked=value;
  }

  const submitShareTeam=()=>{
    console.log("submit!");
    let deleteTeam=defaultCheckTeam.filter(x=>!shareTeamChecked.includes(x));
    let newTeam=shareTeamChecked.filter(x=>!defaultCheckTeam.includes(x))
    let newData={}, deleteData={};
    for(let i in newTeam){
      console.log("team info : ", teamList[newTeam[i]]);
      newData['team'+(Number(i)+1)]=teamList[newTeam[i]]._id;
    }
    for(let i in deleteTeam){
      console.log("team info : ", teamList[deleteTeam[i]]);
      deleteData['team'+(Number(i)+1)]=teamList[deleteTeam[i]]._id;
    }
    let url=`${window.location.origin}/api/sharing/${currentItemInfo.pk}`;
    fetch(url, {
      method: 'PUT',
      headers:{
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newData)
    })
    .then(res=>res.json())
    .then(response=>{
      if(response.hasOwnProperty('error')) throw Error(response['error']);
    })
    .then(()=>{
    fetch(url, {
      method: 'DELETE',
      headers:{
        'Content-Type' : 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(deleteData)
    })
    .then(res=>res.json())
    .then(response=>{
      if(response.hasOwnProperty('error')) throw Error(response['error']);
      props.notify('공유 설정 변경 완료!');
      toggleShareModal();
    })})
    .catch(e=>props.notify(e));
    
  }
  const createDir=()=>{ //홈 화면에서 폴더 생성
    console.log("createDir called!");
    let url=`${window.location.origin}/api/mkdir`;
    let data={
      "parent" : props.isSharing ? props.curFolderID : props.curFolderPath,
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
    //.then(res=>res.json()) //개발용
    .then(content=>{
        props.notify('폴더 생성 완료!');
        toggleMkdirModal();
        setNewFolderName('');
        let urlPart=content.headers.get('Location').split('/');
        //let urlPart=content.Location.split('/'); //개발용
        let id=urlPart[urlPart.length-1];
        props.loadFilesNFolders('', props.curFolderID);
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
                    isSharing={props.isSharing} //공유 폴더일 때 업로드 처리
                    flow={flow} 
                    setFlow={setFlow}
                    setModalHeadText={setModalHeadText}
                    notify={props.notify}
                    rootDirID={props.rootDirID}
                    errorCheck={props.errorCheck}
                    checkUserState={props.checkUserState}
                    curFolderID={props.curFolderID}
                    curFolderPath={props.curFolderPath}
                    loadFilesNFolders={props.loadFilesNFolders}
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
                      curFolderID={props.curFolderID}
                      curFolderPath={props.curFolderPath}
                      loadFilesNFolders={props.loadFilesNFolders}
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
          notify={props.notify}
          loadFilesNFolders={props.loadFilesNFolders}
      />

      {/*디렉토리 공유 설정 modal*/}
      <Modal
        isOpen={shareModal}
        toggle={toggleShareModal}
        size="lg"
      >
        <ModalHeader toggle={toggleShareModal}>
          <div>공유 팀 선택</div>
        </ModalHeader>
          <ModalBody className='sharing-team-modal'>
            {isTeamLoading ? 
              <Spinner size='lg' color='primary' className='share-spinner'/>
              : 
              <CustomTable>
              <BaseTable onCheck={shareTeamOnCheck} checkeds={defaultCheckTeam}>
                <Thead>
                  <Tr>
                    <Th>팀 이름</Th>
                    <Th>팀장</Th>
                    <Th>팀장 ID</Th>
                  </Tr>
                </Thead>
                <Tbody className="friend-list-body">
                  {teamList.map((team, index) => (
                    <Tr key={index} value={team["team_name"]}>
                      <Td>{index + 1}</Td>
                      <Td>{team['team_name']}</Td>
                      <Td>{team["team_leader_nickname"]}</Td>
                      <Td>{team["team_leader"]}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </BaseTable>
              </CustomTable>
            }
          </ModalBody>
        <ModalFooter>
          <Button
            outline
            color="secondary"
            onClick={submitShareTeam}
            className="close-button"
          >
          결정
          </Button>
          <Button
            outline
            color="primary"
            onClick={toggleShareModal}
            className="close-button"
          >
          닫기
          </Button>
        </ModalFooter>
      </Modal>

              
      <MyContextMenu
          handlePreview={handlePreview} 
          handleDownload={handleDownload}
          handleDelete={handleDelete}
          handleRename={handleRename}
          handleMove={handleMove}
          handleShare={handleShare}
        />

      <Container fluid className={classNames("round", "content")} color="light">
        {/*파일 표시*/}
        {!props.isSharingInit &&
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
        }
          <div>
            {!props.isSharingInit &&
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

                {props.isLoading ?
                  <Spinner size='lg' color='primary' className='file-spinner'/>
                  :
                  props.fileList.map((item, index) => (
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
            }
            <div className="current-content">
              <span className="content-name">{props.isSharingInit ? '공유 폴더 목록' : '폴더'}</span>            
                <div className="add-item">
                {!props.isSharingInit &&
                  <button
                    className="add-item-label"
                    onClick={toggleMkdirModal}
                  >
                  폴더 생성
                </button>
                }
              {/*폴더 생성 modal*/}
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
                {props.isLoading ?
                  <Spinner size='lg' color='primary' className='file-spinner'/>
                :
                props.folderList.map((folder, index) => (
                    <Item
                      showFileInfo={showFolderInfo}
                      pk={folder.pk}
                      itemType="folder"
                      curName={currentItemInfo.name}
                      name={folder.name}
                      index={index}
                      loadFilesNFolders={props.loadFilesNFolders}
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

export default MainFileBrowser;
