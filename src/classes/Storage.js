export default class Storage {
    constructor() {
        if (!this.checkIfStorageAvailable()) {
            return false;
        }

        this.prepend = 'battle_eye_';
        this.fields = {};
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

    define(id, value, group, name, desc) {
        this.defaults[id] = {
            id, name, desc, group, value
        };
    }

    loadSettings() {
        for (const i in this.defaults) {
            const field = this.defaults[i];

            if (this.fields[i] === undefined) {
                this.fields[i] = {
                    id: field.id,
                    name: field.name,
                    desc: field.desc,
                    group: field.group
                };
            }

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

    getAll() {
        const object = {};

        for (const i in this.fields) {
            const f = this.fields[i];

            object[i] = { field: f, value: this.get(f.id) };
        }

        return object;
    }

    checkIfStorageAvailable() {
        return typeof Storage !== 'undefined';
    }
}
