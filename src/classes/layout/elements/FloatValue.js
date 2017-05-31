import React from 'react';

export default class FloatValue extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            text: ""
        };
    }

    render(){
        return (
            <span className={"bel-value " + ((this.props.a > this.props.b && this.props.highlight)?((this.props.green === true)?"bel-value-hl-w":"bel-value-hl-l"):"")}>{parseFloat(this.props.a).toLocaleString()} {this.state.text}</span>
        );
    }
}
