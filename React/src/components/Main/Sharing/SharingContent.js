import React, {Fragment, useState, useEffect} from 'react';
import MainFileBrowser from '../MainFileBrowser';
import Moment from 'moment';
import 'moment/locale/ko';
import axios from 'axios';
import './SharingContent.css';
import loadTeamList from '../Team/LoadTeamList'
import styled from "styled-components";
import {
    BaseTable,
    Tbody,
    Thead,
    Th,
    Tr,
    Td,

  } from "react-row-select-table";

import {
    Spinner,
} from 'reactstrap';

const CustomTable = styled.div`
  table {
    margin-top : 2%;
    border-collapse: inherit;
    border-spacing: 0px;
    width: 100% !important;
    /* float: right; */
    border-radius: 10px;
    border-width: 2px;
    border-style: solid;
    border-color: #c9c9c9;
    background-color: #ffffff !important;
  }
  thead {
    float: center;
    width: 99%;
    background-color : #CCCCCC;
  }
  tbody {
    overflow-y: scroll !important;
    overflow-x: hidden;
    float: left;
    width: 99%;
    height: 300px;
    background-color:#FFFFFF;
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
    width: 99%;
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
    width: 310px;
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

  tbody input[type="checkbox"] {
    display: none;
  }

  tbody input[type="checkbox"]:checked {
    color: green !important;
    background-color: green !important;
  }
`;

