import React, { Component } from 'react';
import MailValidationForm from "../components/LoginComponents/MailValidationForm"
import { withRouter } from 'react-router-dom';

class MailValidation extends Component{

    constructor(props){
        super(props);
        this.state={
            guideText: "",
            isValid: true,
        }

        this.toHome=this.toHome.bind(this);
    }

    componentDidMount(){
        console.log(document.location.href.split("mail-validation/"));
        let url='http://localhost/api/activate/' + document.location.href.split("mail-validation/")[1];
        let isErr=false;
        let errorCheck = response => {
            if(!response.ok){
                this.setState({
                    guideText: "만료된 링크입니다.",
                    isValid: false
                });
                isErr=true;
            }
            return response;
        }
        console.log('fetch start.');
        fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(errorCheck)
        .then(res=>res.json())
        .then(content=>{
            console.log('content : ', content);
            if(!isErr){
                this.setState({
                    guideText: "메일 인증이 완료되었습니다. Moonge drive의 기능을 즐겨보세요!",
                });
                console.log(this.state);
                console.log('메일 인증 완료.', this.state.guideText);
                console.log(this.state);
                this.props.userStateChange(true, true, content.username, content.nickname, content.email);
            }
        });
    }

    toHome(){
        console.log("toHome.");
        console.log(this);
        this.props.history.push('/');
    }

    render(){
        return(
            <div>
                <MailValidationForm
                    toHome={this.toHome}
                    guideText={this.state.guideText}
                    isValid={this.state.isValid}
                />
            </div>
        )
    }
}

export default withRouter(MailValidation);