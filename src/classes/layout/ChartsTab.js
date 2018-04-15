import React from 'react';
import TabButton from './TabButton';

import Table from './charts/Table';
import Pie from './charts/Pie';
import Radar from './charts/Radar';

import { Line } from 'react-chartjs-2';
import { intToRGB, hashCode, getPerc, division } from '../Utils';

export default class ChartsTab extends React.Component {
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

    getChart(countries, side) {
        const chartLabels = [];
        const chartData = [];
        const chartColors = [];

        for (var i in countries) {
            chartLabels.push(i);
            chartData.push(countries[i].damage);
            chartColors.push(`#${intToRGB(hashCode(i))}`);
        }

        switch (this.state.activeChart) {
        case 'pie':
            return (
                <Pie
                    labels={chartLabels}
                    data={chartData}
                    colors={chartColors}
                />
            );
        case 'radar':
            return (
                <Radar
                    labels={chartLabels}
                    data={chartData}
                    colors={chartColors}
                />
            );
        case 'table': {
            return (
                <Table side={side} countries={countries} />
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
        } else if (type == 'kills') {
            dataLeft = data.left.map(point => point.kills);
            dataRight = data.right.map(point => point.kills);
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
                            label: BattleEye.teamAName,
                            fill: false,
                            lineTension: 0,
                            borderColor: '#23d160',
                            data: dataLeft
                        },
                        {
                            label: BattleEye.teamBName,
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
        const { data } = this.props;
        const tab = this.state.activeTab;
        const overall = tab == 'overall';

        switch (this.state.activeChart) {
        case 'kills':
        case 'domination':
        case 'activeFighters':
        case 'dps': {
            const damageHistory = {
                left: overall ? data.left.damageHistory : data.left.divisions[tab].damageHistory,
                right: overall ? data.right.damageHistory : data.right.divisions[tab].damageHistory
            };

            return (
                <div>
                    { this.getHistoryChart(damageHistory, this.state.activeChart) }
                </div>
            );
        }
        default: {
            const countries = {
                left: overall ? data.left.countries : data.left.divisions[tab].countries,
                right: overall ? data.right.countries : data.right.divisions[tab].countries
            };

            return (
                <div className="columns">
                    <div className="column is-half">
                        {this.getChart(countries.left, 'left')}
                    </div>
                    <div className="column is-half">
                        {this.getChart(countries.right, 'right')}
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
            ['pie', 'Pie charts'],
            ['radar', 'Radar charts'],
            ['dps', 'DPS'],
            ['domination', 'Domination'],
            ['kills', 'Kill count'],
            ['activeFighters', 'Active fighters']
        ];

        return (
            <div className="battleeye__countries">
                <div className="filters">
                    <div className="level">
                        <div className="level-item buttons has-addons">
                            { charts.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeChart}
                                        className={`${this.state.activeChart == tab[0] ? '' : 'is-outlined'} is-inverted is-dark`}
                                        click={this.setChart.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                    <div className="level">
                        <div className="level-item buttons has-addons">
                            { tabs.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeTab}
                                        className={`${this.state.activeTab == tab[0] ? '' : 'is-outlined'} is-inverted is-dark`}
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
