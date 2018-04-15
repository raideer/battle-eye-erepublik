import React from 'react';
import { getPerc, divisions } from '../Utils';

export default class MiniMonitor extends React.Component {
    renderDivisions() {
        const { left, right } = this.props.feedData;

        return divisions.map(div => {
            const leftDamage = left.divisions[div].damage;
            const rightDamage = right.divisions[div].damage;

            return (
                <div key={div}>
                    <div className={`battleeye-div battleeye-div${div}`}></div>
                    { getPerc(leftDamage, rightDamage) }% - { getPerc(rightDamage, leftDamage) }%
                </div>
            );
        });
    }

    render() {
        if (!window.BattleEyeStorage.get('showMiniMonitor')) {
            return null;
        }

        return (
            <div className="battleeye__minimonitor">
                { this.renderDivisions() }
            </div>
        );
    }
}
