import React, { useState, Fragment, useEffect } from "react";
import classNames from "classnames";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import UploadContent from "../StorageComponents/UploadContent";
import Moment from 'moment';
import 'moment/locale/ko';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CardDeck,
  Container,
  CardGroup,
  Input,
  Progress,
  Spinner
} from "reactstrap";
import "./Content.css";
import Item from "./Item/Item";
import MyContextMenu from "./ContextMenu/MyContextMenu";
import SubSideBar from "../sidebar/SubSideBar/SubSideBar";
import CustomDownload from "../StorageComponents/CustomDownload";
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { SelectableGroup } from "react-selectable-fast";

const HomeContent = (props) => {
  const [uploadModal, setUploadModal] = useState(false);
  const [flow, setFlow] = useState(null);
  const [modalHeadText, setModalHeadText] = useState("업로드 경로 선택");
  const toggle = () => setUploadModal(!uploadModal);
  const [fileList, setFileList] = useState([]);
  const [folderList,setFolderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  //import GroupItem from "./GroupItem";

  const option = {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  };

  const [currentItemInfo, setCurrentItemInfo] = useState({ //오른쪽 사이드바에 표시할 데이터
  });
  const [rootPk, setRootPk] = useState('');
  console.log('home, props : ', props, currentItemInfo);
  useEffect(() => {
    setRootPk(props.rootDirID);
    loadFilesNFolders(props.rootDirID);
  },[]);

  const loadFilesNFolders = (dirID) => { 
    //전체 파일 불러오기->파일이름 못불러옴
    // axios.get("http://localhost/api/file-list", option).then((content) => {
    //   console.log("file list : " + JSON.stringify(content.data));
    //   setFileList(content.data);
    //   fileList.map((file, index) => {
    //     console.log(index + "번 파일" + file.pk);
    //   });
    // });

    //깊이 1(root폴더) 파일들 불러오기
    axios.get("http://localhost/api/user",option)
     .then((content) => {
        axios.get(`http://localhost/api/directory/${dirID}`,option)
        .then(content2 => { 
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
                type:"file"
              }
              newFileList.push(fileInfo);
            }
            setCurrentItemInfo({});
            setFileList(newFileList);

            const folderNameList= Object.keys(content2.data.subdirectories) // root 하위 폴더불러오기->어차피 root폴더 접근해야해서 파일불러오기와 병행

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
    console.log(index, fileList[index]);
    setCurrentItemInfo(fileList[index]);
  };

  const showFolderInfo = (index) => {
    console.log(index);
    axios.get(`http://localhost/api/directory/${folderList[index]["pk"]}`,option)
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
    console.log(currentItemInfo);
    CustomDownload(currentItemInfo.pk);
  }

  const test=(e)=>{
    console.log("multi test, e : ", e);
  }
  return (  
      <Fragment>

      <Container fluid className={classNames("round", "content")} color="light">
        <div className="current-content">
          <span className="content-name">파일</span>
          <div className="add-item">
            <button
              htmlFor="add-items"
              className="add-item-label"
              onClick={toggle}
            >
              업로드
            </button>
            {uploadModal && (
              <Modal
                isOpen={uploadModal}
                toggle={toggle}
                size="lg"
                unmountOnClose={false}
              >
                <ModalHeader toggle={toggle}>
                  <div className="testtest">{modalHeadText}</div>
                </ModalHeader>{" "}
                {/*upload modal*/}
                <ModalBody>
                  <UploadContent
                    flow={flow} 
                    setFlow={setFlow}
                    setModalHeadText={setModalHeadText}
                    notify={props.notify}
                    rootDirID={props.rootDirID}
                    errorCheck={props.errorCheck}
                    checkUserState={props.checkUserState}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onClick={toggle}
                    className="close-button"
                  >
                    닫기
                  </Button>{" "}
                </ModalFooter>
              </Modal>
            )}
          </div>
        </div>
        
        {/*파일 표시*/}
        <MyContextMenu id="contextMenuItemID" handleDownload={handleDownload}/>
          <div>
            <SelectableGroup
              className="main"
              clickClassName="tick"
              enableDeselect={true}
              allowClickWithoutSelected={true}
              tolerance={10}
              resetOnStart
              onSelectionFinish={test}
            >
              <CardDeck className="current-items">
                {/* { file !== '' && <img className='profile_preview' src={previewURL}></img>} */}
                <Progress />

              {isLoading ?
                <Spinner size='lg' color='primary' className='file-spinner'/>
                :
                fileList.map((item, index) => (
                <Item
                  key={index}
                  name={item.name}
                  showFileInfo={showFileInfo}
                  uploadDate={item.uploaded_at}
                  size={item.size}
                  pk={item.pk}
                  itemType="file"
                  index={index}
                  thumbnailUrl={
                    item.has_thumbnail &&
                    `http://localhost/api/thumbnail/${item.pk}`
                  }
                />
              ))}
              </CardDeck>
            </SelectableGroup>
        
            <div className="current-content">
              <span className="content-name">폴더</span>
              
            </div>

            {/*폴더 표시*/}
            <SelectableGroup
              className="main"
              clickClassName="tick"
              enableDeselect
              // allowCtrlClick
              allowClickWithoutSelected={true}
              tolerance={10}
              resetOnStart
            >
            
              <CardDeck className="current-items">
                {isLoading ?
                  <Spinner size='lg' color='primary' className='file-spinner'/>
                :
                folderList.map((folder, index) => (
                    <Item
                      key={index}
                      showFileInfo={showFolderInfo}
                      name={folder.name}
                      pk={folder.pk}
                      index={index}
                      itemType="folder"
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
           `http://localhost/api/thumbnail/${currentItemInfo.pk}`
         }
         subfolderNum={currentItemInfo.subfolderNum}
         fileNum={currentItemInfo.fileNum}
       />

     
 

      
    </Fragment>
  );
}

export default HomeContent;
