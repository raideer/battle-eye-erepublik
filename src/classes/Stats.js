import DpsHandler from './DpsHandler';
import CountryStats from './CountryStats';
import Divisions from './Divisions';
import { takeRight } from 'lodash';

export default class Stats extends DpsHandler {
    constructor(id) {
        super(10);
        this.name = SERVER_DATA.countries[id];
        this.countries = new CountryStats();
        this.id = id;
        this.damage = 0;
        this.hits = 0;
        this.constructDivisions();
        this.revolution = false;
        this.defender = false;
        this.damageHistory = [];
    }

    constructDivisions() {
        this.divisions = new Divisions();
        [1, 2, 3, 4, 11].forEach(div => this.divisions.create(div));
    }

    isSide(side) {
        return this.id == side;
    }

    updateDps(timeData) {
        super.updateDps(timeData);
        this.divisions.updateDps(timeData);

        this.damageHistory.push({
            damage: this.damage,
            kills: this.hits,
            dps: this.dps,
            activeFighters: Object.keys(this._recentFighters).length,
            time: timeData
        });

        this.damageHistory = takeRight(this.damageHistory, 100);
    }

    handle(data) {
        if (!this.isSide(data.side)) {
            return;
        }

        this.divisions.handle(data);

        this.addHit(data.msg.damage, data.msg.citizenId);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    toObject() {
        return {
            damage: this.damage,
            id: this.id,
            dps: this.dps,
            damageHistory: this.damageHistory,
            highestDps: this.highestDps,
            hits: this.hits,
            avgHit: Math.round(this.damage / this.hits),
            divisions: this.divisions.toObject(),
            countries: this.countries.getAll(),
            countriesCount: this.countries.length,
            revolution: this.revolution,
            recentFighters: Object.keys(this._recentFighters).length
        };
    }
}
