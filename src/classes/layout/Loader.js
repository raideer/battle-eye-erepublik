import React from 'react';
import $ from 'jQuery';

export default class Loader extends React.Component {
    componentDidMount() {
        $('.spinner').tipsy();
    }

    componentWillUnmount() {
        $('.tipsy').remove();
    }

    render() {
        return (
            <div className="spinner" original-title={this.props.title || 'Loading...'}>
                <div className="rect1"></div>
                <div className="rect2"></div>
                <div className="rect3"></div>
                <div className="rect4"></div>
                <div className="rect5"></div>
            </div>
        );
    }
}
