import React from 'react';
import { getPerc, truncate, getStatsName, getClassName } from '../../Utils';
import Flag from '../Flag';
import Avatar from '../Avatar';
import { connect } from 'react-redux';

class Table extends React.Component {
    renderHeader(side) {
        if (side == 'left') {
            return (
                <div className="be__columns be__charts-header has-text-right">
                    <div className="be__column">Damage</div>
                    <div className="be__column" style={{ padding: '0 5px' }}>{getStatsName(this.props.displayStats)}</div>
                </div>
            );
        }

        return (
            <div className="be__columns be__charts-header has-text-left">
                <div className="be__column" style={{ padding: '0 5px' }}>{getStatsName(this.props.displayStats)}</div>
                <div className="be__column">Damage</div>
            </div>
        );
    }

    renderAvatar(id) {
        switch (this.props.displayStats) {
        case 'countries':
            return <Flag country={ id } />;
        case 'military_units':
            if (window.BattleEye.muData[id]) {
                return <Avatar avatar={ window.BattleEye.muData[id].avatar } />;
            }
        }

        return null;
    }

    render() {
        const { fields, side } = this.props;

        const totalDamage = Object.keys(fields).reduce((total, name) => {
            total += fields[name].damage;
            return total;
        }, 0);

        return (
            <div className="be__charts">
                { this.renderHeader(side) }
                { Object.keys(fields).sort((a, b) => fields[b].damage - fields[a].damage).map((key, i) => {
                    const field = fields[key];
                    let fieldName;
                    if (this.props.displayStats == 'military_units') {
                        if (window.BattleEye.muData[key]) {
                            fieldName = window.BattleEye.muData[key].name;
                        } else {
                            fieldName = `Unit #${key}`;
                        }
                    } else {
                        fieldName = field.name || key;
                    }

                    return (
                        <div key={i} className={getClassName({
                            be__columns: true,
                            'be__charts-row': true,
                            'be__charts-row--left': side == 'left',
                            'be__charts-row--right': side != 'left'
                        })}>
                            <div className="be__column is-two-thirds be__charts-stats">
                                <span className="be__charts-stats-field">{field.kills} kills</span>
                                <span className="be__charts-stats-field">{getPerc(field.damage, totalDamage - field.damage)}%</span>
                                <span className="be__charts-stats-field">{field.damage.toLocaleString()}</span>
                            </div>
                            <div className="be__column be__charts-title">
                                <span title={fieldName}>{ truncate(fieldName, 14) }</span>
                                { this.renderAvatar(key) }
                            </div>
                            <div style={{ width: `${getPerc(field.damage, totalDamage - field.damage)}%` }} className="be__charts-background"></div>
                        </div>
                    );
                }) }
            </div>
        );
    }
}

function mapState(state) {
    return {
        displayStats: state.main.displayStats
    };
}

// Connect them:
export default connect(mapState)(Table);
