import { mix } from '../Utils';
import { DpsStats } from './DpsStats';
import { BaseStats } from './BaseStats';
import { CountryStats } from './CountryStats';
import { MuStats } from './MuStats';

class Stats {
    constructor() {
        this.stats = {};
        this.handlers = [];
    }
}

export default class Division extends mix(Stats).with(BaseStats, CountryStats, MuStats, DpsStats) {
    constructor(div) {
        super();
        this.id = div;
    }

    handle(data) {
        if (this.id != data.division) return;
        this.handlers.forEach(handler => {
            if (typeof handler === 'function') {
                handler(data);
            }
        });
    }
}
