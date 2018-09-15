import React from 'react';

export default class BulmaButton extends React.Component {
    renderIcon(prop) {
        if (prop) {
            return (
                <span className="icon is-small">
                    <i className={prop}></i>
                </span>
            );
        }

        return null;
    }

    render() {
        const { text } = this.props;
        let { buttonStyle, buttonClass } = this.props;

        buttonStyle = buttonStyle ? buttonStyle : {};
        buttonClass = buttonClass ? buttonClass : '';

        return (
            <div onClick={this.props.onClick} style={buttonStyle} className={`button ${buttonClass}`}>
                { this.renderIcon(this.props.icon) }
                <span>{ text }</span>
                { this.renderIcon(this.props.bottomIcon) }
            </div>
        );
    }
}
