import BattleObserver from './BattleObserver';
// import ClientSettings from './client-settings.json';

console.log('BO entry');

window.BattleObserver = new BattleObserver();

window.onload = () => {
    window.BattleObserver.run();
};
