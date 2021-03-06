import React, { Component } from 'react';
import ForgotPasswordForm from "../components/LoginComponents/ForgotPasswordForm";
import axios from 'axios';

export default class ForgotPassword extends Component{
    constructor(props){
        super(props);
        console.log('this test.');
        this.state = {
            username : "",
            email : ""
        };
        this.sendPassword=this.sendPassword.bind(this);
    }

     //유저 로그인 상태 체크
    componentDidMount() {
    if (this.props.isLogin) {
      this.props.history.push("/");
    }
  }

    
    sendPassword(e) {
        e.preventDefault();
        console.log("password send!");
        let emailData={
            IDorPassword:'password',
            username:this.state.username,
            email: this.state.email
        }

        this.props.toggleLoadingState();

        fetch(`${window.location.origin}/api/forgot`, {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(emailData)
        })
        .then(res=>res.json())
        .then(content => {
            console.log(content);
            if(content.hasOwnProperty('error'))
                throw Error('이메일 또는 닉네임이 올바르지 않습니다.');
            else{
              this.props.toggleLoadingState();
              this.props.history.push('/return-to-login',{username: content.username, email: this.email});
            }
              
              //redirect? push 대신 replace?
        }).catch(error=>{
          this.props.notify(error);
          this.props.toggleLoadingState();
        });
      }

      valChangeControl(e){
        let target_id=e.target.id;
        let target_val=e.target.value;
        this.setState({
          [target_id]: target_val
        });
      }
 

    render(){
        console.log("forgot password test.");

        return(      
            <div>
                <ForgotPasswordForm
                email={this.state.email}
                username = {this.state.username}
                isLoading = {this.props.isLoading}
                changeEmail={e => this.valChangeControl(e)}
                changeUsername={e => this.valChangeControl(e)}
                sendPassword = {e => this.sendPassword(e)}
                />
            </div>
        );
    }
}
