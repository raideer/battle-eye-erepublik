import React from 'react';

export default class TextValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            green: false
        };
    }

    render() {
        return (
            <span className="bel-value">{this.props.a} {this.state.text}</span>
        );
    }
}
