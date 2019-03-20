import SettingsStorage from './classes/Storage';
import BattleEye from './BattleEye';
import './styles/battleeye.scss';

import $ from 'jQuery';

$('head').append(`
<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,700" rel="stylesheet"> 
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/solid.css" integrity="sha384-VGP9aw4WtGH/uPAOseYxZ+Vz/vaTb1ehm1bwx92Fm8dTrE+3boLfF1SpAtB1z7HW" crossorigin="anonymous">
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/fontawesome.css" integrity="sha384-1rquJLNOM3ijoueaaeS5m+McXPJCGdr5HcA03/VHXxcp2kX2sUrQDmFc3jR5i/C7" crossorigin="anonymous">
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/xlsx-populate@1.19.1/browser/xlsx-populate.min.js"></script>
`);

window.BattleEyeStorage = new SettingsStorage();

[
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
    ['showTransitionAnimations', true],
    ['topDiv', true],
    ['fixedHeight', false],
    ['battleeyeHeight', 400]
].forEach(setting => {
    window.BattleEyeStorage.define(setting[0], setting[1]);
});

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
