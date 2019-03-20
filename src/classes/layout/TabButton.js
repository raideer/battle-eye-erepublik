import React from 'react';

export default class TabButton extends React.Component {
    render() {
        const { name, click, activeTab, className, activeClass, inactiveClass } = this.props;
        const cn = activeClass ? activeClass : 'is-active';
        const icn = inactiveClass ? inactiveClass : '';
        return (
            <button
                onClick={click}
                className={`be__button ${activeTab == name ? cn : icn} ${className ? className : ''}`}>
                { this.props.children }
            </button>
        );
    }
}
