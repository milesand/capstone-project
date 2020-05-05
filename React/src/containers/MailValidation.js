import React, { Component } from 'react';
import MailValidationForm from "../components/auth/MailValidationForm"
import { withRouter } from 'react-router-dom';

class MailValidation extends Component{

    constructor(props){
        super(props);
        console.log('this test2.');
        console.log(this);
        console.log(props);
        console.log(this.props.state);
        this.toHome=this.toHome.bind(this);
        this.props.userHasAuthenticated();
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
            />
        )
    }
}

export default withRouter(MailValidation);