import React from 'react';
import TabButton from './TabButton';
import { number, range, getClassName } from '../Utils';
import { connect } from 'react-redux';
import Loader from './Loader';

class FirstKillsTab extends React.Component {
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

    render() {
        if (!this.props.firstKills) return <Loader />;
        if (!this.props.firstKills[this.state.activeTab]) {
            window.BattleEye.loadFirstKills(this.state.activeTab);
        }

        const firstKills = this.props.firstKills[this.state.activeTab];

        return (
            <div className="battleeye__countries">
                <div className="be__filters">
                    <div className="be__level">
                        <div className="be__button-group">
                            { range(1, SERVER_DATA.zoneId + 1).map(round => {
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
                <div className="be__panel-header">
                    First kills for Round { this.state.activeTab }
                </div>
                {
                    !firstKills && <Loader />
                }
                {
                    firstKills && Object.keys(firstKills).length === 0 && <div>Failed to load or no data!</div>
                }
                {
                    firstKills && Object.keys(firstKills).length > 0 && <div className="be__columns">
                        <div className="be__column is-half">
                            <table className="table first-kills" style={{ borderRight: '1px solid #20253e' }}>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Time</th>
                                        <th>Player</th>
                                        <th>Damage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { firstKills[SERVER_DATA.leftBattleId] && Object.keys(firstKills[SERVER_DATA.leftBattleId]).map(div => {
                                        if (this.state.activeTab % 4 === 0) {
                                            if (div != 11) return null;
                                        } else if (div == 11) {
                                            return null;
                                        }
                                        const kills = firstKills[SERVER_DATA.leftBattleId][div];
                                        const rows = [<tr key={-1} className="first-kills__div"><td colSpan="4">Division {div}</td></tr>];
                                        if (kills.length > 0) {
                                            rows.push(...kills.map((kill, i) => {
                                                const time = kill.time.length > 10 ? Math.round(Number(kill.time) / 1000) : Number(kill.time);
                                                let diff = time - Number(kill.startTime);
                                                if (diff < 0) {
                                                    diff = 0;
                                                }

                                                return (
                                                    <tr key={i} className={getClassName({ 'first-kills--first': i === 0 })}>
                                                        <th>{ i + 1 }</th>
                                                        <td title="Seconds after round start">+{number(diff, true)}</td>
                                                        <td><a href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/${kill.citizenId}`}>{kill.name}</a></td>
                                                        <td>{number(kill.damage, true)}</td>
                                                    </tr>
                                                );
                                            }));
                                        } else {
                                            rows.push(<tr key={-2}><td colSpan="4">Nothing found</td></tr>);
                                        }

                                        return rows;
                                    }) }
                                </tbody>
                            </table>
                        </div>
                        <div className="be__column is-half">
                            <table className="table first-kills" style={{ borderLeft: '1px solid #20253e' }}>
                                <thead>
                                    <tr>
                                        <th>Damage</th>
                                        <th>Player</th>
                                        <th>Time</th>
                                        <th>#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { firstKills[SERVER_DATA.rightBattleId] && Object.keys(firstKills[SERVER_DATA.rightBattleId]).map(div => {
                                        if (this.state.activeTab % 4 === 0) {
                                            if (div != 11) return null;
                                        } else if (div == 11) {
                                            return null;
                                        }

                                        const kills = firstKills[SERVER_DATA.rightBattleId][div];
                                        const rows = [<tr key={-1} className="first-kills__div"><td colSpan="4">Division {div}</td></tr>];
                                        if (kills.length > 0) {
                                            rows.push(...kills.map((kill, i) => {
                                                const time = kill.time.length > 10 ? Math.round(Number(kill.time) / 1000) : Number(kill.time);
                                                let diff = time - Number(kill.startTime);
                                                if (diff < 0) {
                                                    diff = 0;
                                                }

                                                return (
                                                    <tr key={i} className={getClassName({ 'first-kills--first': i === 0 })}>
                                                        <td>{number(kill.damage, true)}</td>
                                                        <td><a target="_blank" href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/${kill.citizenId}`}>{kill.name}</a></td>
                                                        <td title="Seconds after round start">+{number(diff, true)}</td>
                                                        <th>{ i + 1 }</th>
                                                    </tr>
                                                );
                                            }));
                                        } else {
                                            rows.push(<tr key={-2}><td colSpan="4">Nothing found</td></tr>);
                                        }

                                        return rows;
                                    }) }
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
            </div>
        );
    }
}

function mapState(state) {
    return {
        firstKills: state.main.firstKills
    };
}

// Connect them:
export default connect(mapState)(FirstKillsTab);
