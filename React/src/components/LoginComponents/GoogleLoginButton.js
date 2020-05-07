import React, {Component} from 'react';
class GoogleLoginButton extends Component {
    constructor(props){
        super(props);
    }

    renderButton = () => {
        console.log("구글 로그인 버튼 렌더링중..");
        window.gapi.signin2.render('my-signin2', {
          'scope': 'profile email',
          'width': 180,
          'height': 35,
          'longtitle': true,
          'theme': 'dark',
          'onsuccess': this.props.googleLogin,
        });
    }

    componentDidMount(){
        window.addEventListener('google-loaded', this.renderButton);
        window.gapi && this.renderButton();
    }

    render(){
        return(
            <div id="my-signin2"></div>
        );
    }
} 




export default GoogleLoginButton;