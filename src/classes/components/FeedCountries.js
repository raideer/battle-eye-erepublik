class FeedCountries extends React.Component{
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

    getStats(side){
        var content = [];
        var countries = [];

        if(this.state.tab == 'overall'){
            countries = this.props.data[side].countries;
        }else{
            countries = this.props.data[side].divisions[this.state.tab].countries;
        }

        for(var i in countries){
            var c = countries[i];
            content.push(
                <div>
                    <If test={side == "right"}>
                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <b>{i}</b>: {c.damage.toLocaleString()}
                    <If test={side == "left"}>
                        <div style={this.getFlagStyle(i)} className="bel-country"></div>
                    </If>
                    <hr className="bel" />
                </div>
            );
        }

        return content;
    }

    getTabButtons(){
        return [
            ['overall', 'Total'],
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
        return (
            <div>
                <TabSelector changeTab={this.changeTab.bind(this)} tab={this.state.tab} buttons={this.getTabButtons()} />
                <div id="bel-country-list">
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
