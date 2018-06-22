(function battleeye() {
    console.log('BattleEye for Firefox')
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdn.raideer.xyz/battleeye.js';
    var head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})();