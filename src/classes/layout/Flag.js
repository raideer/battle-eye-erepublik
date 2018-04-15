import React from 'react';

export default class Flag extends React.Component {
    getFlagStyle(c) {
        return {
            backgroundImage: `url('/images/flags_png/L/${c}.png')`,
            backgroundPosition: '-2px -6px',
            width: '27px',
            height: '20px',
            marginBottom: '-5px',
            marginLeft: '5px',
            marginRight: '5px',
            borderRadius: '5px',
            display: 'inline-block'
        };
    }

    render() {
        return (
            <div style={this.getFlagStyle(this.props.country)}></div>
        );
    }
}
