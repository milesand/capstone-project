import React, {Fragment, useState} from 'react';
import MainFileBrowser from './MainFileBrowser';
import Moment from 'moment';
import 'moment/locale/ko';
import axios from 'axios';

const HomeContent=(props)=>{
    console.log("homeContent props : ", props);
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

    const loadFilesNFolders = (dirName, dirID=curFolderID) => { 
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
              console.log("new folder list : ", newFolderList);
              setFolderList(newFolderList);
              setIsLoading(false);
          })
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
        />
    );
}

export default HomeContent;