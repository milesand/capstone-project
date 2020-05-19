import React, {fragement} from 'react';
import "./style2.css"

// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const DownloadTestForm = ({downloadTest, isLoading, filename, changeFilename}) => {
  console.log("loading ? : ", isLoading)
  return(
    <div>
    <fragment>
    <button
      type="button"
      className={'fadeIn' + (isLoading ? ' button is-loading is-medium':'')}
      onClick={downloadTest}
    >{isLoading ? '':'다운로드'}</button>
    </fragment>
    <fragment>
      <input
        type="text"
        id="fileName"
        className="fadeIn"
        name="fileName"
        placeholder="파일 ID 입력"
        autoFocus
        value={filename}
        onChange={changeFilename}
      />
    </fragment>
    </div>
  );
}

export default DownloadTestForm;
