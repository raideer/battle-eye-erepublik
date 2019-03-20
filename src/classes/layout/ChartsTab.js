import React from 'react';
import TabButton from './TabButton';

import Table from './charts/Table';
import Pie from './charts/Pie';
import Bar from './charts/Bar';

import { Line } from 'react-chartjs-2';
import {
    getPerc,
    division,
    findCountry,
    leftSideName,
    rightSideName,
    getStatsName
} from '../Utils';
import { connect } from 'react-redux';

class ChartsTab extends React.Component {
    constructor() {
        super();

        this.state = {
            activeTab: 'overall',
            activeChart: 'table'
        };
    }

    setChart(activeChart) {
        this.setState({
            activeChart
        });
    }

    setTab(activeTab) {
        this.setState({
            activeTab
        });
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

        switch (this.state.activeChart) {
        case 'pie':
            return (
                <Pie
                    displayStats={this.props.displayStats}
                    labels={chartLabels}
                    data={chartData}
                />
            );
        case 'table': {
            return (
                <Table side={side} fields={fields} />
            );
        }
        case 'bar': {
            return (
                <Bar
                    displayStats={this.props.displayStats}
                    labels={chartLabels}
                    data={chartData}
                />
            );
        }
        }
    }

    getHistoryChart(data, type) {
        let dataLeft;
        let dataRight;

        if (type == 'dps') {
            dataLeft = data.left.map(point => point.dps);
            dataRight = data.right.map(point => point.dps);
        } else if (type == 'activeFighters') {
            dataLeft = data.left.map(point => point.activeFighters);
            dataRight = data.right.map(point => point.activeFighters);
        } else {
            dataLeft = data.left.map((point, i) => {
                return getPerc(point.damage, data.right[i].damage);
            });
            dataRight = data.right.map((point, i) => {
                return getPerc(point.damage, data.left[i].damage);
            });
        }

        return (
            <Line
                height={300}
                data={{
                    labels: data.left.map(point => {
                        return `T+${point.time}`;
                    }),
                    datasets: [
                        {
                            label: leftSideName,
                            fill: false,
                            lineTension: 0,
                            borderColor: '#23d160',
                            data: dataLeft
                        },
                        {
                            label: rightSideName,
                            fill: false,
                            lineTension: 0,
                            borderColor: '#fe385f',
                            data: dataRight
                        }
                    ]
                }}
                options={{
                    maintainAspectRatio: false,
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    fontColor: '#dfdfdf',
                                    beginAtZero: true
                                }
                            }
                        ],
                        xAxes: [
                            {
                                ticks: {
                                    fontColor: '#dfdfdf'
                                }
                            }
                        ]
                    }
                }}
            />
        );
    }

    renderTab() {
        const { leftStats, rightStats } = this.props;
        if (!leftStats || !rightStats) return null;
        const tab = this.state.activeTab;
        const overall = tab == 'overall';

        switch (this.state.activeChart) {
        case 'domination':
        case 'activeFighters':
        case 'dps': {
            const damageHistory = {
                left: overall ? leftStats.damageHistory : leftStats.divisions[tab].damageHistory,
                right: overall ? rightStats.damageHistory : rightStats.divisions[tab].damageHistory
            };

            return (
                <div>
                    { this.getHistoryChart(damageHistory, this.state.activeChart) }
                </div>
            );
        }
        default: {
            const stats = {
                left: overall ? leftStats[this.props.displayStats] : leftStats.divisions[tab][this.props.displayStats],
                right: overall ? rightStats[this.props.displayStats] : rightStats.divisions[tab][this.props.displayStats]
            };

            return (
                <div className="be__columns">
                    <div className="be__column is-half">
                        {this.getChart(stats.left, 'left')}
                    </div>
                    <div className="be__column is-half">
                        {this.getChart(stats.right, 'right')}
                    </div>
                </div>
            );
        }
        }
    }

    render() {
        let tabs;

        if (division == 11) {
            this.state.activeTab = 11;
            tabs = [
                [11, 'AIR']
            ];
        } else {
            tabs = [
                ['overall', 'Overall'],
                [1, 'DIV 1'],
                [2, 'DIV 2'],
                [3, 'DIV 3'],
                [4, 'DIV 4']
            ];
        }

        const charts = [
            ['table', 'Table'],
            ['bar', 'Bar charts'],
            ['pie', 'Pie charts'],
            ['dps', 'DPS'],
            ['domination', 'Domination'],
            ['activeFighters', 'Active fighters']
        ];

        return (
            <div className="be__charts">
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
                    </div>
                    <div className="be__level">
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
                    <div className="be__level">
                        <div className="be__button-group">
                            { tabs.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeTab}
                                        click={this.setTab.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                </div>
                { this.renderTab() }
            </div>
        );
    }
}

function mapState(state) {
    return {
        leftStats: state.main.leftStats,
        rightStats: state.main.rightStats,
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

// Connect them:
export default connect(mapState, mapDispatch)(ChartsTab);
