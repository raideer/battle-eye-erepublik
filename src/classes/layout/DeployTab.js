import React from 'react';
import { isAir, getClassName, foodIdToName, number, calculateInfluence, getFirepower, getWeaponBoosterBonus } from '../Utils';
import { connect } from 'react-redux';
import Loader from './Loader';

class DeployTab extends React.Component {
    constructor() {
        super();

        this._inputInterval = null;
        this.minHp = 40;
        this.state = {
            inputVal: this.minHp,
            sliderVal: this.minHp,
            foodBarVal: 0,
            energyBarVal: 0
        };
    }

    componentDidMount() {
        window.BattleEye.deployer.loadBattleInventory().then(() => {
            this.setFood(this.minHp);
        });
    }

    getPredictedDamage() {
        if (!this.props.hovercard) return 0;

        const hc = this.props.hovercard;

        let str = 0;
        let rank = 0;
        const bonus = getWeaponBoosterBonus();

        if (isAir) {
            str = hc.fighterInfo.aviation.perception;
            rank = hc.fighterInfo.aviation.rank;
        } else {
            str = hc.fighterInfo.military.strength;
            rank = hc.fighterInfo.military.rank;
        }

        const hitInfluence = calculateInfluence(
            str,
            rank,
            getFirepower(this.props.activeWeapon)
        );

        return {
            damage: number(
                Math.floor(
                    (hitInfluence + (hitInfluence * bonus / 100)) * Math.floor(this.state.inputVal / 10)
                ), true
            ),
            bonus
        };
    }

    renderWeapons() {
        if (!this.props.inventory) {
            return <Loader />;
        }

        const ammo = this.props.inventory.ammo.slice(0);

        ammo.unshift({
            amount: '∞',
            qualityId: -1
        });

        return ammo.map((item, i) => {
            if (item.industryId == 2 && isAir) return null;
            let firepower = null;

            if (item.attributes) {
                item.attributes.forEach(a => {
                    if (a.type == 'firepower') {
                        firepower = a.value;
                    }
                });
            }

            const img = `/images/modules/battle/q${item.qualityId > 0 ? item.qualityId : 1}.png`;
            return (
                <div
                    onClick={() => this.props.setWeapon(item.qualityId)}
                    key={i}
                    className={getClassName({
                        'be-deploy__weapons-item': true,
                        'be-deploy__weapons-item--active': item.qualityId == this.props.activeWeapon
                    })}>
                    <img src={img} alt="Q0"/>
                    <div className="be-deploy__weapons-item-quality">Q{item.qualityId}</div>
                    { firepower ? <div className="be-deploy__weapons-item-damage">{firepower}</div> : ''}
                    <div className="be-deploy__weapons-item-amount">{item.amount}</div>
                </div>
            );
        });
    }

    setFood(inputVal) {
        if (!this.props.inventory || !this.props.energyInfo) return;

        let val = parseInt(inputVal) || 0;

        if (val > this.props.energyInfo.maxUsableEnergy) {
            val = this.props.energyInfo.maxUsableEnergy;
        } else if (val < this.minHp) {
            val = this.minHp;
        }

        this.props.updateEnergyUsage(val);

        const roundedVal = Math.floor(val / 10) * 10;

        this.setState({
            sliderVal: roundedVal,
            inputVal: roundedVal
        });
    }

    deploy() {
        if (this.props.deployActive) {
            window.BattleEye.deployer.cancelDeploy();
        } else {
            window.BattleEye.deployer.deploy(
                this.state.sliderVal
            );
        }
    }

    renderDeployStats() {
        if (!this.props.showStats || !this.props.stats) return null;

        return (
            <div className="be-deploy__stats">
                <div className="be-deploy__title">
                    Deploy Stats
                </div>
                <button onClick={() => this.props.closeStats()} className="be-deploy__stats-close"><i className="fas fa-times"></i></button>

                <div className="be__columns" style={{ width: '600px', height: '70px', margin: '0 auto' }}>
                    <div className="be__column has-text-left division__stats">
                        <div className="stats-field">
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>{ number(this.props.stats.damage, true) }</span>
                            <span style={{ width: '30%', textAlign: 'center' }}>Damage</span>
                        </div>
                        <div className="stats-field">
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>{ number(this.props.stats.kills, true) }</span>
                            <span style={{ width: '30%', textAlign: 'center' }}>Kills</span>
                        </div>
                        <div className="stats-field">
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>{ number(this.props.stats.hits, true) }</span>
                            <span style={{ width: '30%', textAlign: 'center' }}>Hits</span>
                        </div>
                    </div>
                    <div className="be__column has-text-right division__stats">
                        <div className="stats-field">
                            <span style={{ width: '30%', textAlign: 'center' }}>Rank points</span>
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>+{ number(Math.round(this.props.stats.damage / 1000), true) }</span>
                        </div>
                        <div className="stats-field">
                            <span style={{ width: '30%', textAlign: 'center' }}>Prestige Points</span>
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>+{ number(this.props.stats.pp, true) }</span>
                        </div>
                        <div className="stats-field">
                            <span style={{ width: '30%', textAlign: 'center' }}>CO CC earned</span>
                            <span style={{ width: '35%' }} className='tag is-small is-dark'>+{ number(this.props.stats.cc, true) }</span>
                        </div>
                    </div>
                </div>
                {
                    this.props.stats.units_consumed && Object.keys(this.props.stats.units_consumed).length > 0
                    && <div className="be__columns">
                        <div className="be__column is-full has-text-centered">Consumed: {
                            Object.keys(this.props.stats.units_consumed).map(q => {
                                return `${foodIdToName(q)} x${this.props.stats.units_consumed[q]}`;
                            }).join(', ')
                        }</div>
                    </div>
                }
            </div>
        );
    }

