import React, {Fragment, useState, useEffect} from 'react';
import MainFileBrowser from './MainFileBrowser';
import Moment from 'moment';
import 'moment/locale/ko';
import axios from 'axios';

import {
    Spinner,
} from 'reactstrap';


const FavoriteContent=(props)=>{
    const option = {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

    const [fileList, setFileList] = useState([]);
    const [folderList,setFolderList] = useState([]);
    const [curFolderID, setCurFolderID] = useState(props.rootDirID);
    const [curFolderPath, setCurFolderPath] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFavoriteInit, setIsFavoriteInit] = useState(true);

    useEffect(() => {
        console.log("Favorite start. : ", props);
      },[])

    const loadFavoriteItems=()=>{
        setIsLoading(true);
        axios.get(`${window.location.origin}/api/favorite`,option)
            .then(content2 => {
                console.log('content2 : ',JSON.stringify(content2.data))
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
                  favorite : true,
                  type:"file"
              }
              newFileList.push(fileInfo);
              }
              setFileList(newFileList);
  
              const folderNameList= Object.keys(content2.data.directories) // root 하위 폴더불러오기->어차피 root폴더 접근해야해서 파일불러오기와 병행
              for(let i=0;i<folderNameList.length;i++){
                  const folderInfo = {
                      name: folderNameList[i],
                      pk:content2.data.directories[folderNameList[i]],
                      favorite : true,
                      type:"folder"
                  }
                  newFolderList.push(folderInfo)
              }
              setFolderList(newFolderList);
              setIsLoading(false);

            })
    }
    const loadFilesNFolders = (dirName, dirID=curFolderID) => {
        if(dirID=='' || dirID==props.rootDirID){//즐겨찾기 파일,폴더들 출력
            console.log("init, curFolderPath : ", curFolderPath);
            setIsFavoriteInit(true);
            loadFavoriteItems();
           
        }
        else{ //일반 폴더
            setIsFavoriteInit(false);
            if(dirName!=''&&dirName!='...') setCurFolderPath(curFolderPath+dirName+'/');
            if(dirName=='...'){ 
                console.log('newPath curFolderpath : ', curFolderPath);
                const newPathArr=curFolderPath.split('/');
                let newPath='';
                for(let i=0; i<newPathArr.length-2; i++){
                    newPath+=newPathArr[i]+'/';
                }
                console.log("newPath : ", newPath);
                setCurFolderPath(newPath);
                if(newPath==''){ 
                    console.log("to the favorite folder!");
                    setCurFolderPath('');
                    setIsFavoriteInit(true);
                    loadFavoriteItems();
                    return;
                }
            }
            setCurFolderID(dirID);
        
            //주어진 dirID를 가진 디렉토리에 들어있는 파일들 불러오기
            setIsLoading(true);
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
                    favorite : content2.data.files[fileNameList[i]]['favorite'],
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


 
    return(
        <Fragment>
                <MainFileBrowser
                    isFavorite={true}
                    isFavoriteInit={isFavoriteInit}
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
                    isFavorite={true}
                />
        </Fragment>
    );
}

export default FavoriteContent;