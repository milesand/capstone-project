import React from "react";
import { Route, Redirect } from "react-router-dom";

// 메일 인증 페이지에 접근하는 것은 메일 인증이 필요할 때만 하도록 제한
export default ({ component: C, props: cProps, ...rest }) =>
  <Route
    {...rest}
    render={props =>
        !cProps.isAuthenticated
          ? <Redirect to={'/login'}/>
          : !cProps.isMailAuthenticated
            ? <C {...props} {...cProps} />
            : <Redirect to={'/'}/>
    }
  />;
