export default class Storage {
    constructor(prefix = 'battle_observer_') {
        this._ls = window.localStorage;
        this.prefix = prefix;
    }

    set(id, value) {
        this._ls.setItem(`${this.prefix}${id}`, value);
    }

    get(id) {
        const value = this._ls.getItem(`${this.prefix}${id}`);

        switch(value) {
            case 'true':
                return true;
            case 'false':
                return false;
        }

        return value;
    }

    has(id) {
        return this._ls.getItem(`${this.prefix}${id}`) !== null;
    }
}
