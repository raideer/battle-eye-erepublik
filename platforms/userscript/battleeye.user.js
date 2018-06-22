// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Industrials
// @homepage    http://bit.ly/BattleEye
// @description Live battle statistics for eRepublik
// @include     http*://www.erepublik.com/*/military/battlefield/*
// @version     2.0.3
// @run-at      document-idle
// @grant       none
// @noframes
// ==/UserScript==

(function battleeye() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.raideer.xyz/battleeye.js';
    var head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})();