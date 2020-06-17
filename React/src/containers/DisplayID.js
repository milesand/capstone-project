import React, { Component } from 'react';
import DisplayIDForm from "../components/LoginComponents/DisplayIDForm"
import { withRouter } from 'react-router-dom';

class DisplayID extends Component{
    constructor(props){
        super(props);
        this.state = {
            username: this.props.history.location.state.username,
            email : this.props.history.location.state.useremail
        };
        console.log(this.state);
    }

    render(){
        console.log(" test.");

        return(
            <div>
            {this.state.username!="" && this.state.email!=""&&
                <DisplayIDForm
                username={this.state.username}
            />
            }
            </div>
        );
    }
}

export default withRouter(DisplayID);
