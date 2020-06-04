import React from "react";
import { Route, Redirect } from "react-router-dom";

// 인증 필요로하는 컴포넌트 라우팅
const AuthentiCatedRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  console.log("auth, component : ", Component, baseProps, rest);
  return(
    <Route
      {...rest} render={props =>
        baseProps.isLogin
          ? baseProps.isMailAuthenticated
            ? <Component {...props} {...baseProps} {...rest} />
            : <Redirect to={'/mail-resend'} /> 
          : <Redirect to={'/login'} />}
    />
  );
}

export default AuthentiCatedRoute;