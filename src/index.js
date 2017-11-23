import SettingsStorage from './classes/Storage';
import BattleEye from './BattleEye';

function defineDefaultSettings(){
    var self = this;
    function define(settings){
        for(var i in settings){
            window.BattleEyeStorage.define.apply(window.BattleEyeStorage, settings[i]);
        }
    }

    var settings = [
        ['showOtherDivs', false, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below."],
        ['showDiv1', true, 'Structure', "Show DIV 1"],
        ['showDiv2', true, 'Structure', "Show DIV 2"],
        ['showDiv3', true, 'Structure', "Show DIV 3"],
        ['showDiv4', true, 'Structure', "Show DIV 4"],
        ['showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count"],
        ['showAverageDamage', false, 'Structure', "Show average damage dealt"],
        ['showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield"],
        ['showKills', false, 'Structure', "Show kills done by each division"],
        ['moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh'],
        ['gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time."],
        ['highlightDivision', true, 'Visual', "Highlight current division"],
        ['highlightValue', true, 'Visual', "Highlight winning side"],
        ['showDamageGraph', true, 'Structure', "Show damage pie charts", 'At the moment this feature is very unoptimized. May cause a preformance drop'],
        ['showDpsBar', true, 'Bars', "Show DPS bar"],
        ['showDamageBar', false, 'Bars', "Show Damage bar"],
        ['showDominationBar', true, 'Bars', "Show Domination bar"],
        ['largerBars', false, 'Bars', "Larger bars"],
        ['enableLogging', false, 'Other', "Enable logging to console"],
        ['enableBenchmarking', false, 'Other', "Enable performance logging to console"]
    ];

    define(settings);
}

window.BattleEyeStorage = new SettingsStorage();
defineDefaultSettings();
window.BattleEyeStorage.loadSettings();
window.BattleEyeSettings = window.BattleEyeStorage.getAll();

window.belLog = function(){
    [].unshift.call(arguments, '[BE]');
    if(window.BattleEyeSettings.enableLogging.value){
        console.log.apply(undefined, arguments);
    }
};

window.belTime = function(name){
    if(window.BattleEyeSettings.enableBenchmarking.value){
        console.time(name);
    }
};

window.belTimeEnd = function(name){
    if(window.BattleEyeSettings.enableBenchmarking.value){
        console.timeEnd(name);
    }
};

window.BattleEye = new BattleEye();
window.onload = () => {
    window.BattleEye.overridePomelo();
}