const SharingContent=(props)=>{
    const option = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

    const [fileList, setFileList] = useState([]);
    const [folderList,setFolderList] = useState([]);
    const [curFolderID, setCurFolderID] = useState(props.rootDirID);
    const [curFolderPath, setCurFolderPath] = useState('/');
    const [isLoading, setIsLoading] = useState(false);
    const [isTeamListLoading, setTeamListLoading] = useState(false);
    const [teamList, setTeamList] = useState([]);
    const [curTeam, setCurTeam] = useState([]);
    const [isSharingInit, setIsSharingInit] = useState(true);
    const [showSearchResult, setShowSearchResult] = useState(false);

    useEffect(() => {
        console.log("sharing start. : ", props);
        console.log("share switch! props : ", props.switchSearchingRoot);
        loadTeamList(setTeamListLoading, setTeamList, props);
    },[])

    const loadSharingFolders=()=>{
        console.log("cur team : ", curTeam);
        setIsLoading(true);
        axios.get(`${window.location.origin}/api/team-management/${curTeam._id}`,option)
        .then(content => {
            const newFolderList=[];
            console.log("share folders : ", content.data.share_folders);
            for(let i in content.data.share_folders){
                let folderElement=content.data.share_folders[i];
                const folderInfo={
                    name: folderElement.name,
                    pk: folderElement.pk,
                    type: 'folder'
                }
                newFolderList.push(folderInfo);
            }
            console.log("new folder list : ", newFolderList);
            setFolderList(newFolderList);
            setIsLoading(false);
        })
        .catch(e=>{
          props.notify(e);
          setIsLoading(false);
        })
    }

    const setFileNFolderInfo=(dirID, rootDirID, FileInfoList, FolderInfoList, parent)=>{
      const newFileList=[], newFolderList=[];

      const fileNameList= Object.keys(FileInfoList)
      for(let i=0;i<fileNameList.length;i++) {
        let date=FileInfoList[fileNameList[i]]['uploaded_at'];
        let br_path=FileInfoList[fileNameList[i]]['browser_path'];
        if(br_path&&props.searchRootDirName!=''){
          let share_path='';
          let br_path_element=br_path.split('/');
          for(let i in br_path_element){
            if(br_path_element[i]==props.searchRootDirName){ //공유 폴더 설정 지점에서 끊는다.
                for(; i<br_path_element.length-1; i++){
                  share_path+= br_path_element[i] + '/';
                }
                break;
            }
          }
          console.log("share path : ", share_path);
          br_path=share_path;
        }
        const fileInfo = {
          name:(dirID=='' ? FileInfoList[fileNameList[i]]['name'] : fileNameList[i]),
          pk: FileInfoList[fileNameList[i]]['pk'],
          size: FileInfoList[fileNameList[i]]['size'],
          uploaded_at: Moment(date).format('LLL'),
          has_thumbnail: FileInfoList[fileNameList[i]]['has_thumbnail'],
          is_video : FileInfoList[fileNameList[i]]['is_video'],
          type : "file",
          browser_path : br_path,
        }
        newFileList.push(fileInfo);
      }
      setFileList(newFileList);
      const folderNameList= Object.keys(FolderInfoList) // root 하위 폴더불러오기->어차피 root폴더 접근해야해서 파일불러오기와 병행
      if(dirID!=rootDirID) newFolderList.push({
        name: '...',
        pk:parent,
        type:"folder"
      })
      for(let i=0;i<folderNameList.length;i++){
        console.log("br path folder info : ", FolderInfoList[folderNameList[i]]);
        let br_path=FolderInfoList[folderNameList[i]]['browser_path'];
        if(br_path&&props.searchRootDirName!=''){
          let share_path='';
          let br_path_element=br_path.split('/');
          for(let i in br_path_element){
            if(br_path_element[i]==props.searchRootDirName){ //공유 폴더 설정 지점에서 끊는다.
                for(; i<br_path_element.length-1; i++){
                  share_path+=br_path_element[i] + '/';
                }
                break;
            }
          }
          console.log("share path : ", share_path);
          br_path=share_path;
        }
        const folderInfo = {
          name: (dirID=='' ? FolderInfoList[folderNameList[i]]['name'] : folderNameList[i]),
          pk:(dirID=='' ? folderNameList[i] : FolderInfoList[folderNameList[i]]),
          browser_path : br_path,
          type:"folder"
        }
        newFolderList.push(folderInfo)
      }
      setFolderList(newFolderList);
    }

    const loadFilesNFolders = (dirName='', dirID=curFolderID, browserPath='', 
                               isSearching=false, searchFileList=[], searchFolderList=[]) => {
        console.log('dirName : ', dirName, ', dirID :  ', dirID);
        if(showSearchResult && !isSearching) setShowSearchResult(false);
                
        if(dirName=='...'){
          const newPathArr=curFolderPath.split('/');
          let newPath='';
          for(let i=0; i<newPathArr.length-2; i++){
              newPath+=newPathArr[i]+'/';
          }
          console.log("newPath : ", newPath);
          setCurFolderPath(newPath);
          if(newPath=='/'){ //공유폴더
              console.log("to the sharing folder list!");
              setIsSharingInit(true);
              loadSharingFolders();
              return;
          }
      }
        if(dirID==''){//공유폴더 목록 출력
            console.log("init, curFolderPath : ", curFolderPath);
            setIsSharingInit(true);
            console.log("curteam sharefolder : ", curTeam.share_folders);
            loadSharingFolders();
        }
        
        else{ //일반 폴더 목록 출력
            props.switchSearchingRoot(dirID, dirName); //검색 범위 변경
            setIsSharingInit(false);
            if(dirName!=''&&dirName!='...'){
              if(browserPath=='')
                setCurFolderPath(curFolderPath+dirName+'/');
              else
                setCurFolderPath(browserPath + dirName+ '/');
            }

            setCurFolderID(dirID);
        
            //주어진 dirID를 가진 디렉토리에 들어있는 파일들 불러오기
            if(isSearching){
              setFileNFolderInfo(
                '',
                '',
                searchFileList,
                searchFolderList,
                props.rootDirID, 
              );
            }
            else{
              setIsLoading(true);
              axios.get(`${window.location.origin}/api/directory/${dirID}`,option)
              .then(props.errorCheck)
              .then(content2 => { 
                  if(content2.hasOwnProperty('error')) throw Error(content2['error']);
                  console.log("content2 : ", content2);
                  setFileNFolderInfo(
                                  dirID,
                                  props.rootDirID,
                                  content2.data.files, 
                                  content2.data.subdirectories, 
                                  content2.data.parent, 
                                );
                  setIsLoading(false);
              })
              .catch(e=>{
                props.notify(e);
                setIsLoading(false);
              })
            }
        }
    };
    let sharingTeamChecked=[];
    const shareTeamOnCheck=(value)=>{
        console.log("check!", value);
        sharingTeamChecked=value;
        submitShareTeam();
    }

    const submitShareTeam=()=>{
        setCurTeam(teamList[sharingTeamChecked[0]]);
    }
    return(
        <Fragment>
            {curTeam.length==0 
                ?
                /*팀 선택*/
                    <div className='fadeInDown sharing-team-table'>
                        <CustomTable>
                        <div className='sharing-team-headText'>팀 선택</div>
                        <BaseTable onCheck={shareTeamOnCheck}>
                            <Thead>
                                <Tr>
                                    <Th>팀 이름</Th>
                                    <Th>팀장</Th>
                                    <Th>팀장 ID</Th>
                                </Tr>
                            </Thead>                         
                              <Tbody>
                                    {isTeamListLoading 
                                    ? 
                                    <div className='sharing-layer'>
                                      <div className='sharingTeam-body'>
                                        <Spinner size='lg' color='primary'/>
                                      </div>
                                    </div>
                                    :
                                    teamList.map((team, index) => (
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
                    </div>
                    
                :
                <MainFileBrowser
                    isSharing={true}
                    isSharingInit={isSharingInit}
                    checkUserState={props.checkUserState}
                    notify={props.notify}
                    errorCheck={props.errorCheck}
                    rootDirID={props.rootDirID}
                    fileList={fileList}
                    setFileList={setFileList}
                    folderList={folderList}
                    setFolderList={setFolderList}
                    curFolderID={curFolderID}
                    curFolderPath={curFolderPath}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    loadFilesNFolders={loadFilesNFolders}
                    showSearchResult={showSearchResult}
                    setShowSearchResult={setShowSearchResult}
                    searchRootDirID={props.searchRootDirID}
                    searchRootDirName={props.searchRootDirName}
                />
            }
        </Fragment>
    );
}

export default SharingContent;