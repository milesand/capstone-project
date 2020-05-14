import React from "react";
import { Route, Redirect } from "react-router-dom";

// 로그인 하지 않은 사용자들만 접근 가능한 컴포넌트 라우팅
const NotAuthentiCatedRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  return(
    <Route
      {...rest} render={props =>
        baseProps.isLogin
          ? <Redirect to={'/'} /> 
          : <Component {...props} {...baseProps} />}
    />
  );
}

export default NotAuthentiCatedRoute;