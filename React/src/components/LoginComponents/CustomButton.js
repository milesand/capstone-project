import React, {Component} from 'react';
import './style2.css';
import {Col, Row} from 'react-bootstrap';
import { Link } from "react-router-dom";

class CustomButton extends Component{
    constructor(props){
        super(props);
        console.log('button props : ', props);
        this.state={
            isLoading: this.props.isLoading
        };
        console.log('onClick : ', this.props.onClick);
        console.log("isLoading state : ", this.state.isLoading);
    }

   render(){
        return(
            <button type={this.props.type}
                    id = {this.props.id}
                    className={this.props.className + (this.state.isLoading ? ' button is-loading':'')}
                    onClick={this.props.onClick}
            >
            {this.props.value}</button>
        );
    }
}

export default CustomButton;