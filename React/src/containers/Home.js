import React, { Component } from "react";
import TodoList from "../components/todos/TodoList";
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

    // todo api를 요청하기 위해 현재 access 토큰을 보내 타당한지 확인하고, 타탕하다면 해당 리소스 접근
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
        <h3>Hi, {this.state.profile['username']}</h3>
        <div className="lander">
          <hr/>
          <TodoList
            data={this.state.profile}
          />
        </div>
      </div>
    );
  }
}
