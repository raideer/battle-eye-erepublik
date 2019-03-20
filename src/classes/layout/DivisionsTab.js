import React from 'react';
import { currentRound, divisions, divName, countryPermalinkToName, division, arrayRemoveElement, number, leftSideName, rightSideName } from '../Utils';
import Division from './Division';
import Flag from './Flag';
import { connect } from 'react-redux';

const divIds = {};

class DivisionsTab extends React.Component {
    render() {
        let divs;

        if (BattleEyeStorage.get('topDiv')) {
            divs = [division, ...arrayRemoveElement(divisions, division)];
        } else {
            divs = divisions;
        }

        return (
            <div className="battleeye__divisions">
                <div className="battleeye__versus">
                    <div className="battleeye__versus-side">{countryPermalinkToName(leftSideName)} <Flag country={leftSideName} /></div>
                    <div className="battleeye__versus-round">ROUND {currentRound}</div>
                    <div className="battleeye__versus-side"><Flag country={rightSideName} /> {countryPermalinkToName(rightSideName)}</div>
                </div>
                { divs.filter(div => {
                    if (div !== 11) {
                        return BattleEyeStorage.get(`showDiv${div}`);
                    }
                    return true;
                }).map((div, i) => {
                    if (!divIds[div]) {
                        divIds[div] = this.props.divisions.left[div].id + this.props.divisions.right[div].id;
                    }

                    return (
                        <div key={i}>
                            <div className="be__panel-header">
                                { divName(div) }
                                {
                                    div == division
                                    && this.props.nbp
                                    && !this.props.nbp.error
                                    && <div className="be__panel-header__left">
                                        <span className="be__pill">
                                            Max hit: { number(this.props.nbp.maxHit, true) }
                                        </span>
                                    </div>
                                }
                            </div>
                            <Division className={div == division && BattleEyeStorage.get('highlightDiv') ? 'highlight-div' : ''} i={div} division={{
                                left: this.props.divisions.left[div],
                                right: this.props.divisions.right[div]
                            }} />
                        </div>
                    );
                }) }
            </div>
        );
    }
}

function mapState(state) {
    return {
        nbp: state.main.nbp
    };
}

export default connect(mapState)(DivisionsTab);

