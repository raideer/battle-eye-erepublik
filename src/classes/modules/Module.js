class Module{
    constructor(name, description){
        var self = this;
        self.name = name;
        self.desc = description;
    }

    defineSettings(){
        return [];
    }

    run(settings){
        return null;
    }
}
