export default class Module{
    constructor(name, description, autoload = true){
        var self = this;
        self.name = name;
        self.desc = description;
        self.autoload = autoload;
    }

    defineSettings(){
        return [];
    }

    run(settings){
        return null;
    }
}
