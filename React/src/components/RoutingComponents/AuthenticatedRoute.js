import React from "react";
import { Route, Redirect } from "react-router-dom";

// 로그인을 하지 않았을 경우 로그인 화면으로 리다이렉트, 메일인증을 받지 않았을 경우 메일 인증 페이지로 리다이렉트
const AuthentiCatedRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  console.log("auth, component : ", Component, ', baseProps : ', baseProps, ', rest : ', rest);
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