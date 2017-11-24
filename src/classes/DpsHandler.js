export default class DpsHandler {
    constructor(rem) {
        this.dps = 0;

        this._rememberKillFor = rem;
        this._recentDamage = [];
        this._hitStreakSeconds = 0;
        this._lastHitTime = 0;

        this._recentFighterTimespan = rem;
        this._recentFighters = {};
    }

    addHit(damage, citizenId) {
        this._lastHitTime = window.BattleEye.second;
        this._recentDamage.push({ damage, time: window.BattleEye.second });
        this._recentFighters[citizenId] = window.BattleEye.second;
    }

    updateDps(currentSecond) {
        this._recentDamage = this._recentDamage.filter(data => {
            return (currentSecond - data.time) <= this._rememberKillFor;
        });

        const filtered = Object.keys(this._recentFighters)
        .filter(key => {
            return (currentSecond - this._recentFighters[key]) <= this._recentFighterTimespan;
        })
        .reduce((ob, key) => {
            ob[key] = this._recentFighters[key];
            return ob;
        }, {});

        this._recentFighters = filtered;

        if (this._hitStreakSeconds < this._rememberKillFor) {
            this._hitStreakSeconds++;
        }

        const recentDamage = this._recentDamage.reduce((sum, value) => {
            return sum + value.damage;
        }, 0);

        this.dps = Math.round(recentDamage / this._hitStreakSeconds);

        // Resetting dps if no kills have been done for the last 10 seconds
        if (currentSecond - this._lastHitTime >= this._rememberKillFor) {
            this._recentDamage = [];
            this._hitStreakSeconds = 0;
        }
    }
}
