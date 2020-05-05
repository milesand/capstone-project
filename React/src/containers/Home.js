import React, { Component } from "react";
import "./style2.css";


export default class Home extends Component {
  state = {
    profile: []
  };

  componentDidMount() {
    let handleErrors = response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      return response;
    }

    // 타당성 확인은 서버측에서 담당
    fetch('http://localhost/api/user', {
      method: "GET",
      credentials: 'include',
    })
    .then(handleErrors)
    .then(res => res.json())
    .then(json => {
      console.log('json test.');
      console.log(json);
      this.setState({
        profile: json
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
          <h3>Hi, {this.state.profile['username']}</h3>
        }
        <div className="lander">
        </div>
      </div>
    );
  }
}
