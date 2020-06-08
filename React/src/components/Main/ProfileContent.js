import React, {Component, Fragment} from 'react';
import ProfileContentForm from './ProfileContentForm.js';

export default class ProfileCotnent extends Component{
    constructor(props){
        super(props);
        this.state={
            isSocialAccount: this.props.username.length>15 ? true : false,
            isValueConfirmed: false,
            username: "",
            email: "",
            password: "",
            nickname: "",
            phone_num: "",
            social: "",
            newPassword: "",
            withdrawalText : "",
            withdrawalModal: false,
            isConfirmLoading: false,
        }
        console.log("profile, props : ", this.props, this.props.username.includes('_'));
    }

    valChangeControl=(e)=>{
        let target_id=e.target.id;
        let target_val=e.target.value;
        this.setState({
          [target_id]: target_val
        });
        console.log(target_id, ' : ', target_val);
    }

    onEnterPressed=(target)=>{
        console.log("target : ", target);
        if(target.charCode==13){
            if(this.state.withdrawalModal)
                this.processWithdrawal();
            else
                this.checkConfirmValue();
        }
    }

    checkConfirmValue=()=>{
        let message="", url="", data={};
        if(this.state.isSocialAccount){
            message="이메일주소가 일치하지 않습니다.";
            url=`${window.location.origin}/api/check-email`;
            data={
                email: this.state.email
            }
        }
        else{
            message="비밀번호가 일치하지 않습니다.";
            url=`${window.location.origin}/api/check-password`;
            data={
                password: this.state.password
            }
        }

        this.setState({
            isConfirmLoading : true
        })
        fetch(url, {
            method: 'POST',
            headers:{
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
        .then((response)=>this.props.errorCheck(response, message))
        .then(()=>{
            this.props.getUserInfo()
            .then(content=>{
                console.log("content : ", content);
                this.setState({
                    username: content.username,
                    nickname: content.nickname,
                    email: content.email,
                    phone_num: content.phone_num,
                    social: content.social_auth,
                    isValueConfirmed: true
                })
            });    
            this.setState({
                isConfirmLoading : false
            })
        })
        .catch(e=>{
            this.props.notify(e)
            this.setState({
                isConfirmLoading : false
            })
        });
    }

    changeProfile=(curPassword, newPassword, phone_num, nickname, errMsg)=>{
        let data={
            curPassword: curPassword,
            newPassword: newPassword,
            phone_num: phone_num,
            nickname: nickname
        }
        fetch(`${window.location.origin}/api/user`, {
            method: "PUT",
            headers: {
                'Content-Type' : 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        .then((response)=>this.props.errorCheck(response, errMsg))
        .then(()=>{
            this.props.notify("변경 완료!");
            this.props.checkUserState();
            this.props.userStateChange(true,
                                       true,
                                       this.state.username,
                                       this.state.nickname, 
                                       this.props.email, 
                                       this.props.rootDirID);
        })
        .catch(e=>this.props.notify(e));
    }

    changeNickname=()=>{
        let errMsg="닉네임은 2글자 이상 15자 이하의 영문 대소문자, 한글, 또는 숫자로 이루어져야 합니다."
        this.changeProfile(this.state.password, "", "", this.state.nickname, errMsg);
    }

    changePhoneNum=()=>{
        let errMsg="전화번호 형식을 확인해주세요."
        this.changeProfile(this.state.password, "", this.state.phone_num, "", errMsg);
    }

    changePassword=()=>{
        let errMsg="비밀번호는 8글자 이상 15자 이하의 영문과 숫자로 이루어져야 합니다."
        this.changeProfile(this.state.password, this.state.newPassword, "", "", errMsg);
    }

    returnToHome=()=>{
        this.props.history.push("/");
    }

    toggle=()=>{
        console.log("toggle click!");
        this.setState(state=>{
            state.withdrawalModal=!state.withdrawalModal;
            return state;
        })
    }

    processWithdrawal=()=>{
        let data={
            'password' : this.state.password
        }
        if(this.state.withdrawalText=='지금탈퇴'){
            fetch(`${window.location.origin}/api/user`, {
                method: "DELETE",
                headers:{
                    'Content-Type' : 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            })
            .then(content=>{
                console.log("withdrawal content : ", content);
                this.props.notify("회원 탈퇴가 완료되었습니다.");
                this.props.userStateChange(false, false);
                this.props.history.push('/login');
            });
        }
        else{
            this.props.notify("회원탈퇴 문자가 일치하지 않습니다. 다시 입력해주세요.");
        }
    }
    render(){
        return(
            <Fragment>
                <ProfileContentForm 
                    username={this.state.username}
                    nickname={this.state.nickname}
                    email={this.state.email}
                    phone_num={this.state.phone_num}
                    social={this.state.social}
                    isValueConfirmed={this.state.isValueConfirmed}
                    isSocialAccount={this.state.isSocialAccount}
                    value={this.state.isSocialAccount 
                            ? this.state.email 
                            : this.state.password
                          }
                    valChange={this.valChangeControl}
                    checkConfirmValue={this.checkConfirmValue}
                    changeNickname={this.changeNickname}
                    changePassword={this.changePassword}
                    changePhoneNum={this.changePhoneNum}
                    returnToHome={this.returnToHome}
                    withdrawalText={this.state.withdrawalText}
                    withdrawalModal={this.state.withdrawalModal}
                    processWithdrawal={this.processWithdrawal}
                    toggle={this.toggle}
                    onEnterPressed={this.onEnterPressed}
                    isConfirmLoading={this.state.isConfirmLoading}
                />  
            </Fragment>
        )
    }
}