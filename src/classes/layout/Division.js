import React from 'react';
import StatsField from './StatsField';
import DominationBar from './DominationBar';
import DominationBarNew from './DominationBarNew';

import { connect } from 'react-redux';

class Division extends React.Component {
    render() {
        const { division, className, i } = this.props;

        let actualDomination = 0;
        if (this.props.nbp) {
            actualDomination = this.props.nbp.division.domination[i];
            if (window.SERVER_DATA.mustInvert) {
                actualDomination = 100 - actualDomination;
            }
        }

        return (
            <div className={`battleeye__division ${className ? className : ''}`}>
                <div className="be__columns">
                    <div className="be__column division__stats">
                        <StatsField
                            left={division.left.damage}
                            right={division.right.damage}
                            name="Damage"
                        />
                        <StatsField
                            left={division.left.kills}
                            right={division.right.kills}
                            name="Kills"
                        />
                        <StatsField
                            left={division.left.dps}
                            right={division.right.dps}
                            name="DPS"
                        />
                        <StatsField
                            left={division.left.recentFightersCount}
                            right={division.right.recentFightersCount}
                            name="Currently fighting"
                        />
                    </div>
                    <div className="be__column is-three-fifths division__domination">
                        <DominationBarNew
                            left={division.left.damage}
                            right={division.right.damage}
                            leftActual={actualDomination}
                            dpsLeft={division.left.dps}
                            dpsRight={division.right.dps}
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

function mapState(state) {
    return {
        nbp: state.main.nbp
    };
}

export default connect(mapState)(Division);
