import React, { Component } from 'react';
import MailAuthForm from "../components/auth/MailAuthForm"
import { withRouter } from 'react-router-dom';

class MailAuth extends Component{
    constructor(props){
        super(props);

        this.state = {
            username: this.props.location.state.username,
            email : this.props.location.state.email
        };
        this.resendAuthEmail=this.resendAuthEmail.bind(this);
    }

    async resendAuthEmail(e){
        let data={
            username: this.state.username,
            email: this.state.email,
        };

        e.preventDefault();
        console.log(this.state);
        let handleErrors = response =>{
            if(response.message){
                throw Error(response.message);
            }
            return response;
        }

        fetch("http://localhost/api/send-auth-email", { //HTTP GET으로 요청을 보내고, URL뒤에 사용자 식별 ID를 추가하자.
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
              },
            credentials: 'include',
        })
        .then(handleErrors)
        .then(res=>res.json())
        .then(json=>{
            console.log(json);
            console.log("메일 재발송 완료.");
        });
    }

    render(){
        return(
            <MailAuthForm
                username={this.state.username}
                email={this.state.email}
                resendAuthEmail={this.resendAuthEmail}
            />
        );
    }
}

export default withRouter(MailAuth);
