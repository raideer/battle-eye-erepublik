import DivisionStats from './DivisionStats';

export default class Divisions {
    constructor() {
        this.divisions = {};
    }

    create(division) {
        this.divisions[division] = new DivisionStats(division);
        return this.divisions[division];
    }

    get(id) {
        return this.divisions[id];
    }

    handle(data) {
        for (const i in this.divisions) {
            this.divisions[i].handle(data);
        }
    }

    updateDps(time) {
        for (const i in this.divisions) {
            this.divisions[i].updateDps(time);
        }
    }

    toObject() {
        var object = {};
        for (var i in this.divisions) {
            object[i] = this.divisions[i].toObject();
        }

        return object;
    }
}
