import React, {Fragment, useState, useEffect} from 'react';
import MainFileBrowser from './MainFileBrowser';
import Moment from 'moment';
import 'moment/locale/ko';
import axios from 'axios';



const RecycleContent=(props)=>{
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
      

    useEffect(() => {
      },[])

    const loadRecycleItems=()=>{
        setIsLoading(true);
        axios.get(`${window.location.origin}/api/recycle`,option)
            .then(content2 => {
              const newFileList=[], newFolderList=[];
              const fileNameList= Object.keys(content2.data.files)
              for(let i=0;i<fileNameList.length;i++) {
                let date=content2.data.files[fileNameList[i]][0]['uploaded_at'];
                const fileInfo = {
                    name:fileNameList[i],
                    pk: content2.data.files[fileNameList[i]][0]['pk'],
                    size: content2.data.files[fileNameList[i]][0]['size'],
                    uploaded_at: Moment(date).format('LLL'),
                    has_thumbnail: content2.data.files[fileNameList[i]][0]['has_thumbnail'],
                    is_video : content2.data.files[fileNameList[i]][0]['is_video'],
                    favorite : content2.data.files[fileNameList[i]][0]['favorite'],
                    type:"file"
                }
                newFileList.push(fileInfo);
                console.log('file pk : ',content2.data.files[fileNameList[i]][0])
              }
              setFileList(newFileList);
  
              const folderNameList= Object.keys(content2.data.directories) // root 하위 폴더불러오기->어차피 root폴더 접근해야해서 파일불러오기와 병행
              for(let i=0;i<folderNameList.length;i++){
                console.log('content2 : ', content2.data.directories[folderNameList[i]])
                  const folderInfo = {
                      name: folderNameList[i],
                      pk:content2.data.directories[folderNameList[i]][0],
                    //   favorite : true,
                      type:"folder"
                  }
                  newFolderList.push(folderInfo)
              }
              setFolderList(newFolderList);
              setIsLoading(false);

            })
    }


 
    return(
        <Fragment>
                <MainFileBrowser
                    isRecycle={true}
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
                    loadFilesNFolders={loadRecycleItems}
                    changeDirID = {setCurFolderID}
                />
        </Fragment>
    );
}

export default RecycleContent;