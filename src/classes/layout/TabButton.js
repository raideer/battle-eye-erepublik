import React from 'react';

export default class TabButton extends React.Component {
    render() {
        const { name, click, activeTab, className, activeClass } = this.props;
        const cn = activeClass ? activeClass : 'is-active';
        return (
            <button
                onClick={click}
                className={`button is-small ${activeTab == name ? cn : ''} ${className ? className : ''}`}>
                { this.props.children }
            </button>
        );
    }
}