import React, { userState, Fragment } from 'react';
import './ProfileContent.css';
import { Input,
         InputGroup,
         InputGroupAddon,
         Button,
         Form,
         FormGroup,
         ListGroup,
         ListGroupItem,
         Label,
         Modal,
         ModalBody,
         ModalHeader,
         ModalFooter,
} from 'reactstrap';

const ProfileContentForm=({username, nickname, email, phone_num, social, newPassword, value, valChange,
                           isValueConfirmed, isSocialAccount, checkConfirmValue, changeNickname, changePhoneNum,
                           changePassword, returnToHome, withdrawalModal, withdrawalText, processWithdrawal, toggle})=>{
    console.log("social : ", social, typeof(social)); 
    //value의 값은 일반 계정의 경우 password, 소셜 계정의 경우 email
    let target=isSocialAccount ? 'email' : 'password';
    /*console.log("value : ", value, ' valChange : ', valChange, 'isValueConfirmed : ', isValueConfirmed,
                'isSocialAccount : ', isSocialAccount, ', checkConfirmValue : ', checkConfirmValue);*/

    return(
        <Fragment>
            {/*회원 탈퇴 modal*/}
            <Modal isOpen={withdrawalModal} toggle={toggle} size='lg'>
                <ModalHeader toggle={toggle}><div className='modal-head'>회원탈퇴</div></ModalHeader>
                <ModalBody>
                    <h5>정말로 탈퇴하시겠습니까? 탈퇴하시려면 '지금탈퇴'를 입력해주세요.</h5>
                    <InputGroup>
                        <Input 
                            type='text' 
                            name="withdrawalText"
                            id='withdrawalText'
                            value={withdrawalText} 
                            onChange={valChange}/>
                            <InputGroupAddon addonType='append'>
                                <Button 
                                    outline 
                                    className="profile-button"
                                    onClick={processWithdrawal}
                                >
                                입력
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                </ModalBody>
                <ModalFooter>
                <Button outline color="primary" onClick={toggle} className="close-button">닫기</Button>
                </ModalFooter>
            </Modal>

            {/*profile*/}
            {isValueConfirmed ? 
                    username && nickname &&
                        <div className='wrapper fadeInDown profile-board info'>
                            <div className='profile-headText'>프로필</div>
                            <hr className='profile-board-hr'></hr>
                            <div className='info-list'>
                                <FormGroup>
                                    <Label for="exampleEmail">아이디</Label>
                                    <Input type='text' name="email" disabled={true} placeholder={username} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleEmail">이메일 주소</Label>
                                    <Input type='text' name="email" disabled={true} placeholder={email} />
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleEmail">닉네임</Label>
                                    <InputGroup>
                                        <Input 
                                            type='text' 
                                            name="nickname"
                                            id='nickname'
                                            value={nickname} 
                                            onChange={valChange}/>
                                            <InputGroupAddon addonType='append'>
                                                <Button 
                                                    outline 
                                                    className="profile-button"
                                                    onClick={changeNickname}
                                                    >
                                                    수정
                                                </Button>
                                            </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleEmail">전화번호</Label>
                                    <InputGroup>
                                        <Input type='text' name="phone_num" id='phone_num' value={phone_num} onChange={valChange}/>
                                            <InputGroupAddon addonType='append'>
                                                <Button 
                                                    outline 
                                                    className="profile-button"
                                                    onClick={changePhoneNum}
                                                    >
                                                    수정
                                                </Button>
                                            </InputGroupAddon>
                                    </InputGroup>
                                </FormGroup>
                                <FormGroup>
                                    <Label for="exampleEmail">소설 연동 여부</Label>
                                    <Input type='text' name="social" disabled={true} placeholder={social=="" ? 'no' : {social}} />
                                </FormGroup>
                                {!isSocialAccount && 
                                    <FormGroup>
                                        <Label for="exampleEmail">새 비밀번호</Label>
                                        <InputGroup>
                                        <Input 
                                            type='password' 
                                            name="nickname"
                                            id='newPassword'
                                            value={newPassword} 
                                            onChange={valChange}/>
                                            <InputGroupAddon addonType='append'>
                                                <Button 
                                                    outline 
                                                    className="profile-button"
                                                    onClick={changePassword}
                                                    >
                                                    수정
                                                </Button>
                                            </InputGroupAddon>
                                    </InputGroup>
                                    </FormGroup>
                                }
                                <div className='profile-bottom-button'>
                                    <Button color='danger' className='profile-return-button' onClick={toggle}>회원탈퇴</Button>
                                    <Button className='profile-return-button' onClick={returnToHome}>돌아가기</Button>
                                </div>
                            </div>
                        </div>
                    :
                    <div className='wrapper fadeInDown profile-board confirm-password'>
                        <div className='profile-confirm-headText'>
                            사용자 확인을 위해 {isSocialAccount? "소셜 계정 이메일 주소" : "비밀번호"}를 입력해주세요.
                        </div>
                        <div  className='profile-confirm-password'>
                            <InputGroup>
                                <Input 
                                    id={target}
                                    type={target}
                                    size='lg' 
                                    value={value}
                                    onChange={valChange}/>
                                    <InputGroupAddon addonType='append'>
                                        <Button 
                                            outline 
                                            className="profile-button"
                                            onClick={checkConfirmValue}
                                            >
                                            확인
                                        </Button>
                                    </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>
                    
                    
            }
        </Fragment>          
    )  
}

export default ProfileContentForm;