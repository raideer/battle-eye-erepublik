import { countryPermalinkToName } from '../Utils';

export const CountryStats = superclass => class extends superclass {
    constructor() {
        super();
        this.stats.countriesCount = 0;
        this.stats.countries = {};

        this.handlers.push(data => {
            const permalink = data.msg.permalink;

            if (!this.stats.countries[permalink]) {
                this.stats.countries[permalink] = {
                    damage: 0,
                    kills: 0,
                    name: countryPermalinkToName(permalink)
                };
            }

            this.stats.countries[permalink].damage += data.msg.damage;
            this.stats.countries[permalink].kills += 1;
            this.stats.countriesCount = Object.keys(this.stats.countries).length;
        });
    }
};

