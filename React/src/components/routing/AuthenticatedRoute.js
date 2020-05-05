import React from "react";
import { Route, Redirect } from "react-router-dom";

// 인증 필요로하는 컴포넌트 라우팅
export default ({ component: C, props: cProps, ...rest }) =>
  <Route
    {...rest}
    render={props =>
      cProps.isAuthenticated
        ? cProps.isMailAuthenticated
          ?<C {...props} {...cProps} />
          : <Redirect to={'/mail-resend'} /> 
        : <Redirect to={'/login'} />}
  />;
