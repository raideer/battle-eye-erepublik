export default class Dps {
    constructor() {
        this.dps = 0;

        // Defining properties that are hidden during enumeration
        Object.defineProperty(this, '_rememberKillFor', {
            value: 10,
            writable: true
        });

        Object.defineProperty(this, '_recentDamage', {
            value: [],
            writable: true
        });

        Object.defineProperty(this, '_hitStreakSeconds', {
            value: 0,
            writable: true
        });

        Object.defineProperty(this, '_lastHitTime', {
            value: 0,
            writable: true
        });
    }

    dpsRegisterKill(damage, time) {
        this._lastHitTime = time;
        this._recentDamage.push({ damage, time });
    }

    updateDps(currentSecond) {
        this._recentDamage = this._recentDamage.filter(data => {
            return (currentSecond - data.time) <= this._rememberKillFor;
        });

        if (this._hitStreakSeconds < this._rememberKillFor) {
            this._hitStreakSeconds++;
        }

        const recentDamage = this._recentDamage.reduce((sum, value) => {
            return sum + value.damage;
        }, 0);

        this.dps = recentDamage / this._hitStreakSeconds;

        // Resetting dps if no kills have been done for the last 10 seconds
        if (currentSecond - this._lastHitTime >= 10) {
            this._recentDamage = [];
            this._hitStreakSeconds = 0;
        }
    }
}
