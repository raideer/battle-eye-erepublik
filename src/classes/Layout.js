import StyleSheet from './Stylesheet';
import React from 'react';
import ReactDOM from 'react-dom';
import Template from './layout/Template';
import MiniMonitor from './layout/MiniMonitor';

export default class Layout{
    constructor(headerData){
        var self = this;
        self.headerData = headerData;

        this.battleEye = document.createElement('div');
        this.battleEye.setAttribute('id', 'battle_eye_live');

        this.miniMonitor = document.createElement('div');
        this.miniMonitor.setAttribute('id', 'bel-minimonitor');

        if(window.BattleEyeSettings.moveToTop.value){
            $j('#content').prepend(this.battleEye);
        }else{
            $j('#content').append(this.battleEye);
        }


        $j('#battleConsole').append(this.miniMonitor);

        StyleSheet.load();

        window.BattleEye.events.emit('layout.ready', this);
        // this.minimonitor = document.getElementById('bel-minimonitor');
        // this.bel = document.getElementById('battle_eye_live');
    }

    update(feedData){
        ReactDOM.render(<Template settings={window.BattleEyeSettings} viewData={window.viewData} feedData={feedData} headerData={this.headerData} />, this.battleEye);
        ReactDOM.render(<MiniMonitor settings={window.BattleEyeSettings} feedData={feedData} />, this.miniMonitor);
    }
}
