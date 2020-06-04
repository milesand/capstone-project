import React, {fragment} from 'react';
import {Spinner} from 'reactstrap';
import "../style2.css"

// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const DownloadTestForm = ({downloadTest, fileID, isLoading, changeFileID}) => {
  return(
    <fragment>
      <div>
        <button
          id='downloadButton'
          type="button"
          className={'fadeIn'}
          onClick={downloadTest}
          disabled={isLoading}
        >{isLoading ? <Spinner size="sm" color='light'/>:'다운로드'}</button>
      </div>

      <div>
        <input
          type="text"
          id="fileID"
          className="fadeIn"
          name="id"
          placeholder="ID"
          autoFocus
          value={fileID}
          onChange={changeFileID}
        />
      </div>
    </fragment>
  );
}

export default DownloadTestForm;
