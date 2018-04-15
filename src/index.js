import SettingsStorage from './classes/Storage';
import BattleEye from './BattleEye';
import './styles/battleeye.scss';

function defineDefaultSettings() {
    const define = settings => {
        for (const i in settings) {
            window.BattleEyeStorage.define(...settings[i]);
        }
    };

    const settings = [
        ['showDiv1', true, 'Structure', 'Show DIV 1'],
        ['showDiv2', true, 'Structure', 'Show DIV 2'],
        ['showDiv3', true, 'Structure', 'Show DIV 3'],
        ['showDiv4', true, 'Structure', 'Show DIV 4'],
        ['showMiniMonitor', true, 'Stats', 'Display a small division monitor on the battlefield'],
        ['showKills', false, 'Stats', 'Show kills done by each division'],
        ['moveToTop', false, 'Structure', 'Display BattleEye above the battlefield', '*Requires a page refresh'],
        ['enableLogging', false, 'Other', 'Enable logging to console'],
        ['enableBenchmarking', false, 'Other', 'Enable performance logging to console']
    ];

    define(settings);
}

window.BattleEyeStorage = new SettingsStorage();
defineDefaultSettings();
window.BattleEyeStorage.loadSettings();
window.BattleEyeSettings = window.BattleEyeStorage.getAll();

window.belLog = (...args) => {
    [].unshift.call(args, '[BE]');
    if (window.BattleEyeSettings.enableLogging.value) {
        console.log.apply(undefined, args);
    }
};

window.belTime = name => {
    if (window.BattleEyeSettings.enableBenchmarking.value) {
        console.time(name);
    }
};

window.belTimeEnd = name => {
    if (window.BattleEyeSettings.enableBenchmarking.value) {
        console.timeEnd(name);
    }
};

// erep Stuff++ event handler for get requests
if (window.ajaxSuccess) {
    belLog('Using stuff++ ajax listener');
} else {
    belLog('Defining ajax listener');
    window.ajaxSuccess = [];
    const send = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.send = function (...args) {
        this.addEventListener('load', () => {
            window.ajaxSuccess.forEach(listener => {
                if (typeof listener === 'function') {
                    try {
                        const data = JSON.parse(this.responseText);
                        listener(data, this.responseURL);
                    } catch (e) {
                        listener(this.responseText, this.responseURL);
                    }
                }
            });
        });

        send.apply(this, args);
    };
}

window.BattleEye = new BattleEye();
window.onload = () => {
    window.BattleEye.overridePomelo();
};
