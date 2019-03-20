import React from 'react';
import { getPerc, divisions } from '../Utils';
import { connect } from 'react-redux';

class MiniMonitor extends React.Component {
    renderDivisions() {
        const { leftStats, rightStats } = this.props;
        if (!leftStats || !rightStats) return null;

        return divisions.map(div => {
            const leftDamage = leftStats.divisions[div].damage;
            const rightDamage = rightStats.divisions[div].damage;

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

function mapState(state) {
    return {
        leftStats: state.main.leftStats,
        rightStats: state.main.rightStats
    };
}

// Connect them:
export default connect(mapState)(MiniMonitor);
