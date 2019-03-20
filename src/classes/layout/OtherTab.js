import React from 'react';
import { connect } from 'react-redux';
import { round, division, number, isAir, currentRankPoints, getWeaponBoosterBonus, calculateInfluence, getFirepower } from '../Utils';
import * as ranks from '../../ranks';

class OtherTab extends React.Component {
    getEpicStatus() {
        if (isAir) {
            return 0;
        }

        let targetDamage = 0;
        switch (division) {
        case 1:
            targetDamage = 150E6;
            break;
        case 2:
            targetDamage = 1500E6;
            break;
        case 3:
            targetDamage = 4500E6;
            break;
        case 4:
            targetDamage = 10E9;
            break;
        }

        return round((this.props.leftStats.divisions[division].damage + this.props.rightStats.divisions[division].damage) / targetDamage, 100);
    }

    getRankInfo() {
        const fieldType = isAir ? 'aviation' : 'military';

        const hc = this.props.hovercard;

        const currentRankNumber = hc.fighterInfo[fieldType].rank;
        const nextRank = ranks[fieldType][currentRankNumber + 1][0];
        const nextRankPoints = ranks[fieldType][currentRankNumber + 1][1];

        const rankPointsToNext = nextRankPoints - currentRankPoints();

        let str = 0;
        let rank = 0;
        const boosterBonus = getWeaponBoosterBonus();

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

        const legendBonus = Math.max(Math.round((100 * hc.fighterInfo[fieldType].damagePerHitLegend / hc.fighterInfo[fieldType].damagePerHit) - 100), 0);
        const hitInfluenceWithBooster = hitInfluence + (hitInfluence * boosterBonus / 100) + (hitInfluence * legendBonus / 100);
        const hitsToNextRank = Math.ceil(rankPointsToNext / (hitInfluenceWithBooster / 10));

        return {
            hitInfluence,
            hitInfluenceWithBooster,
            boosterBonus,
            hitsToNextRank,
            rankPointsToNext,
            nextRank
        };
    }

    render() {
        const rankInfo = this.getRankInfo();

        return (
            <div className="be__other">
                <div className="be__columns">
                    <div className="be__column">
                        <div className="be__other-section">
                            General
                        </div>
                        {/* <div className="be__other-field">
                            <div className="be__other-field-name">Total Damage</div>
                            <div className="be__other-field-value">{ number(this.props.leftStats.damage + this.props.rightStats.damage, true) }</div>
                        </div> */}
                        <div className="be__other-field">
                            <div className="be__other-field-name">Total DIV {division} Damage</div>
                            <div className="be__other-field-value">{ number(this.props.leftStats.divisions[division].damage + this.props.rightStats.divisions[division].damage, true) }</div>
                        </div>
                        {/* <div className="be__other-field">
                            <div className="be__other-field-name">Epic progress</div>
                            <div className="be__other-field-value">{ this.getEpicStatus() }%</div>
                        </div> */}
                        <div className="be__other-field">
                            <div className="be__other-field-name">Single hit damage</div>
                            <div className="be__other-field-value">
                                { number(rankInfo.hitInfluenceWithBooster, true) }
                                {
                                    rankInfo.boosterBonus > 0
                                    && ` (+${rankInfo.boosterBonus}%)`
                                }
                            </div>
                        </div>
                    </div>
                    <div className="be__column">
                        <div className="be__other-section">
                            Rank
                        </div>
                        <div className="be__other-field">
                            <div className="be__other-field-name">Next rank</div>
                            <div className="be__other-field-value">{ rankInfo.nextRank }</div>
                        </div>
                        <div className="be__other-field">
                            <div className="be__other-field-name">Points to next rank</div>
                            <div className="be__other-field-value">{ number(rankInfo.rankPointsToNext, true) }</div>
                        </div>
                        <div className="be__other-field">
                            <div className="be__other-field-name">Hits to next rank</div>
                            <div className="be__other-field-value">{ number(rankInfo.hitsToNextRank, true) }</div>
                        </div>
                        <div className="be__other-field">
                            <div className="be__other-field-name">Damage to next rank</div>
                            <div className="be__other-field-value">{ number(rankInfo.rankPointsToNext * 10, true) }</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

function mapState(state) {
    return {
        leftStats: state.main.leftStats,
        rightStats: state.main.rightStats,
        hovercard: state.main.hovercard,
        activeWeapon: state.deployer.activeWeapon
    };
}

export default connect(mapState)(OtherTab);
