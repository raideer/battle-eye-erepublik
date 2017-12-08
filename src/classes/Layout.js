import React from 'react';
import ReactDOM from 'react-dom';
import Template from './layout/Template';
import MiniMonitor from './layout/MiniMonitor';

export default class Layout {
    constructor(headerData) {
        this.headerData = headerData;

        this.battleEye = document.createElement('div');
        this.battleEye.setAttribute('id', 'battle_eye_live');

        this.miniMonitor = document.createElement('div');
        this.miniMonitor.setAttribute('id', 'bel-minimonitor');

        if (window.BattleEyeSettings.moveToTop.value) {
            $j('#content').prepend(this.battleEye);
        } else {
            $j('#content').append(this.battleEye);
        }

        $j('#battleConsole').append(this.miniMonitor);
    }

    update(feedData) {
        ReactDOM.render(
            <Template
                settings={window.BattleEyeSettings}
                feedData={feedData}
                headerData={this.headerData}
            />
            , this.battleEye);
        ReactDOM.render(
            <MiniMonitor
                settings={window.BattleEyeSettings}
                feedData={feedData}
            />
            , this.miniMonitor);
    }
}
