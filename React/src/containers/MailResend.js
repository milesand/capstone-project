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
            nickname: this.props.nickname,
            state: this.props.nickname,
            email : this.props.useremail,
            isLoading : false
        };
        this.resendAuthEmail=this.resendAuthEmail.bind(this);
        console.log(this.state);
    }
    
    async resendAuthEmail(e){
        e.preventDefault();
        console.log('클릭!');
        console.log(this.state);
        this.props.toggleLoadingState();

        this.setState((prevState)=>({
            isLoading: true
        }));
        
        fetch(`${window.location.origin}/api/send-auth-email`, { //HTTP GET으로 요청을 보내고, URL뒤에 사용자 식별 ID를 추가하자.
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
              },
            credentials: 'include',
        })
        .then(this.props.errorCheck)
        .then(res=>res.json())
        .then(content=>{
            console.log(content);
            console.log("메일 재발송 완료.");
            this.props.toggleLoadingState();
        });
    }

    render(){
        console.log("mail auth render test.", this.state);
        
        return(
            <div>
            { this.state && this.state.username!="" && this.state.email!=""&&
                <MailResendForm
                username={this.state.username}
                nickname={this.state.nickname}
                email={this.state.email}
                resendAuthEmail={this.resendAuthEmail}
                isLoading={this.props.isLoading}
                logout={this.props.logout}
            />
            }
            </div>
        );
    }
}

export default withRouter(MailResend);
