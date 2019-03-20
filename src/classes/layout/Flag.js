import React from 'react';
import { findCountry } from '../Utils';

export default class Flag extends React.Component {
    getFlagStyle(c) {
        return {
            backgroundImage: `url('https://cdn.jsdelivr.net/gh/hjnilsson/country-flags/png100px/${c}.png')`,
            // backgroundImage: `url('/images/flags_png/L/${c}.png')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            // backgroundPosition: '-2px -6px',
            width: '27px',
            height: '20px',
            marginLeft: '5px',
            marginRight: '5px',
            borderRadius: '5px',
            display: 'inline-block'
        };
    }

    render() {
        const c = findCountry('permalink', this.props.country);
        if (!c) return null;
        return (
            <div style={this.getFlagStyle(String(c.code).toLowerCase())}></div>
        );
    }
}
