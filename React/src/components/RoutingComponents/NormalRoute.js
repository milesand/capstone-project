import React from "react";
import { Route } from "react-router-dom";

// 아무나 접근 가능
const NormalRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  return(
    <Route {...rest} render={props => <Component {...props} {...baseProps} />} />);
};

export default NormalRoute;