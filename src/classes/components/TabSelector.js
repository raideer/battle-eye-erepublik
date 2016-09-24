class TabSelector extends React.Component{
    getButtons(){
        var buttons = [];

        for(var i in this.props.buttons){
            var a = this.props.buttons[i];
            buttons.push(<button data-tab={a[0]} onClick={this.props.changeTab.bind(this, a[0])} className={this.getStyle(a[0])}>{a[1]}</button>);
        }

        return buttons;
    }

    getStyle(tab){
        if(this.props.tab == tab){
            return "bel-btn bel-btn-default";
        }

        return "bel-btn bel-btn-grey";
    }

    render(){
        return (
            <div className="bel-tabs">
                {this.getButtons()}
            </div>
        );
    }
}
