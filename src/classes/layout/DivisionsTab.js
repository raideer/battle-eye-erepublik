import React from 'react';
import { divisions, divName, prettifyCountryName, division } from '../Utils';
import Division from './Division';
import Flag from './Flag';

const divIds = {};

export default class DivisionsTab extends React.Component {
    render() {
        return (
            <div className="battleeye__divisions">
                <div className="battleeye__versus">
                    <div className="versus__left">{prettifyCountryName(BattleEye.teamAName)} <Flag country={BattleEye.teamAName} /></div>
                    <div className="versus__right"><Flag country={BattleEye.teamBName} /> {prettifyCountryName(BattleEye.teamBName)}</div>
                </div>
                { divisions.filter(div => {
                    if (div !== 11) {
                        return BattleEyeStorage.get(`showDiv${div}`);
                    }
                    return true;
                }).map(div => {
                    if (!divIds[div]) {
                        divIds[div] = this.props.divisions.left[div].id + this.props.divisions.right[div].id;
                    }

                    return (
                        <div key={divIds[div]}>
                            <div className="panel-header">
                                { divName(div) }
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
