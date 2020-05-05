import React from 'react';

const MailAuthForm=({username, email, resendAuthEmail}) => {
    return(
        <div>
            <h2>
                {username}님, 입력하신 이메일 주소 {email}을 통해 인증을 진행해주세요.
            </h2>
            <button onClick={resendAuthEmail}>메일 재발송</button>
        </div>
    );
}

export default MailAuthForm;