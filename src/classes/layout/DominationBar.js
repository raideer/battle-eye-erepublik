import React from 'react';

export default class DominationBar extends React.Component {
    render() {
        const { left, right, name } = this.props;

        let aPerc = 0, bPerc = 0;

        if (left + right !== 0) {
            aPerc = Math.round(left * 10000 / (left + right)) / 100;
            bPerc = Math.round(right * 10000 / (left + right)) / 100;
        }

        return (
            <div className="battleeye__domination-bar">
                <span className="progress-name">{ name }</span>
                <span className="progress-difference">Difference: {Math.abs(left - right).toLocaleString()}</span>
                <div className="progress-bar">
                    <div className="progress-center"></div>
                    <div className="progress-leftvalue">{aPerc}</div>
                    <div className="progress-rightvalue">{bPerc}</div>
                    <div style={{ width: `${aPerc}%` }} className="left-progress"></div>
                    <div style={{ width: `${bPerc}%` }} className="right-progress"></div>
                </div>
            </div>
        );
    }
}
