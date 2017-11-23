import React from 'react';

export default class If extends React.Component {
    render() {
        if (this.props.test) {
            return (
                <span>{this.props.children}</span>
            );
        }

        return null;
    }
}
