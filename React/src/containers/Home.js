import React, { Component } from "react";
import "./style2.css";

//테스트 페이지입니다. 나중에 메인 페이지 만들면 교체해주세요.
export default class Home extends Component {
  state = {
    profile: []
  };

  componentDidMount() {

    fetch('http://localhost/api/user', {
      method: "GET",
      credentials: 'include',
    })
    .then(res => res.json())
    .then(content => {
      console.log('json test.');
      console.log(content);
      this.setState({
        profile: content
      });
    })
    .catch(error => alert(error));
}

  render() {
    console.log("render test.");
    console.log(this.props);
    return (
      <div className="Home">
        { this.state && this.state.profile['username'] && //이 방법을 통해 서버에서 정보를 가져오기 전에 렌더링 되는 것을 막을 수 있다.
          <h3>안녕하세요, {this.state.profile['nickname']}님.</h3>
        }
        <div className="lander">
        </div>
      </div>
    );
  }
}
