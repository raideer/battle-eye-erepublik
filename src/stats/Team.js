import Dps from './Dps';
import Division from './Division';
import Collection from '../Collection';

export default class Team extends Dps {
    constructor(id, name) {
        super();
        this.id = id;
        this.name = name;
        this.revolution = false;
        this.damage = 0;
        this.kills = 0;
        this.countries = new Collection();
        this.divisions = new Collection([
            [1, new Division()],
            [2, new Division()],
            [3, new Division()],
            [4, new Division()],
            [11, new Division()]
        ]);
    }

    handle(data, currentSecond) {
        this.kills++;
        this.damage += data.msg.damage;

        const countryData = this.countries.get(data.msg.permalink) || { damage: 0, kills: 0 };
        countryData.damage += data.msg.damage;
        countryData.kills++;
        this.countries.set(data.msg.permalink, countryData);

        this.dpsRegisterKill(data.msg.damage, currentSecond);
        this.divisions.forEach(div => div.handle(data, currentSecond));

        console.log(this);
    }
}
