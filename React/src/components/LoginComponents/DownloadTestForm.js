import React from 'react';
import "./style2.css"

// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const DownloadTestForm = ({downloadTest}) => {
  return(
        <h1>다운로드 테스트</h1>
  );
}

export default DownloadTestForm;
