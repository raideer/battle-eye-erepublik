import React from 'react';
import ReactDOM from 'react-dom';
import Template from './layout/Template';
import MiniMonitor from './layout/MiniMonitor';
import BattleEye from '../BattleEye';

export default class Layout {
    constructor(headerData) {
        this.headerData = headerData;

        this.battleEye = document.createElement('div');
        this.battleEye.setAttribute('id', 'battleeye__live');

        this.miniMonitor = document.createElement('div');
        this.miniMonitor.setAttribute('id', 'battleeye__minimonitor');

        if (window.BattleEyeSettings.moveToTop.value) {
            $j('#content').prepend(this.battleEye);
        } else {
            $j('#content').append(this.battleEye);
        }

        $j('#battleConsole').append(this.miniMonitor);
    }

    update(feedData) {
        const data = {
            feedData,
            loading: BattleEye.loading
        };

        ReactDOM.render(<Template {...data} />, this.battleEye);
        ReactDOM.render(<MiniMonitor {...data} />, this.miniMonitor);
    }
}
