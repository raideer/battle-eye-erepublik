import { takeRight } from '../Utils';

export const DpsStats = superclass => class extends superclass {
    constructor() {
        super();
        this.stats.dps = 0;
        this.stats.highestDps = 0;
        this.stats.recentFighters = {};
        this.stats.recentFightersCount = 0;
        this.stats.damageHistory = [];

        this._rememberKillFor = 10;
        this._recentDamage = [];
        this._hitStreakSeconds = 0;
        this._lastHitTime = 0;
        this._recentFighterTimespan = 10;

        this.handlers.push(data => {
            this._lastHitTime = window.BattleEye.second;
            this._recentDamage.push({ damage: data.msg.damage, time: window.BattleEye.second });
            this.stats.recentFighters[data.msg.citizenId] = window.BattleEye.second;
        });
    }

    updateDps(currentSecond) {
        this._recentDamage = this._recentDamage.filter(data => {
            return (currentSecond - data.time) <= this._rememberKillFor;
        });

        const filtered = Object.keys(this.stats.recentFighters)
        .filter(key => {
            return (currentSecond - this.stats.recentFighters[key]) <= this._recentFighterTimespan;
        })
        .reduce((ob, key) => {
            ob[key] = this.stats.recentFighters[key];
            return ob;
        }, {});

        this.stats.recentFighters = filtered;

        if (this._hitStreakSeconds < this._rememberKillFor) {
            this._hitStreakSeconds++;
        }

        const recentDamage = this._recentDamage.reduce((sum, value) => {
            return sum + value.damage;
        }, 0);

        this.stats.dps = Math.round(recentDamage / this._hitStreakSeconds);
        if (this.stats.dps > this.stats.highestDps) {
            this.stats.highestDps = this.stats.dps;
        }

        // Resetting dps if no kills have been done for the last 10 seconds
        if (currentSecond - this._lastHitTime >= this._rememberKillFor) {
            this._recentDamage = [];
            this._hitStreakSeconds = 0;
        }

        this.stats.recentFightersCount = Object.keys(this.stats.recentFighters).length;

        this.stats.damageHistory.push({
            damage: this.stats.damage,
            kills: this.stats.hits,
            dps: this.stats.dps,
            activeFighters: this.stats.recentFightersCount,
            time: currentSecond
        });

        this.stats.damageHistory = takeRight(this.stats.damageHistory, 100);
    }
};

