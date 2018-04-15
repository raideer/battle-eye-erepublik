export default class Storage {
    constructor() {
        if (!this.checkIfStorageAvailable()) {
            return false;
        }

        this.prepend = 'battle_eye2_';
        this.defaults = {};
    }

    set(id, value) {
        localStorage.setItem(`${this.prepend}${id}`, value);
    }

    get(id) {
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

    has(field) {
        if (localStorage.getItem(`${this.prepend}${field}`)) {
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
            const field = this.defaults[i];

            if (!this.has(i)) {
                this.set(i, field.value);
            }
        }
    }

    loadDefaults() {
        for (const i in this.defaults) {
            this.set(i, this.defaults[i].value);
        }
    }

    checkIfStorageAvailable() {
        return typeof Storage !== 'undefined';
    }
}
