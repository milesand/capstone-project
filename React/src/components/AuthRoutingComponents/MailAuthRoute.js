import React from "react";
import { Route, Redirect } from "react-router-dom";

// 메일 인증 페이지에 접근하는 것은 메일 인증이 필요할 때만 하도록 제한
const MailAuthRoute = ({ component: Component, props: baseProps, ...rest }) =>{
  return(
    <Route
      {...rest}
      render={props =>
          !baseProps.isLogin
            ? <Redirect to={'/login'}/>
            : !baseProps.isMailAuthenticated
              ? <Component {...props} {...baseProps} />
              : <Redirect to={'/'}/>
      }
    />
  );
}

export default MailAuthRoute;
