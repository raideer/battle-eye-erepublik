import DivisionTab from './DivisionTab';
import CountriesTab from './CountriesTab';
import SummaryTab from './SummaryTab';
import OtherTab from './OtherTab';
import React from 'react';

export default class Tabs extends React.Component {
    renderDivisions() {
        if (!this.props.data) {
            return null;
        }

        var divs = [];
        var divInfo = [];

        if (SERVER_DATA.division == 11) {
            divInfo = [[11, 'Air Division']];
        } else {
            divInfo = [[1, 'Division 1'], [2, 'Division 2'], [3, 'Division 3'], [4, 'Division 4']];
        }

        var divData = {};
        for (var d in divInfo) {
            if (!window.BattleEyeSettings.showOtherDivs.value) {
                if (divInfo[d][0] != SERVER_DATA.division) {
                    continue;
                }
            }

            if (!window.BattleEyeSettings.showDiv1.value && divInfo[d][0] == 1) {
                continue;
            }

            if (!window.BattleEyeSettings.showDiv2.value && divInfo[d][0] == 2) {
                continue;
            }

            if (!window.BattleEyeSettings.showDiv3.value && divInfo[d][0] == 3) {
                continue;
            }

            if (!window.BattleEyeSettings.showDiv4.value && divInfo[d][0] == 4) {
                continue;
            }

            divData = {
                left: this.props.data.left.divisions[`div${divInfo[d][0]}`],
                right: this.props.data.right.divisions[`div${divInfo[d][0]}`]
            };

            divs.push(<DivisionTab key={d} tab={this.props.tab} data={divData} div={divInfo[d]}/>);
        }

        return divs;
    }

    renderCountries() {
        return (
            <CountriesTab tab={this.props.tab} data={this.props.data} />
        );
    }

    renderSummary() {
        return (
            <SummaryTab tab={this.props.tab}/>
        );
    }

    renderOther() {
        return (
            <OtherTab tab={this.props.tab} data={this.props.data} />
        );
    }

    getContent() {
        return (
            <div>
                {this.renderDivisions()}
                {this.renderCountries()}
                {this.renderSummary()}
                {this.renderOther()}
            </div>
        );
    }

    render() {
        return (
            <div className="bel-grid">
                {this.getContent()}
            </div>
        );
    }
}
