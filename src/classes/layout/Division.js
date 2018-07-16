import React from 'react';
import StatsField from './StatsField';
import DominationBar from './DominationBar';
import DominationBar2 from './DominationBar2';

export default class Division extends React.Component {
    render() {
        const { division, className, i } = this.props;

        let actualDomination = window.BattleEye.nbpStats ? window.BattleEye.nbpStats.division.domination[i] : 0;
        if (window.SERVER_DATA.mustInvert) {
            actualDomination = (100 - actualDomination);
        }

        return (
            <div className={`battleeye__division ${className ? className : ''}`}>
                <div className="columns">
                    <div className="column has-text-left division__stats">
                        <StatsField
                            left={division.left.damage}
                            right={division.right.damage}
                            name="Damage"
                        />
                        <StatsField
                            left={division.left.hits}
                            right={division.right.hits}
                            name="Kills"
                        />
                        <StatsField
                            left={division.left.dps}
                            right={division.right.dps}
                            name="DPS"
                        />
                        <StatsField
                            left={division.left.recentFighters}
                            right={division.right.recentFighters}
                            name="Currently fighting"
                        />
                    </div>
                    <div className="column is-three-fifths division__domination">
                        <DominationBar2
                            left={division.left.damage}
                            right={division.right.damage}
                            leftActual={actualDomination}
                            name="Damage" />
                        <DominationBar
                            left={division.left.dps}
                            right={division.right.dps}
                            name="DPS" />
                    </div>
                </div>
            </div>
        );
    }
}
