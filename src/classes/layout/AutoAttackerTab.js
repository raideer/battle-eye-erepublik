import React from 'react';
import $ from 'jQuery';
import { arrayReverse, isAir } from '../Utils';
import BulmaButton from './BulmaButton';

export default class AutoAttackerTab extends React.Component {
    constructor() {
        super();

        this.progressDefaultMessage = 'Waiting for AA to start...';

        this.state = {
            enabled: false,
            allIn: false,
            eatEB: false,
            stopCO: false,
            stopEpic: false,
            kills: 25,
            minHp: 50,
            maxDomination: 100,
            damagePadding: 0,
            stopWeapons: !isAir,
            damage: 0,
            dontEatLevelup: true,
            progressMessage: this.progressDefaultMessage,
            feed: [],
            showKills: true,
            beDomination: true
        };
    }

    componentDidMount() {
        $('.aa-tooltip').tipsy();

        window.BattleEye.autoattacker.state.showKills = window.BattleEyeStorage.get('showAutoattackerKills');
        window.BattleEye.autoattacker.state.beDomination = window.BattleEyeStorage.get('autoattackerBEDomination');
        this.setState(window.BattleEye.autoattacker.state);

        window.BattleEye.events.on('autoattacker.progress', data => {
            let attackModeMessage = '';
            let attackStatus = '';
            switch (data.attackMode) {
            case 'damage':
                attackModeMessage = 'Target damage';
                attackStatus = `Damage left: ${data.damageLeft.toLocaleString()}`;
                break;
            case 'kills':
                attackModeMessage = 'Kill amount';
                attackStatus = `Kills left: ${data.killsLeft}`;
                break;
            case 'padding':
                attackModeMessage = 'Damage padding';
                attackStatus = `Damage left: ${data.paddingDiff.toLocaleString()}`;
                break;
            case 'allin':
                attackModeMessage = 'All in';
                attackStatus = 'Attacking till max domination is reached';
                break;
            default:
                attackStatus = 'Task done!';
            }

            this.setState({
                enabled: data.enabled,
                progressMessage: [
                    <div key="1">Attack mode: <b>{attackModeMessage}</b></div>,
                    <div key="2">{attackStatus}</div>
                ]
            });
        });
    }

    componentWillUnmount() {
        window.BattleEye.events.remove('autoattacker.progress');
    }

    componentWillUpdate() {
        window.BattleEye.autoattacker.state = this.state;
    }

    toggleOption(key) {
        const newState = {};
        newState[key] = !this.state[key];
        this.setState(newState);
    }

    toggleEnable() {
        this.setState({ enabled: window.BattleEye.autoattacker.toggleEnabled(this.state) });
    }

    renderButton(id, text) {
        return (
            <BulmaButton
                buttonClass={`aa-button aa-fixed-height ${this.state[id] ? 'is-success' : ''}`}
                onClick={this.toggleOption.bind(this, id)}
                text={text}
                icon={this.state[id] ? 'fas fa-check' : 'fas fa-times'}
            />
        );
    }

    renderInput(id, text, placeholder, disabled = false, append = null) {
        return (
            <div className="field has-addons">
                { disabled ? <div className="aa-disabled"><i className="fas fa-ban"></i><span>Inactive</span></div> : ''}
                <p className="control" style={{ width: '60%' }}>
                    <a className="button is-static is-small aa-fixed-height" style={{ color: '#363636', width: '100%' }}>
                        { text }
                    </a>
                </p>
                <p className="control" style={{ width: '40%' }}>
                    <input onChange={this.handleOnChange.bind(this, id)} disabled={disabled} value={this.state[id]} className="input is-small aa-input aa-fixed-height" type="text" placeholder={placeholder} />
                </p>
                {append}
            </div>
        );
    }

    handleOnChange(id, e) {
        switch (id) {
        case 'damagePadding':
        case 'damage':
        case 'kills': {
            let value = parseInt(e.target.value) || 0;
            if (value < 0) {
                value = 0;
            }

            this.setState({
                [id]: value
            });

            break;
        }
        case 'minHp': {
            let value = parseInt(e.target.value) || 0;
            if (value < 0) {
                value = 0;
            } else if (value > window.reset_health_to_recover) {
                value = window.reset_health_to_recover;
            }

            this.setState({
                [id]: value
            });
            break;
        }
        case 'maxDomination': {
            let value = parseInt(e.target.value) || 0;
            if (value < 0) {
                value = 0;
            } else if (value > 100) {
                value = 100;
            }

            this.setState({
                [id]: value
            });
            break;
        }
        default: {
            this.setState({
                [id]: e.target.value
            });
        }
        }
    }

