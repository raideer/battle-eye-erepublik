import React from 'react';
import { round, getPerc } from '../Utils';

export default class DominationBarNew extends React.Component {
    render() {
        const { left, right, name, dpsLeft, dpsRight } = this.props;

        const leftActual = round(this.props.leftActual, 100);
        const rightActual = round(100 - leftActual, 100);

        let aPerc = 0, bPerc = 0, gain = 0, absGain = 0;

        if (left + right !== 0) {
            aPerc = getPerc(left, right);
            bPerc = round(100 - aPerc, 100);
            gain = round(aPerc - leftActual);
            absGain = Math.abs(gain);
        }

        const dps = getPerc(dpsLeft, dpsRight);
        const difference = Math.abs(left - right);

        return (
            <div className="battleeye__domination-bar">
                <span className="progress-name">{ name }</span>
                <span className="progress-difference">Difference: {difference.toLocaleString()} <span style={{ display: 'inline-block', width: '10px' }}></span></span>
                <div className="progress-bar">
                    <div className="progress-center"></div>
                    <div className="progress-leftvalue">{aPerc}</div>
                    <div className="progress-rightvalue">{bPerc}</div>
                    <div style={{ width: `${gain < 0 ? leftActual - absGain : leftActual}%` }} className="left-actual-progress"></div>
                    <div style={{ width: `${absGain}%` }} className={gain >= 0 ? 'left-progress' : 'right-progress'}></div>
                    <div style={{ width: `${gain >= 0 ? rightActual - gain : rightActual}%` }} className="right-actual-progress"></div>
                </div>
                <div className={`progress-bar-gain ${dpsLeft === 0 && dpsRight === 0 ? 'neutral' : aPerc < dps ? 'positive' : 'negative'}`}></div>
            </div>
        );
    }
}
