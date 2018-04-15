import React from 'react';
import { divisions, divName, prettifyCountryName } from '../Utils';
import Division from './Division';
import Flag from './Flag';

export default class DivisionsTab extends React.Component {
    render() {
        return (
            <div className="battleeye__divisions">
                <div className="battleeye__versus">
                    <div className="versus__left">{prettifyCountryName(BattleEye.teamAName)} <Flag country={BattleEye.teamAName} /></div>
                    <div className="versus__right"><Flag country={BattleEye.teamBName} /> {prettifyCountryName(BattleEye.teamBName)}</div>
                </div>
                { divisions().map(div => {
                    return (
                        <div>
                            <div className="panel-header">
                                { divName(div) }
                            </div>
                            <Division i={div} division={{
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
