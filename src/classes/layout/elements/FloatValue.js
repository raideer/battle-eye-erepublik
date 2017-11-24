import React from 'react';

export default class FloatValue extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            text: ''
        };
    }

    render() {
        let className = '';
        if (this.props.a > this.props.b) {
            className = this.props.green ? 'bel-value-hl-w' : 'bel-value-hl-l';
        }

        return (
            <span className={`bel-value ${className}`}>
                {parseFloat(this.props.a).toLocaleString()} {this.state.text}
            </span>
        );
    }
}
