import React from 'react';
import { round, getPerc } from '../Utils';

export default class DominationBar extends React.Component {
    render() {
        const { left, right, name } = this.props;

        let aPerc = 0, bPerc = 0;

        if (left + right !== 0) {
            aPerc = getPerc(left, right, 100);
            bPerc = round(100 - aPerc, 100);
        }

        return (
            <div className="battleeye__domination-bar">
                <span className="progress-name">{ name }</span>
                <span className="progress-difference">Difference: {Math.abs(left - right).toLocaleString()}</span>
                <div className="progress-bar">
                    <div className="progress-center"></div>
                    <div className="progress-leftvalue">{aPerc}</div>
                    <div className="progress-rightvalue">{bPerc}</div>
                    <div style={{ width: `${aPerc}%` }} className="left-actual-progress"></div>
                    <div style={{ width: `${bPerc}%` }} className="right-actual-progress"></div>
                </div>
            </div>
        );
    }
}