    handleCheckbox(field, setting, e) {
        this.setState({
            [field]: e.target.checked
        }, () => {
            window.BattleEyeStorage.set(setting, this.state[field]);
        });
    }

    render() {
        return (
            <div className="columns be-autoattacker">
                <div className="column">
                    {this.renderButton('allIn', <span>Go <b>ALL IN</b></span>)}
                    {this.renderButton('eatEB', <span>Eat <b>Energy bars</b></span>)}
                    {this.renderButton('stopCO', <span>Stop if <b>CO</b> inactive</span>)}
                    {this.renderButton('stopEpic', <span>Stop if <b>EPIC</b> has ended</span>)}
                    {this.renderButton('stopWeapons', <span>Stop if out of weapons</span>)}
                    {/* {this.renderButton('dontEatLevelup', <span>Don't recover if close to level up</span>)} */}
                </div>
                <div className="column">
                    {
                        this.renderInput(
                            'kills',
                            'Kills',
                            'Kills to do',
                            this.state.allIn || this.state.damage > 0 || this.state.damagePadding > 0
                        )
                    }
                    {
                        this.renderInput('damage', 'Target damage', 'Target damage (million)', this.state.allIn || this.state.damagePadding > 0, <p className="control">
                            <a className="button is-static is-small aa-fixed-height">
                                {isAir ? 'k' : 'm'}
                            </a>
                        </p>)
                    }
                    <div className="aa-tooltip" original-title="Auto attacker will eat only when your HP drops below this number">
                        {this.renderInput('minHp', <span>Min <b>HP</b></span>, 'Minimum health to fight')}
                    </div>
                    <div className="aa-tooltip" original-title="Auto attacker will fight only when domination drops below this number">
                        {
                            this.renderInput('maxDomination', <span>Max <b>Domination %</b></span>, '0% - 100%', this.state.damagePadding > 0, <p className="control">
                                <a className="button is-static is-small aa-fixed-height">
                                    %
                                </a>
                            </p>)
                        }
                    </div>
                    {/* <div className="aa-tooltip" original-title="Set the damage difference you want to keep from the second place. This helps prevent BH steals">
                        {
                            this.renderInput('damagePadding', <span>Damage <b>padding</b></span>, '', this.state.allIn, <p className="control">
                                <a className="button is-static is-small aa-fixed-height">
                                    {isAir ? 'k' : 'm'}
                                </a>
                            </p>)
                        }
                    </div> */}
                    <label className="aa-checkbox aa-tooltip" original-title="Max Domination setting will use realtime data from BattleEye instead of waiting for battle to update">
                        <input onChange={this.handleCheckbox.bind(this, 'beDomination', 'autoattackerBEDomination')} checked={this.state.beDomination} type="checkbox" />
                        Use realtime domination
                    </label>
                </div>
                <div className="column">
                    <ul className="aa-feed">
                        <li>Feed</li>
                        {
                            arrayReverse(this.state.feed).map((value, i) => {
                                return (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: value }}></li>
                                );
                            })
                        }
                    </ul>
                    <label className="aa-checkbox">
                        <input onChange={this.handleCheckbox.bind(this, 'showKills', 'showAutoattackerKills')} checked={this.state.showKills} type="checkbox" />
                        Show kills
                    </label>
                </div>
                <div className="column">
                    <BulmaButton
                        buttonClass={`aa-button aa-fixed-height ${this.state.enabled ? 'is-primary' : ''}`}
                        onClick={this.toggleEnable.bind(this)}
                        text={this.state.enabled ? 'Stop auto attacker' : 'Start auto attacker'}
                        icon={this.state.enabled ? 'fas fa-toggle-on' : 'fas fa-toggle-off'}
                    />
                    <div>{ this.state.progressMessage }</div>
                </div>
            </div>
        );
    }
}
