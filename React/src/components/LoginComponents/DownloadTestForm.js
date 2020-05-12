import React from 'react';
import "./style2.css"
import CustomButton from "./CustomButton"

// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const DownloadTestForm = ({downloadTest}) => {
  return(
    <CustomButton/>
  );
}

export default DownloadTestForm;
