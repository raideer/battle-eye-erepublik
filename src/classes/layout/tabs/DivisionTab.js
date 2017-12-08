import FloatValue from '../elements/FloatValue';
import TextValue from '../elements/TextValue';
import ProgressBar from '../elements/ProgressBar';
import If from '../If';
import React from 'react';

export default class DivisionTab extends React.Component {
    getPerc(a, b) {
        var ap = 0;

        if (a + b !== 0) {
            ap = Math.round(a * 10000 / (a + b)) / 100;
        }

        return ap;
    }

    render() {
        if (this.props.tab != 'div') {
            return null;
        }

        function num(number) {
            if (isNaN(number)) {
                return 0;
            }

            return number.toLocaleString();
        }

        var left = this.props.data.left;
        var right = this.props.data.right;
        var highlightDivision = false;
        if (SERVER_DATA.division == this.props.div[0]) {
            highlightDivision = true;
        }

        var leftDomination = left.damage;
        var rightDomination = right.damage;

        var leftDmgPerPercent = Math.round(left.damage / this.getPerc(leftDomination, rightDomination));
        var rightDmgPerPercent = Math.round(right.damage / this.getPerc(rightDomination, leftDomination));

        return (
            <div>
                <div className={`bel-col-1-1 text-center bel-title ${highlightDivision ? 'bel-highlight-title' : ''}`}>
                    {this.props.div[1]}
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <TextValue a={`1% = ${num(leftDmgPerPercent)} dmg`}/>
                            <FloatValue green={true} a={this.getPerc(leftDomination, rightDomination)} b={this.getPerc(rightDomination, leftDomination)} text={'%'}/>
                        </li>
                        <li className="bel-col-1-3 text-center">Domination</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue b={this.getPerc(leftDomination, rightDomination)} a={this.getPerc(rightDomination, leftDomination)} text={'%'}/>
                            <TextValue a={`1% = ${num(rightDmgPerPercent)} dmg`}/>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <If test={window.BattleEyeSettings.showKills.value}>
                                <FloatValue green={true} a={left.hits} b={right.hits} text={'kills'}/>
                            </If>

                            <FloatValue green={true} a={left.damage} b={right.damage} />
                        </li>
                        <li className="bel-col-1-3 text-center">Total Damage</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue a={right.damage} b={left.damage} />

                            <If test={window.BattleEyeSettings.showKills.value}>
                                <FloatValue a={right.hits} b={left.hits} text={'kills'} />
                            </If>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <If test={window.BattleEyeSettings.showAverageDamage.value}>
                        <ul className="list-unstyled">
                            <li className="bel-col-1-3 text-right">
                                <FloatValue green={true} a={left.avgHit} b={right.avgHit} />
                            </li>
                            <li className="bel-col-1-3 text-center">Average damage</li>
                            <li className="bel-col-1-3 text-left">
                                <FloatValue a={right.avgHit} b={left.avgHit} />
                            </li>
                        </ul>
                    </If>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <FloatValue green={true} a={left.recentFighters} b={right.recentFighters} text={left.recentFighters == 1 ? 'fighter' : 'fighters'} />
                            <FloatValue green={true} a={left.dps} b={right.dps} />
                        </li>
                        <li className="bel-col-1-3 text-center">DPS</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue a={right.dps} b={left.dps} />
                            <FloatValue a={right.recentFighters} b={left.recentFighters} text={ right.recentFighters == 1 ? 'fighter' : 'fighters' } />
                        </li>
                    </ul>
                </div>

                <div className="bel-col-1-1">
                    <If test={window.BattleEyeSettings.showDominationBar.value}>
                        <div className="text-left bel-text-tiny">DOMINATION <span className="color-silver">(<strong>{Math.abs(leftDomination - rightDomination).toLocaleString()} </strong> difference)</span></div>
                        <ProgressBar a={leftDomination} b={rightDomination}/>
                    </If>

                    <If test={window.BattleEyeSettings.showDamageBar.value}>
                        <div className="text-left bel-text-tiny">DAMAGE <span className="color-silver">(<strong>{Math.abs(left.damage - right.damage).toLocaleString()} </strong> difference)</span></div>
                        <ProgressBar a={left.damage} b={right.damage}/>
                    </If>

                    <If test={window.BattleEyeSettings.showDpsBar.value}>
                        <div className="text-left bel-text-tiny">DPS <span className="color-silver">(<strong>{Math.abs(left.dps - right.dps).toLocaleString()}</strong> difference)</span></div>
                        <ProgressBar a={left.dps} b={right.dps}/>
                    </If>
                </div>
            </div>
        );
    }
}
