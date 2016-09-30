import Module from './Module';

export default class BattleHistory extends Module{
    constructor(){
        super('Battle History', 'Displays recent battles where you have fought');
    }

    defineSettings(){
        return [
            ['battleHistoryEnabled', true, 'Enable Battle History', 'Displays recent battles where you have fought']
        ];
    }

    run(){
        if(!storage.has('battleHistoryData')){
            storage.set('battleHistoryData', []);
        }

        $j('#pvp .battle_footer .footer_menu').append('<a id="bel-battle-history" original-title="Battle History" href="javascript: void(0);">Battle History</a>');
        $j('#bel-battle-history').tipsy({gravity: 's'});
    }
}