    render() {
        if (!this.props.energyInfo || !this.props.energyUsage) return <Loader />;
        function numCap(num, cap, max) {
            let capped = 0;

            if (num > 0) {
                if (num > cap) {
                    capped = cap;
                } else {
                    capped = num;
                }
            }

            return capped * 100 / max;
        }

        const roundedVal = Math.floor(this.state.sliderVal / 10) * 10;

        const energySlider = numCap(
            roundedVal,
            this.props.energyInfo.pool,
            this.props.energyInfo.maxUsableEnergy
        );

        const foodSlider = numCap(
            roundedVal - this.props.energyInfo.pool,
            this.props.energyInfo.recoverable,
            this.props.energyInfo.maxUsableEnergy
        );

        const energybarSlider = numCap(
            roundedVal - this.props.energyInfo.pool - this.props.energyInfo.recoverable,
            this.props.energyInfo.maxEbEnergy,
            this.props.energyInfo.maxUsableEnergy
        );

        const predictedDamage = this.getPredictedDamage();

        return (
            <div className="be-deploy">
                {this.renderDeployStats()}
                <div className="be-deploy__weapon-select">
                    <div className="be-deploy__title">
                        Select your weapon
                    </div>
                    <div className="be-deploy__weapons">
                        {this.renderWeapons()}
                    </div>
                </div>
                <div className="be-deploy__food-select">
                    <div className="be-deploy__title">
                        Select the amount of energy to use
                    </div>
                    <div className="be-deploy__food">
                        <input
                            onChange={e => {
                                const inputVal = e.target.value;
                                this.setFood(inputVal);
                            }}
                            className="be-deploy__food-slider"
                            type="range"
                            min={this.props.sliderMin}
                            max={this.props.sliderMax}
                            value={this.state.sliderVal}
                        />
                        <div className="be-deploy__food-slider-bg">
                            <div style={{ width: `${energySlider}%` }} className="be-deploy__food-slider-energy"></div>
                            <div style={{ width: `${foodSlider}%` }} className="be-deploy__food-slider-food"></div>
                            <div style={{ width: `${energybarSlider}%` }} className="be-deploy__food-slider-special"></div>
                        </div>
                    </div>

                    <div className="be-deploy__food-select-amount">
                        <input onChange={e => {
                            clearInterval(this._inputInterval);
                            const inputVal = e.target.value;
                            this.setState({ inputVal });
                            this._inputInterval = setTimeout(() => {
                                this.setFood(inputVal);
                            }, 500);
                        }} value={this.state.inputVal} type="text"/>
                        <button className="be-deploy__food-select-addbtn" onClick={() => this.setFood(this.state.inputVal + 10)}>+10</button>
                        <button className="be-deploy__food-select-subbtn" onClick={() => this.setFood(this.state.inputVal - 10)}>-10</button>
                        <button className="be-deploy__food-select-poolbtn" onClick={() => this.setFood(this.props.energyInfo.pool + this.props.energyInfo.recoverable)}>POOL</button>
                        <button className="be-deploy__food-select-maxbtn" onClick={() => this.setFood(this.props.energyInfo.maxUsableEnergy)}>MAX</button>
                        <span>Energy</span>
                        <div>{this.props.energyUsage.map(source => {
                            return `${source.amount} ${!source.tier ? 'Food' : foodIdToName(source.tier)}`;
                        }).join(', ')}</div>
                    </div>
                </div>
                <div className="be-deploy__summary">
                    <div className="be-deploy__title">
                        Estimations
                    </div>
                    <div className="be-deploy__summary-estimations">
                        <div>
                            Damage: {predictedDamage.damage}
                            {
                                predictedDamage.bonus > 0
                                && ` (+${predictedDamage.bonus}%)`
                            }
                        </div>
                        <div>Hits: {Math.floor(this.state.inputVal / 10)}</div>
                    </div>
                    <button
                        onClick={() => this.deploy()}
                        className={getClassName({
                            'be-deploy__button': true,
                            'be-deploy__button--active': this.props.deployActive
                        })}>
                        { this.props.deployActive ? 'Cancel deploy' : 'Deploy' }
                    </button>
                </div>
            </div>
        );
    }
}

function mapState(state) {
    return {
        inventory: state.deployer.inventory,
        energyInfo: state.deployer.energyInfo,
        energyUsage: state.deployer.energyUsage,
        sliderMin: state.deployer.sliderMin,
        sliderMax: state.deployer.sliderMax,
        deployActive: state.deployer.deployActive,
        activeWeapon: state.deployer.activeWeapon,
        showStats: state.deployer.showStats,
        stats: state.deployer.stats,
        hovercard: state.main.hovercard
    };
}

function mapDispatch(dispatch) {
    return {
        setWeapon(weapon) {
            window.selectWeapon(parseInt(weapon));
        },
        updateEnergyUsage(value) {
            dispatch({
                type: 'UPDATE_ENERGY_USAGE',
                value
            });
        },
        closeStats() {
            dispatch({
                type: 'SET_SHOW_STATS',
                value: false
            });
        }
    };
}

export default connect(mapState, mapDispatch)(DeployTab);
