import StyleSheet from './Stylesheet';

import Template from './layout/Template';
import MiniMonitor from './layout/MiniMonitor';

export default class Layout{
    constructor(headerData){
        var self = this;
        self.headerData = headerData;
        self.canRender = true;

        var battleEye = document.createElement('div');
            battleEye.setAttribute('id', 'battle_eye_live');

        if(window.settings.moveToTop.value){
            $j('#content').prepend(battleEye);
        }else{
            $j('#content').append(battleEye);
        }

        $j('#battleConsole').append('<div id="bel-minimonitor"></div>')

        StyleSheet.load();

        window.BattleEye.events.emit('layout.ready', this);
    }

    update(feedData){
        if(!this.canRender) return;

        ReactDOM.render(<Template settings={window.settings} viewData={window.viewData} feedData={feedData} headerData={this.headerData} />, document.getElementById('battle_eye_live'));

        ReactDOM.render(<MiniMonitor settings={window.settings} feedData={feedData} />, document.getElementById('bel-minimonitor'));
    }
}
