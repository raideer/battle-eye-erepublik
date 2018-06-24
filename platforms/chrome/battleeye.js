/*
	All code is publicly available at:
	https://github.com/raideer/battle-eye-erepublik
	This script is solely an injector for the actual script,
	which is being appended into the document head on
	*://*.erepublik.com/military/battlefield/*
	No injection is made into the Chrome context.
*/
(function battleeye() {
  console.log('BattleEye for Chrome')
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://cdn.raideer.xyz/battleeye.js';
  var head = document.getElementsByTagName('head')[0];
  if (!head) return;
  head.appendChild(script);
})();