import React from 'react';
import { Row, Col} from "react-bootstrap";
import "../style2.css"
import { Link } from "react-router-dom";


// presentational component, only a stateless function
// gets props by destructuring the props object
// note that the input fields use the props to render their value attribute
const ErrorPage = ({}) => {
  return(
    <h2>페이지가 존재하지 않습니다. URL을 확인해주세요.</h2>
  );
}

export default ErrorPage;
