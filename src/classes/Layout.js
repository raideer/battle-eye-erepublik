import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Template from './layout/Template';
import MiniMonitor from './layout/MiniMonitor';
import $ from 'jQuery';

export default class Layout {
    constructor() {
        this.battleEye = document.createElement('div');
        this.battleEye.setAttribute('id', 'battleeye__live');

        this.miniMonitor = document.createElement('div');
        this.miniMonitor.setAttribute('id', 'battleeye__minimonitor');

        if (window.BattleEyeStorage.get('moveToTop')) {
            this.battleEye.classList.add('battleeye--above');
            $('#content').prepend(this.battleEye);
        } else {
            $('#content').append(this.battleEye);
        }

        $('#battleConsole').append(this.miniMonitor);
    }

    render() {
        ReactDOM.render(<Provider store={window.BattleEye.store}><Template /></Provider>, this.battleEye);
        ReactDOM.render(<Provider store={window.BattleEye.store}><MiniMonitor /></Provider>, this.miniMonitor);
    }
}
