import React from 'react';

export default class DominationBar2 extends React.Component {
    render() {
        const { left, right, name } = this.props;

        const leftActual = Math.round(this.props.leftActual * 100) / 100;
        const rightActual = Math.round((100 - leftActual) * 100) / 100;

        let aPerc = 0, bPerc = 0, gain = 0;

        if (left + right !== 0) {
            aPerc = Math.round(left * 10000 / (left + right)) / 100;
            bPerc = Math.round(right * 10000 / (left + right)) / 100;
            gain = Math.round((aPerc - leftActual) * 100) / 100;
        }

        return (
            <div className="battleeye__domination-bar">
                <span className="progress-name">{ name }</span>
                <span className="progress-difference">Difference: {Math.abs(left - right).toLocaleString()}</span>
                <div className="progress-bar">
                    <div className="progress-center"></div>
                    <div className="progress-leftvalue">{aPerc}</div>
                    <div className="progress-rightvalue">{bPerc}</div>
                    <div style={{ width: `${gain < 0 ? leftActual - Math.abs(gain) : leftActual}%` }} className="left-actual-progress"></div>
                    <div style={{ width: `${Math.abs(gain)}%` }} className={gain >= 0 ? 'left-progress' : 'right-progress'}></div>
                    <div style={{ width: `${gain >= 0 ? rightActual - gain : rightActual}%` }} className="right-actual-progress"></div>
                </div>
                {/* <div className={`progress-bar-gain ${gain < 0 ? 'negative' : gain > 0 ? 'positive' : 'neutral'}`}></div> */}
            </div>
        );
    }
}
