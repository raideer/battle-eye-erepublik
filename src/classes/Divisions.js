class Divisions{
    constructor(){
        var self = this;
        this.divisions = {};
    }

    create(id, division){
        this.divisions[id] = new DivisionStats(division);
        return this.divisions[id];
    }

    get(id){
        return this.divisions[id];
    }

    handle(data){
        for(var i in this.divisions){
            this.divisions[i].handle(data);
        }
    }

    updateDps(time){
        for(var i in this.divisions){
            this.divisions[i].updateDps(time);
        }
    }

    toObject(){
        var object = {};
        for(var i in this.divisions){
            object[i] = this.divisions[i].toObject();
        }

        return object;
    }
}
