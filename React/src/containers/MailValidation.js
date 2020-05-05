import React, { Component } from 'react';
import MailValidationForm from "../components/auth/MailValidationForm"
import { withRouter } from 'react-router-dom';

class MailValidation extends Component{

    constructor(props){
        super(props);
        this.state={
            guideText: "",
            isValid: true,
        }

        this.toHome=this.toHome.bind(this);
        this.props.userHasAuthenticated();
    }

    componentDidMount(){
        console.log("href test.");
        console.log(document.location.href.split("mail-validation/"));
        let url='http://localhost/api/activate/' + document.location.href.split("mail-validation/")[1];
        let isErr=false;
        let handleErrors = response => {
            if(!response.ok){
                this.setState({
                    guideText: "만료된 링크입니다.",
                    isValid: false
                });
                isErr=true;
            }
            return response;
        }
        fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(handleErrors)
        .then(res=>res.json())
        .then(json=>{
            console.log(json);
            if(!isErr){
                this.setState({
                    guideText: "메일 인증이 완료되었습니다. 사이트 이름(추후에 수정)의 기능을 즐겨보세요!",
                });
                this.props.userHasAuthenticated(true, true, json.username, json.email);
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
            <MailValidationForm
                toHome={this.toHome}
                guideText={this.state.guideText}
                isValid={this.state.isValid}
            />
        )
    }
}

export default withRouter(MailValidation);