import React, {fragement} from 'react';
import "../style2.css"

// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const UploadTestForm = ({myRef, isLoading, fid}) => {
  console.log("UploadTestForm start.", myRef, isLoading)
  return(
    <div>
        <button
            ref={myRef}
            id='uploadButton'
            type="button"
            className={'fadeIn' + (isLoading ? ' button is-loading is-medium':'')}
        >{isLoading ? '':'업로드'}</button>
        <h1>{fid}</h1>
    </div>
  );
}

export default UploadTestForm;
