import Utils from './Utils';

export default class CountryStats {
    constructor() {
        this.countries = {};
    }

    handle(data, addKill = true, addDamage = true) {
        const countrySlug = data.msg.permalink;

        if (!this.countries[countrySlug]) {
            this.countries[countrySlug] = {
                damage: 0,
                kills: 0,
                name: Utils.prettifyCountryName(countrySlug)
            };
        }

        if (addDamage) {
            this.countries[countrySlug].damage += data.msg.damage;
        }

        if (addKill) {
            this.countries[countrySlug].kills += 1;
        }
    }

    get length() {
        return Object.keys(this.countries).length;
    }

    handleBare(data) {
        const ob = {
            msg: {
                permalink: '',
                damage: 0
            }
        };

        ob.msg.damage = data.damage;
        ob.msg.permalink = data.permalink;

        this.handle(ob, false);
    }

    handleKills(country, value) {
        if (!this.countries[country]) {
            this.countries[country] = {
                damage: 0,
                kills: 0
            };
        }

        this.countries[country].kills += value;
    }

    getAll() {
        const sorted = {};

        const keysSorted = Object.keys(this.countries).sort((a, b) => {
            return this.countries[b].damage - this.countries[a].damage;
        });

        for (const i in keysSorted) {
            const key = keysSorted[i];
            sorted[key] = this.countries[key];
        }

        return sorted;
    }
}
