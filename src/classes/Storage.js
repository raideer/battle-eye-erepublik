class Storage{
    constructor(){
        var self = this;
        if(!self.checkIfStorageAvailable()){
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
        self.defaults = {};
    }

    set(id, value){
        var self = this;
        localStorage.setItem(`${self.prepend}${id}`, value);
        // if(settings.enableLogging.value){
            console.log(`[BATTLEEYE] ${self.prepend}${id} = ${value}`);
        // }
    }

    get(id){
        var self = this;
        var val = localStorage.getItem(`${self.prepend}${id}`);

        switch(val){
            case 'true':
                val = true;
                break;
            case 'false':
                val = false;
                break;
        }

        return val;
    }

    has(field){
        var self = this;
        if(localStorage.getItem(`${self.prepend}${field}`)){
            return true;
        }

        return false;
    }

    define(id, value, group, name, desc){
        var self = this;

        self.defaults[id] = {
            id, name, desc, group, value
        }
    }

    loadSettings(){
        var self = this;

        for(var i in self.defaults){
            var field = self.defaults[i];

            if(self.fields[i] === undefined){
                self.fields[i] = {
                    id: field.id,
                    name: field.name,
                    desc: field.desc,
                    group: field.group
                };
            }

            if(!self.has(i)){
                self.set(i, field.value);
            }
        }
    }

    loadDefaults(){
        var self = this;

        for(var i in self.defaults){
            self.set(i, self.defaults[i].value);
        }
    }

    getAll(){
        var self = this;

        var object = {};

        for(var i in self.fields){
            var f = self.fields[i];

            object[i] = {field: f, value: self.get(f.id)};
        }

        return object;
    }

    checkIfStorageAvailable(){
        return (typeof(Storage) !== "undefined");
    }
}
