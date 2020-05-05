import React from "react";
import { Route, Switch } from "react-router-dom";
import AppliedRoute from "./components/routing/AppliedRoute";
import AuthenticatedRoute from "./components/routing/AuthenticatedRoute";
import MailAuthRoute from "./components/routing/MailAuthRoute";
import NotFound from "./components/routing/NotFound";
import Home from "./containers/Home";
import Login from "./containers/Login";
import Signup from "./containers/Signup";
import MailResend from "./containers/MailResend";
import MailValidation from "./containers/MailValidation";

//AuthenticatedRoute는 로그인이 필요한 서비스를 나타내며, AppliedRoute는 로그인이 필요하지 않은 서비스를 나타낸다.
export default ({ childProps }) =>
  <Switch>
    <AuthenticatedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute path="/login" exact component={Login} props={childProps} />
    <AppliedRoute path="/signup" exact component={Signup} props={childProps} />
    <MailAuthRoute path="/mail-resend" exact component={MailResend} props={childProps} />
    <AppliedRoute path="/mail-validation/*" exact component={MailValidation} props={childProps} />
    <Route component={NotFound} />
</Switch>;
