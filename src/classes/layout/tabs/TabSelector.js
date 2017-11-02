import React from 'react';

export default class TabSelector extends React.Component{
    getButtons(){
        var buttons = [];

        for(var i in this.props.buttons){
            var a = this.props.buttons[i];
            var cls = (a[2])?this.getStyle(a[0], a[2]):this.getStyle(a[0]);
            buttons.push(
                <button
                    key={i}
                    data-tab={a[0]}
                    onClick={this.props.changeTab.bind(this, a[0])}
                    className={cls}
                    >
                {a[1]}
                </button>
            );
        }

        return buttons;
    }

    getStyle(tab, def = "bel-btn bel-btn-grey"){
        if(this.props.tab == tab){
            return "bel-btn bel-btn-default";
        }

        return def;
    }

    render(){
        return (
            <div className="bel-tabs">
                {this.getButtons()}
            </div>
        );
    }
}
