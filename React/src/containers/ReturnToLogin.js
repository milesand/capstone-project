import React, { Component } from 'react';
import ReturnToLoginForm from "../components/LoginComponents/ReturnToLoginForm"
import { withRouter } from 'react-router-dom';

class ReturnToLogin extends Component{
    returnToLogin=()=>{
        this.props.history.push('/login');
    }

    render(){
        return(
            <div>
                <ReturnToLoginForm returnToLogin={this.returnToLogin}/>
            </div>
        );
    }
}

export default withRouter(ReturnToLogin);
