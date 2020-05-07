import React, { Component } from 'react';
import MailResendForm from "../components/LoginComponents/MailResendForm"
import { withRouter } from 'react-router-dom';

class MailResend extends Component{
    constructor(props){
        super(props);
        console.log('this test.');
        console.log(this);
        this.state = {
            username: this.props.username,
            email : this.props.useremail
        };
        this.resendAuthEmail=this.resendAuthEmail.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        const usernameCheck = nextState.username !== "";
        const emailCheck = nextState.email !== "";
        console.log("not render test.");
        console.log(nextProps);
        console.log(nextState)
        console.log(this.state.username);
        console.log(this.state.email);
        console.log(usernameCheck);
        console.log(emailCheck);    
        return usernameCheck && emailCheck;
    }
    
    async resendAuthEmail(e){
        e.preventDefault();
        console.log(this.state);
        let errorCheck = response =>{
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
        .then(errorCheck)
        .then(res=>res.json())
        .then(content=>{
            console.log(content);
            console.log("메일 재발송 완료.");
        });
    }

    render(){
        console.log("mail auth test.");

        return(
            <div>
            { this.state && this.state.username!="" && this.state.email!=""&&
                <MailResendForm
                username={this.state.username}
                email={this.state.email}
                resendAuthEmail={this.resendAuthEmail}
            />
            }
            </div>
        );
    }
}

export default withRouter(MailResend);
