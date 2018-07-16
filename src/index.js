import SettingsStorage from './classes/Storage';
import BattleEye from './BattleEye';
import './styles/battleeye.scss';

function defineDefaultSettings() {
    const define = settings => {
        for (const i in settings) {
            window.BattleEyeStorage.define(settings[i][0], settings[i][1]);
        }
    };

    const settings = [
        ['showDiv1', true],
        ['showDiv2', true],
        ['showDiv3', true],
        ['showDiv4', true],
        ['highlightDiv', true],
        ['showMiniMonitor', true],
        ['moveToTop', false],
        ['layoutUpdateRate', 1],
        ['enableLogging', false],
        ['enableBenchmarking', false],
        ['showBattleProgressbar', true],
        ['showTransitionAnimations', true]
    ];

    define(settings);
}

window.BattleEyeStorage = new SettingsStorage();
defineDefaultSettings();
window.BattleEyeStorage.loadSettings();

window.belLog = (...args) => {
    [].unshift.call(args, '[BE]');
    if (window.BattleEyeStorage.get('enableLogging')) {
        console.log.apply(undefined, args);
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
