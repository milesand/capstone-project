import React, {Fragment, useState, useEffect} from 'react';
import MainFileBrowser from './MainFileBrowser';
import Moment from 'moment';
import 'moment/locale/ko';
import axios from 'axios';

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
    const [isLoading, setIsLoading] = useState(true);
    const [showSearchResult, setShowSearchResult] = useState(false);
    useEffect(() => {
      console.log("homeContent start! props : ", props);

      if(showSearchResult){
        loadFilesNFolders('', props.searchRootDirID);
      }
      else{
        loadFilesNFolders();
      }
    }, []); 
        // showSearchResult는 검색 결과로 나온 폴더 내부로 이동하기 위해 필요
        // 파일 리스트 및 폴더 리스트는 검색어 바뀔 때 내용 바뀌게 하기 위해 필요

    const setFileNFolderInfo=(dirID, rootDirID, FileInfoList, FolderInfoList, parent)=>{
      const newFileList=[], newFolderList=[];
      const fileNameList= Object.keys(FileInfoList)
      for(let i=0;i<fileNameList.length;i++) {
        let date=FileInfoList[fileNameList[i]]['uploaded_at'];
        const fileInfo = {
          name:(dirID=='' ? FileInfoList[fileNameList[i]]['name'] : fileNameList[i]),
          pk: FileInfoList[fileNameList[i]]['pk'],
          size: FileInfoList[fileNameList[i]]['size'],
          uploaded_at: Moment(date).format('LLL'),
          has_thumbnail: FileInfoList[fileNameList[i]]['has_thumbnail'],
          is_video : FileInfoList[fileNameList[i]]['is_video'],
          type : "file",
          browser_path : FileInfoList[fileNameList[i]]['browser_path'],
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
        const folderInfo = {
          name: (dirID=='' ? FolderInfoList[folderNameList[i]]['name'] : folderNameList[i]),
          pk:(dirID=='' ? folderNameList[i] : FolderInfoList[folderNameList[i]]),
          browser_path : FolderInfoList[folderNameList[i]]['browser_path'],
          type:"folder"
        }
        newFolderList.push(folderInfo)
      }
      console.log("new folder list : ", newFolderList);
      setFolderList(newFolderList);
    }

    const loadFilesNFolders = (dirName='', dirID=curFolderID, browserPath='', 
                               isSearching=false, searchFileList=[], searchFolderList=[]) => {
        if(showSearchResult && !isSearching) setShowSearchResult(false);
        props.switchSearchingRoot(dirID, dirName); //검색 범위 변경
        console.log('isSearching ? ', isSearching);
        ///////////////////////////////
        // dirName : 접근하는 폴더 이름
        // dirID : 접근하는 디렉토리의 ID, 기본값 현재 폴더 ID
        // browserPath : 검색결과로 나온 폴더의 파일 브라우저 상에서의 경로. 검색 결과로 나온 폴더에 접근할 때 경로 수정을 위해 사용
        // isSearching : 검색결과 표시 여부
        // searchFileList : 겸색 결과 파일 모음
        // searchFolderList : 검색 결과 폴더 모음
        ///////////////////////////////
        if(dirName!=''&&dirName!='...'){
          if(browserPath=='')
            setCurFolderPath(curFolderPath+dirName+'/');
          else
            setCurFolderPath(browserPath + dirName+ '/');
        }
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
          console.log("isSearching fail!!!");
          setIsLoading(true);
            axios.get(`${window.location.origin}/api/directory/${dirID}`,option)
            .then(props.errorCheck)
            .then(content2 => { 
              if(content2.hasOwnProperty('error')) throw Error(content2['error']);
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
    };
    
    return(
        <MainFileBrowser
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
    );
}

export default HomeContent;