import React from 'react';
import TabButton from './TabButton';
import { number } from '../Utils';

export default class FirstKillsTab extends React.Component {
    constructor() {
        super();

        this.state = {
            activeTab: SERVER_DATA.zoneId
        };
    }

    setRound(round) {
        this.setState({
            activeTab: round
        });
    }

    getKills(side) {
        const accPrefill = this.state.activeTab & 4 === 0 ? { 11: [] } : { 1: [], 2: [], 3: [], 4: [] };
        return this.props.firstKills
        .filter(kill => kill.round == this.state.activeTab && kill.side == side)
        .sort((a, b) => {
            return a.division - b.division || a.time - b.time;
        })
        .reduce((acc, kill) => {
            acc[kill.division].push(kill);
            return acc;
        }, accPrefill);
    }

    render() {
        const { firstKills } = this.props;

        const leftKills = this.getKills(SERVER_DATA.leftBattleId);
        const rightKills = this.getKills(SERVER_DATA.rightBattleId);

        return (
            <div className="battleeye__countries">
                <div className="filters">
                    <div className="level">
                        <div className="level-item buttons has-addons">
                            { firstKills.reduce((acc, kill) => {
                                if (acc.indexOf(kill.round) == -1) {
                                    acc.push(kill.round);
                                }

                                return acc;
                            }, []).map(round => {
                                return (
                                    <TabButton
                                        key={round}
                                        name={round}
                                        activeTab={this.state.activeTab}
                                        className={`${this.state.activeTab == round ? '' : 'is-outlined'} is-inverted is-dark`}
                                        click={this.setRound.bind(this, round)}>
                                        {`Round ${round}`}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                </div>
                <div className="panel-header">
                    First kills for round { this.state.activeTab }
                </div>
                <p>
                    Kills are tracked only for the first 30 minutes
                </p>

                <div className="columns">
                    <div className="column is-half">
                        <table className="table is-fullwidth first-kills" style={{ borderRight: '1px solid #20253e' }}>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Time</th>
                                    <th>Player</th>
                                    <th>Damage</th>
                                </tr>
                            </thead>
                            <tbody>
                                { Object.keys(leftKills).map(div => {
                                    const kills = leftKills[div];
                                    const rows = [<tr key={0} className="first-kills__div"><td colSpan="4">Division {div}</td></tr>];
                                    if (kills.length > 0) {
                                        rows.push(...kills.map((kill, i) => {
                                            const time = kill.time.length > 10 ? Math.round(Number(kill.time) / 1000) : Number(kill.time);
                                            let diff = time - Number(kill.startTime);
                                            if (diff < 0) {
                                                diff = 0;
                                            }
                                            return (
                                                <tr key={kill.id}>
                                                    <th>{ i + 1 }</th>
                                                    <td title="Seconds after round start">+{diff}</td>
                                                    <td><a href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/${kill.citizenId}`}>{kill.name}</a></td>
                                                    <td>{number(kill.damage, true)}</td>
                                                </tr>
                                            );
                                        }));
                                    } else {
                                        rows.push(<tr key={1}><td colSpan="4">No data</td></tr>);
                                    }

                                    return rows;
                                }) }
                            </tbody>
                        </table>
                    </div>
                    <div className="column is-half">
                        <table className="table is-fullwidth first-kills" style={{ borderLeft: '1px solid #20253e' }}>
                            <thead>
                                <tr>
                                    <th>Damage</th>
                                    <th>Player</th>
                                    <th>Time</th>
                                    <th>#</th>
                                </tr>
                            </thead>
                            <tbody>
                                { Object.keys(rightKills).map(div => {
                                    const kills = rightKills[div];
                                    const rows = [<tr key={0} className="first-kills__div"><td colSpan="4">Division {div}</td></tr>];
                                    if (kills.length > 0) {
                                        rows.push(...kills.map((kill, i) => {
                                            const time = kill.time.length > 10 ? Math.round(Number(kill.time) / 1000) : Number(kill.time);
                                            let diff = time - Number(kill.startTime);
                                            if (diff < 0) {
                                                diff = 0;
                                            }
                                            return (
                                                <tr key={kill.id}>
                                                    <td>{number(kill.damage, true)}</td>
                                                    <td><a href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/${kill.citizenId}`}>{kill.name}</a></td>
                                                    <td title="Seconds after round start">+{diff}</td>
                                                    <th>{ i + 1 }</th>
                                                </tr>
                                            );
                                        }));
                                    } else {
                                        rows.push(<tr key={1}><td colSpan="4">No data</td></tr>);
                                    }

                                    return rows;
                                }) }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
}
