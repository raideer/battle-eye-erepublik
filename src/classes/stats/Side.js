import { mix } from '../Utils';
import { DpsStats } from './DpsStats';
import { BaseStats } from './BaseStats';
import { CountryStats } from './CountryStats';
import { MuStats } from './MuStats';
import Division from './Division';

class Stats {
    constructor() {
        this.stats = {};
        this.handlers = [];
    }
}

export default class Side extends mix(Stats).with(BaseStats, CountryStats, MuStats, DpsStats) {
    constructor(sideId) {
        super();
        this.id = sideId;
        this.divisions = {};
        this.stats.divisions = {};

        [1, 2, 3, 4, 11].forEach(division => {
            this.divisions[division] = new Division(division);
            this.stats.divisions[division] = this.divisions[division].stats;
            this.handlers.push(this.divisions[division].handle.bind(this.divisions[division]));
        });
    }

    update(second) {
        this.updateDps(second);

        if (this.divisions) {
            for (const div in this.divisions) {
                this.divisions[div].updateDps(second);
            }
        }
    }

    updateMilitaryUnits(muData) {
        for (const id in this.stats.military_units) {
            const mu = this.stats.military_units[id];
            if (!mu.name && (mu.id in muData)) {
                mu.name = muData[mu.id].name;
                mu.avatar = muData[mu.id].avatar;
            }
        }

        for (const div in this.stats.division) {
            const division = this.stats.division[div];

            for (const id in division.military_units) {
                const mu = division.military_units[id];
                if (!mu.name && (mu.id in muData)) {
                    mu.name = muData[mu.id].name;
                    mu.avatar = muData[mu.id].avatar;
                }
            }
        }
    }

    handle(data) {
        if (this.id != data.side) return;

        this.handlers.forEach(handler => {
            if (typeof handler === 'function') {
                handler(data);
            }
        });
    }
}
