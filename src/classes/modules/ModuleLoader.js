import Module from './Module';

export default class ModuleLoader{
    constructor(){
        this.modules = {};
    }

    load(module){
        if(module instanceof Module){
            this.modules[module.name] = module;
            var settings = module.defineSettings();
            for(var i in settings){
                var s = settings[i];
                window.BattleEyeStorage.define(s[0], s[1], module.name, s[2], s[3]);
            }
        }
    }

    get(name){
        return this.modules[name];
    }

    run(){
        for(var i in this.modules){
            try{
                if(this.modules[i].autoload){
                    this.modules[i].run();
                }
            }catch(e){
                console.error(`Failed to run module ${i}!: ${e}`);
            }
        }
    }
}
