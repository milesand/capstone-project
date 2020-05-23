import React from "react";
import { Route } from "react-router-dom";

// 인증 필요로하지 않는 컴포넌트 라우팅
const NormalRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  return(
    <Route {...rest} render={props => <Component {...props} {...baseProps} />} />);
};

export default NormalRoute;