import DpsHandler from './DpsHandler';
import CountryStats from './CountryStats';
import { takeRight } from './Utils';

export default class DivisionStats extends DpsHandler {
    constructor(division) {
        super(10);
        this.division = division;
        this.hits = 0;
        this.damage = 0;
        this.countries = new CountryStats();
        this.damageHistory = [];
    }

    handle(data) {
        if (data.division != this.division) {
            return;
        }

        this.addHit(data.msg.damage, data.msg.citizenId);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    updateDps(timeData) {
        super.updateDps(timeData);

        this.damageHistory.push({
            damage: this.damage,
            kills: this.hits,
            dps: this.dps,
            activeFighters: Object.keys(this._recentFighters).length,
            time: timeData
        });

        this.damageHistory = takeRight(this.damageHistory, 100);
    }

    toObject() {
        return {
            damage: this.damage,
            id: this.id,
            dps: this.dps,
            damageHistory: this.damageHistory,
            highestDps: this.highestDps,
            hits: this.hits,
            avgHit: Math.round(this.damage / this.hits) | 0,
            countries: this.countries.getAll(),
            countriesCount: this.countries.length,
            recentFighters: Object.keys(this._recentFighters).length
        };
    }
}
