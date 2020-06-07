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

const HomeContent=(props)=>{
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
    useEffect(() => {
        console.log("sharing start. : ", props);
        loadTeamList(setTeamListLoading, setTeamList, props);
      },[])

    const loadSharingFolders=()=>{
        console.log("cur team : ", curTeam);
        setIsLoading(true);
        axios.get(`https://${window.location.hostname}/api/team-management/${curTeam._id}`,option)
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
    }
    const loadFilesNFolders = (dirName, dirID=curFolderID) => {
        if(dirID==''){//공유폴더 목록 출력
            console.log("init, curFolderPath : ", curFolderPath);
            setIsSharingInit(true);
            console.log("curteam sharefolder : ", curTeam.share_folders);
            loadSharingFolders();
        }
        else{ //일반 폴더 목록 출력
            setIsSharingInit(false);
            if(dirName!=''&&dirName!='...') setCurFolderPath(curFolderPath+dirName+'/');
            if(dirName=='...'){ //여기서 체크 해줘야함. 
                const newPathArr=curFolderPath.split('/');
                let newPath='';
                for(let i=0; i<newPathArr.length-2; i++){
                    newPath+=newPathArr[i]+'/';
                }
                console.log("newPath : ", newPath);
                setCurFolderPath(newPath);
                if(newPath=='/'){ //공유폴더
                    console.log("to the sharing folder!");
                    setIsSharingInit(true);
                    loadSharingFolders();
                    return;
                }
            }
            setCurFolderID(dirID);
        
            //주어진 dirID를 가진 디렉토리에 들어있는 파일들 불러오기
            setIsLoading(true);
            axios.get(`https://${window.location.hostname}/api/directory/${dirID}`,option)
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
                />
            }
        </Fragment>
    );
}

export default HomeContent;