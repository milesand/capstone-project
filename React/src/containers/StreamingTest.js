import React, { Component, Fragment, forwardRef } from "react";
import ReactPlayer from 'react-player';
import './Home.css';
//동영상 스트리밍 테스트
export default class StreamingTest extends Component {
  constructor(props) {
    super(props);
    this.state = {
        url:`https://${window.location.hostname}/api/preview/${this.props.fileID}`,
        isShow: false,
        percent: 0,
    };
    console.log("스트리밍 테스트, props : ", this.props, "url : ", this.state.url);
  }

  toggleIsShow=()=>{
    this.setState({
      isShow: !this.state.isShow
    });
  }

  handleOnProgress=(e)=>{
    this.setState({
      percent: e.played*100
    });
  }
  render() {
    return (
      <Fragment>
        <h1>스트리밍 테스트</h1>
        <ReactPlayer url={this.state.url}
                     controls={true}
                     playing={this.state.isShow} />
      </Fragment>
    );
  }
}
