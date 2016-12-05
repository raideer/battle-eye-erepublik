import If from '../If';
import TabSelector from './TabSelector';

export default class CountriesTab extends React.Component{
    constructor(){
        super();

        this.state = {
            tab: 'overall'
        };
    }
    getFlagStyle(c){
        return {
            backgroundImage: `url('/images/flags_png/L/${c}.png')`,
            backgroundPosition: "-4px -4px"
        };
    }

    hashCode(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    }

    intToRGB(i){
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    getStats(side){
        var content = [];
        var countries = [];

        // console.log(this.state.tab);
        if(this.state.tab == 'overall'){
            countries = this.props.data[side].countries;
        }else{
            countries = this.props.data[side].divisions[this.state.tab].countries;
        }

        var chdata = [];
        var chlabels = [];
        var chcolors = [];
        for(var i in countries){
            var c = countries[i];
            chdata.push(c.damage);
            chlabels.push(i);
            chcolors.push(this.intToRGB(this.hashCode(i)));
        }

        var googleImg = 'https://chart.googleapis.com/chart?chds=a&cht=p&chd=t:'+chdata.join(',')+'&chs=440x300&chco='+chcolors.join('|')+'&chl='+chlabels.join('|');
        content.push(<div>
            <img src={googleImg}/>
        </div>);

        for(var i in countries){
            var c = countries[i];

            content.push(
                <div>
                    <If test={side == "right"}>
                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <If test={side != "right"}>
                        <span style={{float:'left'}} className="bel-stat-spacer"><span className="tooltip-damage bel-value">{c.damage.toLocaleString()}</span></span>
                        <span style={{float:'left'}} className="bel-stat-spacer"><span className="tooltip-kills bel-value">{c.kills.toLocaleString()}</span></span>
                    </If>
                    <b className="bel-color-belize">{i}</b>
                    <If test={side == "left"}>
                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <If test={side != "left"}>
                        <span style={{float:'right'}} className="bel-stat-spacer"><span className="tooltip-damage bel-value">{c.damage.toLocaleString()}</span></span>
                        <span style={{float:'right'}} className="bel-stat-spacer"><span className="tooltip-kills bel-value">{c.kills.toLocaleString()}</span></span>
                    </If>
                    <hr className="bel" />
                </div>
            );
        }

        return content;
    }

    componentDidUpdate(){
        this.attachTooltip();
    }

    componentDidMount(){
        this.attachTooltip();
    }

    attachTooltip(){
        $j('.tooltip-kills').attr('original-title', 'Kills').tipsy();
        $j('.tooltip-damage').attr('original-title', 'Damage').tipsy();
    }

    getTabButtons(){
        return [
            ['overall', 'Round Total'],
            ['div1', 'DIV1'],
            ['div2', 'DIV2'],
            ['div3', 'DIV3'],
            ['div4', 'DIV4']
        ];
    }

    changeTab(tab){
        this.setState({
            'tab': tab
        });
    }

    render(){
        if(this.props.tab != 'countries'
            && this.props.tab != 'div1'
            && this.props.tab != 'div2'
            && this.props.tab != 'div3'
            && this.props.tab != 'div4'
        ){
            return null;
        }

        return (
            <div>
                <TabSelector changeTab={this.changeTab.bind(this)} tab={this.state.tab} buttons={this.getTabButtons()} />
                <div className="bel-country-list">
                    <div className="bel-col-1-2 text-right">
                        {this.getStats('left')}
                    </div>
                    <div className="bel-col-1-2 text-left">
                        {this.getStats('right')}
                    </div>
                </div>
            </div>
        );
    }
}
