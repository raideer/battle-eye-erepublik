class Storage{
    constructor(){
        var self = this;
        if(!self.checkIfStorageAvailable()){
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
    }

    set(id, value){
        var self = this;
        localStorage.setItem(`${self.prepend}${id}`, value);
        console.log(`${self.prepend}${id} = ${value}`);
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

        if(self.fields[id] === undefined){
            self.fields[id] = {
                id, name, desc, group
            }
        }

        if(!self.has(id)){
            self.set(id, value);
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
