import React, { Component } from 'react';
import ForgotIDForm from "../components/LoginComponents/ForgotIDForm";

export default class ForgotID extends Component{
    constructor(props){
        super(props);
        console.log('this test.');
        this.state = {
            email : ""
        };
        this.sendID=this.sendID.bind(this);
    }

     //로그인 상태이면 메인화면으로 리다이렉트
    componentDidMount() {
      if (this.props.isLogin) {
        this.props.history.push("/");
      }
    }

    
    sendID(e) {
        console.log("sendID start.");
        e.preventDefault();
    
        let emailData={
            IDorPassword:'id',
            username:'',
            email: this.state.email
        }
    
        fetch(`https://${window.location.hostname}/api/forgot`, {
          method: "POST",
          headers: {
            'Content-Type' : 'application/json',
          },
          body: JSON.stringify(emailData)
        })
        .then(res=>res.json())
        .then(content => {
            console.log(content);
            if(content.hasOwnProperty('error'))
                throw Error(content['error']);
            else
              this.props.history.push({pathname: '/display-id', 
                                       state: {username: content.username,
                                               email: this.state.email}});
          
        }).catch(error=>this.props.notify(error));
      }

      valChangeControl(e){
        let target_id=e.target.id;
        let target_val=e.target.value;
        this.setState({
          [target_id]: target_val
        });
      }
 

    render(){
        console.log("forgot id test.");

        return(      
            <div>
                <ForgotIDForm
                email={this.state.email}
                changeEmail={e => this.valChangeControl(e)}
                sendID = {e => this.sendID(e)}
                />
            </div>
        );
    }
}
