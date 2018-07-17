// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Raideer
// @homepage    https://battleeye.raideer.xyz/
// @description Live battle statistics for eRepublik
// @include     http*://www.erepublik.com/*/military/battlefield/*
// @version     2.0.5
// @run-at      document-idle
// @grant       none
// @updateURL   https://cdn.raideer.xyz/battleeye.user.js
// @icon        https://cdn.raideer.xyz/icons/icon@2x.png
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