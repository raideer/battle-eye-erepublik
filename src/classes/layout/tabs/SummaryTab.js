import React from 'react';
import If from '../If';
import TabSelector from './TabSelector';

export default class SummaryTab extends React.Component {
    constructor() {
        super();

        this.state = {
            step: 0,
            progress: {
                current: 0,
                max: SERVER_DATA.zoneId + 1,
                status: 'Fetching data'
            },
            tab: 'overall',
            division: 'overall'
        };

        this.data = {
            left: null,
            right: null,
            data: null
        };
    }

    renderIndex() {
        return (
            <div>
                <button onClick={this.generateSummary.bind(this)} className="bel-btn bel-btn-info">Generate summary</button>
            </div>
        );
    }

    renderProgress() {
        var style = {
            width: `${Math.round(this.state.progress.current / this.state.progress.max * 100)}%`
        };

        return (
            <div>
                <h4>{this.state.progress.status}</h4>
                <div className="bel-progress">
                    <div className="bel-progress-bar bel-teama" style={style}></div>
                </div>
            </div>
        );
    }

    generateSummary() {
        this.state.step = 1;
        window.BattleEye.generateSummary();

        window.BattleEye.events.on('summary.update', step => {
            this.state.progress.status = `Fetched round ${step}`;
            this.state.progress.current = step;
        });

        window.BattleEye.events.on('summary.finished', ([left, right, rounds]) => {
            this.state.progress.status = 'Data fetching done. Organizing data';

            this.data.left = left;
            this.data.right = right;
            this.data.rounds = rounds;

            this.state.step = 2;
        });
    }

    hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    intToRGB(i) {
        var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

        return '00000'.substring(0, 6 - c.length) + c;
    }

    getStats(side) {
        var content = [];
        var countries = [];

        // console.log(this.state.tab);

        if (this.state.tab.startsWith('round')) {
            var round = parseInt(this.state.tab.replace(/^\D+/g, ''));
            if (this.state.division.startsWith('div')) {
                countries = this.data.rounds[round][side].divisions[this.state.division].countries;
            } else {
                countries = this.data.rounds[round][side].countries;
            }
        } else if (this.state.division.startsWith('div')) {
            countries = this.data[side].divisions[this.state.division].countries;
        } else {
            countries = this.data[side].countries;
        }

        var chdata = [];
        var chlabels = [];
        var chcolors = [];
        for (const i in countries) {
            const c = countries[i];
            chdata.push(c.damage);
            chlabels.push(c.name);
            chcolors.push(this.intToRGB(this.hashCode(i)));
        }

        if (window.BattleEyeSettings.showDamageGraph.value) {
            const googleImg = `https://chart.googleapis.com/chart?chds=a&cht=p&chd=t:${chdata.join(',')}&chs=440x300&chco=${chcolors.join('|')}&chl=${chlabels.join('|')}`;
            content.push(<div>
                <img src={googleImg}/>
            </div>);
        }

        for (const i in countries) {
            const c = countries[i];

            content.push(
                <div>
                    <If test={side == 'right'}>
                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <If test={side != 'right'}>
                        <span style={{ float: 'left' }} className="bel-stat-spacer"><span className="tooltip-damage bel-value">{c.damage.toLocaleString()}</span></span>
                        <span style={{ float: 'left' }} className="bel-stat-spacer"><span className="tooltip-kills bel-value">{c.kills.toLocaleString()}</span></span>
                    </If>
                    <b className="bel-color-belize">{c.name}</b>
                    <If test={side == 'left'}>

                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <If test={side != 'left'}>
                        <span style={{ float: 'right' }} className="bel-stat-spacer"><span className="tooltip-damage bel-value">{c.damage.toLocaleString()}</span></span>
                        <span style={{ float: 'right' }} className="bel-stat-spacer"><span className="tooltip-kills bel-value">{c.kills.toLocaleString()}</span></span>
                    </If>
                    <hr className="bel" />
                </div>
            );
        }

        return content;
    }

    getRoundButtons() {
        var tabs = [['overall', 'Battle Total']];

        for (var i = 1; i <= SERVER_DATA.zoneId; i++) {
            tabs.push([`round${i}`, `Round ${i}`]);
        }

        tabs.push(['export', 'Export data', 'bel-btn bel-btn-inverse']);

        return tabs;
    }

    exportData(type) {
        window.BattleEye.exportStats(type, this.data);
    }

    getDivisionButtons() {
        var tabs = [
            ['overall', 'Round Total'],
            ['div1', 'DIV1'],
            ['div2', 'DIV2'],
            ['div3', 'DIV3'],
            ['div4', 'DIV4']
        ];

        return tabs;
    }

    changeRound(tab) {
        this.setState({
            tab: tab
        });
    }

    changeDivision(tab) {
        this.setState({
            division: tab
        });
    }

    renderSummary() {
        return (
            <div>
                <TabSelector changeTab={this.changeRound.bind(this)} tab={this.state.tab} buttons={this.getRoundButtons()} />
                <If test={this.state.tab != 'export'}>
                    <TabSelector changeTab={this.changeDivision.bind(this)} tab={this.state.division} buttons={this.getDivisionButtons()} />
                    <div className="bel-country-list">

                        <div className="bel-col-1-2 text-right">
                            {this.getStats('left')}
                        </div>
                        <div className="bel-col-1-2 text-left">
                            {this.getStats('right')}
                        </div>
                    </div>
                </If>

                <If test={this.state.tab == 'export'}>
                    <button onClick={this.exportData.bind(this, 'excel')} className="bel-btn bel-btn-info bel-margin-r-10">Generate EXCEL file</button>
                </If>
            </div>
        );
    }

    getFlagStyle(c) {
        return {
            backgroundImage: `url('/images/flags_png/L/${c}.png')`,
            backgroundPosition: '-4px -4px'
        };
    }

    render() {
        if (this.props.tab != 'summary') {
            return null;
        }

        switch (this.state.step) {
        case 0:
            return this.renderIndex();
        case 1:
            return this.renderProgress();
        case 2:
            return this.renderSummary();
        default:
            return null;
        }
    }
}