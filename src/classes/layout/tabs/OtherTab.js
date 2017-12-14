import React from 'react';
import utils from '../../Utils';

export default class OtherTab extends React.Component {
    constructor() {
        super();
        this.state = {
            totalUsers: 'loading'
        };
    }

    async getUserCount() {
        const d = new Date();
        d.setDate(d.getDate() - 1);

        const users = await $j.ajax({
            type: 'GET',
            url: `${window.BattleEye.apiURL}/users/${utils.formatDate(d)}`
        });

        this.state.totalUsers = users;
    }

    componentDidMount() {
        this.getUserCount();
    }

    render() {
        if (this.props.tab != 'other') {
            return null;
        }

        const data = this.props.data;

        return (
            <div className="bel-other">
                <div className="bel-other__field">
                    <div className="bel-other__stat">Active BattleEye users (today)</div>
                    <div className="bel-other__value">{ this.state.totalUsers }</div>
                </div>
                <div className="bel-other__field">
                    <div className="bel-other__stat">Total damage</div>
                    <div className="bel-other__value">{ utils.number(data.left.damage + data.right.damage, true) }</div>
                </div>
                <div className="bel-other__field">
                    <div className="bel-other__stat">Total kills</div>
                    <div className="bel-other__value">{ utils.number(data.left.hits + data.right.hits, true) }</div>
                </div>
                <div className="bel-other__field">
                    <div className="bel-other__stat">Countries fighting for { BattleEye.teamAName } (this round)</div>
                    <div className="bel-other__value">{ utils.number(data.left.countriesCount, true) }</div>
                </div>
                <div className="bel-other__field">
                    <div className="bel-other__stat">Countries this round fighting for { BattleEye.teamBName } (this round)</div>
                    <div className="bel-other__value">{ utils.number(data.right.countriesCount, true) }</div>
                </div>
            </div>
        );
    }
}
