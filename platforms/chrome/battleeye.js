(function battleeye() {
    console.log('BattleEye for Chrome')
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://dl.dropbox.com/s/yvhqclpaat9erky/battleeye.js';
    var head = document.getElementsByTagName('head')[0];
    if (!head) return;
    head.appendChild(script);
})();