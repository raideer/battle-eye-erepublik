import DivisionTab from './DivisionTab';
import CountriesTab from './CountriesTab';
import OverallTab from './OverallTab';
import SummaryTab from './SummaryTab';

export default class Tabs extends React.Component{
    renderDivisions(){
        if(!this.props.data){
            return null;
        }

        var divs = [];
        var divInfo = [];

        if(SERVER_DATA.division == 11){
            divInfo = [[11,'Air Division']];
        }else{
            divInfo = [[1,'Division 1'], [2,'Division 2'], [3,'Division 3'], [4,'Division 4']];
        }

        var divData = {};
        for(var d in divInfo){
            if(!window.BattleEyeSettings.showOtherDivs.value){
                if(divInfo[d][0] != SERVER_DATA.division){
                    continue;
                }
            }

            if(!window.BattleEyeSettings.showDiv1.value && divInfo[d][0] == 1){
                continue;
            }

            if(!window.BattleEyeSettings.showDiv2.value && divInfo[d][0] == 2){
                continue;
            }

            if(!window.BattleEyeSettings.showDiv3.value && divInfo[d][0] == 3){
                continue;
            }

            if(!window.BattleEyeSettings.showDiv4.value && divInfo[d][0] == 4){
                continue;
            }

            divData = {
                left: this.props.data.left.divisions['div' + divInfo[d][0]],
                right: this.props.data.right.divisions['div' + divInfo[d][0]]
            };

            divs.push(<DivisionTab tab={this.props.tab} data={divData} div={divInfo[d]}/>);
        }

        return divs;
    }

    // renderOverall(){
    //     var data = {};
    //     data.left = this.props.data.left;
    //     data.right = this.props.data.right;
    //
    //     return (
    //         <OverallTab tab={this.props.tab} data={data} />
    //     );
    // }

    renderCountries(){
        var data = {};
        data.left = this.props.data.left;
        data.right = this.props.data.right;

        return (
            <CountriesTab tab={this.props.tab} data={data} />
        );
    }

    renderSummary(){
        return (
            <SummaryTab tab={this.props.tab}/>
        );
    }

    getContent(){
        return (
            <div>
                {this.renderDivisions()}
                {this.renderCountries()}
                {this.renderSummary()}
            </div>
        );
        // if(this.props.tab == 'div'){
        //     return this.renderDivisions();
        // }else if(this.props.tab == 'overall'){
        //     return this.renderOverall();
        // }else if(this.props.tab == 'countries'){
        //     return this.renderCountries();
        // }else if(this.props.tab == 'summary'){
        //     return this.renderSummary();
        // }
    }

    render(){
        return (
            <div className="bel-grid">
                {this.getContent()}
            </div>
        );
    }
}
