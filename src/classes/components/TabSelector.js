class TabSelector extends React.Component{

    getStyle(tab){
        if(this.props.tab == tab){
            return "bel-btn bel-btn-default";
        }

        return "bel-btn bel-btn-grey";
    }

    render(){
        return (
            <div className="bel-tabs">
                <button onClick={this.props.changeTab.bind(this, 'div')} className={this.getStyle('div')}>Divisions</button>
                <button onClick={this.props.changeTab.bind(this, 'overall')} className={this.getStyle('overall')}>Overall</button>
            </div>
        );
    }
}
