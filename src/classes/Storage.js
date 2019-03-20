export default class Storage {
    constructor() {
        if (!this.checkIfStorageAvailable()) {
            return false;
        }

        this.prepend = 'battle_eye2_';
        this.defaults = {};
        this.items = {};
    }

    set(id, value) {
        localStorage.setItem(`${this.prepend}${id}`, value);
        this.items[id] = value;
    }

    clear(id) {
        localStorage.removeItem(`${this.prepend}${id}`);
    }

    get(id, force = false) {
        if (this.items[id] && !force) {
            return this.items[id];
        }

        let val = localStorage.getItem(`${this.prepend}${id}`);

        switch (val) {
        case 'true':
            val = true;
            break;
        case 'false':
            val = false;
            break;
        }

        return val;
    }

    has(id) {
        if (this.items[id]) {
            return true;
        }

        if (localStorage.getItem(`${this.prepend}${id}`)) {
            return true;
        }

        return false;
    }

    define(id, value) {
        this.defaults[id] = {
            id, value
        };
    }

    loadSettings() {
        for (const i in this.defaults) {
            const def = this.defaults[i];
            const field = this.get(i);

            if (field !== null && field !== undefined) {
                this.items[i] = field;
            } else {
                this.items[i] = def.value;
                this.set(i, def.value);
            }
        }
    }

    loadDefaults() {
        for (const i in this.defaults) {
            this.set(i, this.defaults[i].value);
            this.items[i] = this.defaults[i].value;
        }
    }

    checkIfStorageAvailable() {
        return typeof Storage !== 'undefined';
    }
}
