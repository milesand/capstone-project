import React, { Component, Fragment } from "react";
import LoginForm from "../components/LoginComponents/LoginForm";

//썸네일 테스트
export default class ThumbTest extends Component { //export default : 다른 모듈에서 이 모듈을 import할 때 내보낼 대표 값
  constructor(props) {
    super(props);
    console.log('login props : ', props);
    this.state = {
      url:""
    };

    fetch('http://localhost/api/thumb2', {
        method:"GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    .then(res=>res.json())
    .then(content=>{
        console.log(content)
        this.setState({
            url: content['url']
        })
        console.log(this.state)
    })
  }

  render() {
    return (
      
      <Fragment>
          {this.state && this.state.url!=""&&
                <img src={this.state.url} alt='new'></img>
          }
      </Fragment>
    );
  }
}
