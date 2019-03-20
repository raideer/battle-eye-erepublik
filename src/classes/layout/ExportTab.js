import React from 'react';
import Table from './charts/Table';
import TabButton from './TabButton';
import Pie from './charts/Pie';
import Bar from './charts/Bar';
import { currentRound, getStatsName, findCountry, textToColor } from '../Utils';
import { connect } from 'react-redux';

class ExportTab extends React.Component {
    constructor() {
        super();
        this.state = {
            step: 0,
            activeRound: 'overall',
            activeDiv: 'overall',
            activeChart: 'table',
            exportMaxProgress: ((currentRound * 4) - (Math.floor(currentRound / 4) * 3)) * 2
        };
    }

    getChart(fields, side) {
        const chartLabels = [];
        const chartData = [];

        for (const i in fields) {
            let label = i;

            if (this.props.displayStats == 'military_units') {
                if (window.BattleEye.muData[i]) {
                    label = window.BattleEye.muData[i].name;
                } else {
                    label = `Unit #${i}`;
                }
            } else {
                const country = findCountry('permalink', i);
                if (country) {
                    label = country.code;
                }
            }

            chartLabels.push(label);
            chartData.push(fields[i].damage);
        }

        const googleImg = () => {
            let image = 'https://chart.googleapis.com/chart?chds=a&cht=p&chd=t:';
            image += chartData.join(',');
            image += '&chs=440x300&chl=';
            image += chartLabels.join('|');
            image += '&chco=';
            image += Object.keys(fields).map(label => textToColor(label, false)).join(',');

            return image;
        };

        switch (this.state.activeChart) {
        case 'pie':
            return (
                <Pie
                    displayStats={this.props.displayStats}
                    labels={chartLabels}
                    data={chartData}
                    // colors={chartColors}
                />
            );
        case 'google':
            return (
                <div>
                    <img style={{ borderRadius: '5px' }} src={googleImg()}/>
                </div>
            );
        case 'bar': {
            return (
                <Bar
                    displayStats={this.props.displayStats}
                    labels={chartLabels}
                    data={chartData}
                    // colors={chartColors}
                />
            );
        }
        default:
            return (
                <Table side={side} fields={fields} />
            );
        }
    }

    renderStats() {
        let countries;

        if (this.state.activeRound == 'overall') {
            if (this.state.activeDiv == 'overall') {
                countries = {
                    left: this.props.exportData.left[this.props.displayStats],
                    right: this.props.exportData.right[this.props.displayStats]
                };
            } else {
                countries = {
                    left: this.props.exportData.left.divisions[this.state.activeDiv][this.props.displayStats],
                    right: this.props.exportData.right.divisions[this.state.activeDiv][this.props.displayStats]
                };
            }
        } else if (this.state.activeDiv == 'overall') {
            countries = {
                left: this.props.exportData.rounds[this.state.activeRound].left[this.props.displayStats],
                right: this.props.exportData.rounds[this.state.activeRound].right[this.props.displayStats]
            };
        } else {
            countries = {
                left: this.props.exportData.rounds[this.state.activeRound].left.divisions[this.state.activeDiv][this.props.displayStats],
                right: this.props.exportData.rounds[this.state.activeRound].right.divisions[this.state.activeDiv][this.props.displayStats]
            };
        }

        if (this.state.activeChart == 'export') {
            return (
                <div>
                    <div>Does not include MU data (yet)</div>
                    <button onClick={this.exportData.bind(this, 'excel')} className="be__button is-large ">Generate EXCEL file</button>
                </div>
            );
        }

        return (
            <div className="be__columns">
                <div className="be__column">
                    { this.getChart(countries.left, 'left') }
                </div>
                <div className="be__column">
                    { this.getChart(countries.right, 'right') }
                </div>
            </div>
        );
    }

    setDiv(activeDiv) {
        this.setState({
            activeDiv
        });
    }

    setRound(activeRound) {
        this.setState({
            activeRound
        });
    }

    setChart(activeChart) {
        this.setState({
            activeChart
        });
    }

    exportData(type) {
        window.BattleEye.exportStats(type, this.props.exportData);
    }

    renderSummary() {
        const rounds = [
            ['overall', 'All rounds']
        ];

        for (let i = 1; i <= window.SERVER_DATA.zoneId; i++) {
            rounds.push([i, `Round ${i}`]);
        }

        const divisions = [
            ['overall', 'Overall'],
            [1, 'DIV 1'],
            [2, 'DIV 2'],
            [3, 'DIV 3'],
            [4, 'DIV 4']
        ];

        const charts = [
            ['table', 'Table'],
            ['pie', 'Pie chart'],
            ['bar', 'Bar chart'],
            ['google', 'Google charts image'],
            ['export', 'Export data']
        ];

        return (
            <div className="battleeye__countries">
                <div className="be__filters">
                    <div className="be__level">
                        <div className="be__button-group">
                            { ['countries', 'military_units'].map(tab => {
                                return (
                                    <TabButton
                                        key={tab}
                                        name={tab}
                                        activeTab={this.props.displayStats}
                                        click={() => this.props.changeStats(tab)}>
                                        {getStatsName(tab)}
                                    </TabButton>
                                );
                            }) }
                        </div>
                        <div className="be__button-group">
                            { charts.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeChart}
                                        click={this.setChart.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                    <div className="be__level is-fullwidth">
                        <div className="be__button-group">
                            { rounds.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeRound}
                                        click={this.setRound.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                    <div className="be__level">
                        <div className="be__button-group">
                            { divisions.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeDiv}
                                        click={this.setDiv.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                </div>
                { this.renderStats() }
            </div>
        );
    }

    renderProgress() {
        const perc = Math.round(this.props.exportProgress / this.state.exportMaxProgress * 100);
        const style = {
            width: `${perc}%`
        };

        return (
            <div>
                <h4>{this.props.exportProgressStatus}</h4>
                <div style={{ padding: '5px' }} className="battleeye__domination-bar">
                    <span className="progress-name">Downloading Top 50</span>
                    <div className="progress-bar">
                        <div className="progress-leftvalue">{perc}</div>
                        <div style={style} className="left-progress"></div>
                    </div>
                </div>
            </div>
        );
    }

    renderIndex() {
        return (
            <div>
                <button onClick={() => window.BattleEye.generateSummary()} className="be__button is-large is-round">Generate summary</button>
            </div>
        );
    }

    render() {
        if (!this.props.visible) {
            return null;
        }

        switch (this.props.exportStep) {
        case 1:
            return this.renderProgress();
        case 2:
            return this.renderSummary();
        default:
            return this.renderIndex();
        }
    }
}

function mapState(state) {
    return {
        exportProgress: state.main.exportProgress,
        exportProgressStatus: state.main.exportProgressStatus,
        exportStep: state.main.exportStep,
        exportData: state.main.exportData,
        displayStats: state.main.displayStats
    };
}

function mapDispatch(dispatch) {
    return {
        changeStats(value) {
            dispatch({
                type: 'CHANGE_STATS',
                value
            });
        }
    };
}

export default connect(mapState, mapDispatch)(ExportTab);
