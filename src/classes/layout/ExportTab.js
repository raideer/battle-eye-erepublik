import React from 'react';
import Table from './charts/Table';
import TabButton from './TabButton';
import Pie from './charts/Pie';
import Radar from './charts/Radar';
import { intToRGB, hashCode, currentRound } from '../Utils';

export default class ExportTab extends React.Component {
    constructor() {
        super();
        this.state = {
            step: 0,
            progress: {
                current: 0,
                max: ((currentRound * 4) - (Math.floor(currentRound / 4) * 3)) * 2,
                status: 'Fetching data'
            },
            activeRound: 'overall',
            activeDiv: 'overall',
            activeChart: 'table'
        };

        this.data = {
            left: null,
            right: null,
            rounds: null
        };
    }

    generateSummary() {
        this.setState({
            step: 1
        });

        window.BattleEye.generateSummary();

        window.BattleEye.events.on('summary.update', step => {
            if (step.page == 1) {
                this.state.progress.current++;
            }

            this.setState({
                progress: {
                    status: `[Round ${step.round}] Processed ${step.type} for division ${step.div} (${step.page}/${step.maxPage})`,
                    current: this.state.progress.current,
                    max: this.state.progress.max
                }
            });
        });

        window.BattleEye.events.on('summary.finished', ([left, right, rounds]) => {
            this.state.progress.status = 'Data fetching done. Organizing data';

            this.data.left = left;
            this.data.right = right;
            this.data.rounds = rounds;

            this.state.step = 2;
        });
    }

    getChart(countries, side) {
        const chartLabels = [];
        const chartData = [];
        const chartColors = [];

        for (var i in countries) {
            chartLabels.push(i);
            chartData.push(countries[i].damage);
            chartColors.push(`#${intToRGB(hashCode(i))}`.toLocaleLowerCase());
        }

        const googleImg = () => {
            let image = 'https://chart.googleapis.com/chart?chds=a&cht=p&chd=t:';
            image += chartData.join(',');
            image += '&chs=440x300&chl=';
            image += chartLabels.join('|');
            image += '&chco=';
            image += chartColors.map(color => color.substr(1, color.length)).join(',');

            return image;
        };

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
        case 'google':
            return (
                <div>
                    <img style={{ borderRadius: '5px' }} src={googleImg()}/>
                </div>
            );
        default:
            return (
                <Table side={side} countries={countries} />
            );
        }
    }

    renderStats() {
        let countries;

        if (this.state.activeRound == 'overall') {
            if (this.state.activeDiv == 'overall') {
                countries = {
                    left: this.data.left.countries,
                    right: this.data.right.countries
                };
            } else {
                countries = {
                    left: this.data.left.divisions[this.state.activeDiv].countries,
                    right: this.data.right.divisions[this.state.activeDiv].countries
                };
            }
        } else if (this.state.activeDiv == 'overall') {
            countries = {
                left: this.data.rounds[this.state.activeRound].left.countries,
                right: this.data.rounds[this.state.activeRound].right.countries
            };
        } else {
            countries = {
                left: this.data.rounds[this.state.activeRound].left.divisions[this.state.activeDiv].countries,
                right: this.data.rounds[this.state.activeRound].right.divisions[this.state.activeDiv].countries
            };
        }

        if (this.state.activeChart == 'export') {
            return (
                <button onClick={this.exportData.bind(this, 'excel')} className="button is-primary is-inverted">Generate EXCEL file</button>
            );
        }

        return (
            <div className="columns">
                <div className="column is-half">
                    { this.getChart(countries.left, 'left') }
                </div>
                <div className="column is-half">
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
        window.BattleEye.exportStats(type, this.data);
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
            ['radar', 'Radar chart'],
            ['google', 'Google charts image'],
            ['export', 'Export data']
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
                                        inactiveClass='is-outlined'
                                        className='is-inverted is-dark'
                                        click={this.setChart.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                    <div className="level">
                        <div className="level-item buttons has-addons">
                            { rounds.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeRound}
                                        inactiveClass='is-outlined'
                                        className='is-inverted is-dark'
                                        click={this.setRound.bind(this, tab[0])}>
                                        {tab[1]}
                                    </TabButton>
                                );
                            }) }
                        </div>
                    </div>
                    <div className="level">
                        <div className="level-item buttons has-addons">
                            { divisions.map(tab => {
                                return (
                                    <TabButton
                                        key={tab[0]}
                                        name={tab[0]}
                                        activeTab={this.state.activeDiv}
                                        inactiveClass='is-outlined'
                                        className='is-inverted is-dark'
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
        const perc = Math.round(this.state.progress.current / this.state.progress.max * 100);
        const style = {
            width: `${perc}%`
        };

        return (
            <div>
                <h4>{this.state.progress.status}</h4>
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
                <button onClick={this.generateSummary.bind(this)} className="button is-info is-inverted">Generate summary</button>
            </div>
        );
    }

    render() {
        if (!this.props.visible) {
            return null;
        }

        switch (this.state.step) {
        case 1:
            return this.renderProgress();
        case 2:
            return this.renderSummary();
        default:
            return this.renderIndex();
        }
    }
}
