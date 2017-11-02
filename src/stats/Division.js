import Dps from './Dps';
import Collection from '../Collection';

export default class Division extends Dps {
    constructor() {
        super();
        this.kills = 0;
        this.damage = 0;
        this.countries = new Collection();
    }

    handle(data, currentSecond) {
        this.dpsRegisterKill(data.msg.damage, currentSecond);
    }
}
