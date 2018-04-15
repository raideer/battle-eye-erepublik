import React from 'react';
import { getPerc } from '../../Utils';
import { truncate } from 'lodash';
import Flag from '../Flag';

export default class Table extends React.Component {
    renderHeader(side) {
        if (side == 'left') {
            return (
                <div className="columns country-row has-text-right">
                    <div className="column">Damage</div>
                    <div className="column" style={{ padding: '0 5px' }}>Country</div>
                </div>
            );
        }

        return (
            <div className="columns country-row has-text-left">
                <div className="column" style={{ padding: '0 5px' }}>Country</div>
                <div className="column">Damage</div>
            </div>
        );
    }
    render() {
        const { countries, side } = this.props;
        const totalDamage = Object.keys(countries).reduce((total, name) => {
            total += countries[name].damage;
            return total;
        }, 0);

        return (
            <div>
                { this.renderHeader(side) }
                { Object.keys(countries).map((name, i) => {
                    const country = countries[name];
                    if (side == 'left') {
                        return (
                            <div key={i} className="columns country-row has-text-right">
                                <div className="column tags has-addons is-two-thirds">
                                    <span className="tag is-white">
                                        {country.kills} kills
                                    </span>
                                    <span className="tag is-white">
                                        {getPerc(country.damage, totalDamage)}%
                                    </span>
                                    <span className="tag is-dark">
                                        { country.damage.toLocaleString() } dmg
                                    </span>
                                </div>
                                <div className="column">
                                    { truncate(name, {
                                        length: 14
                                    }) }
                                    <Flag country={ name } />
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={i} className="columns country-row has-text-left">
                                <div className="column">
                                    <Flag country={ name } />
                                    { truncate(name, {
                                        length: 14
                                    }) }
                                </div>
                                <div className="column tags has-addons is-two-thirds">
                                    <span className="tag is-dark">
                                        { country.damage.toLocaleString() } dmg
                                    </span>
                                    <span className="tag is-white">
                                        {getPerc(country.damage, totalDamage)}%
                                    </span>
                                    <span className="tag is-white">
                                        {country.kills} kills
                                    </span>
                                </div>
                            </div>
                        );
                    }
                }) }
            </div>
        );
    }
}
