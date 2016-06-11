class HitHistory{
    constructor(rememberFor = 30000){
        this.rememberFor = rememberFor;
        this.history = {};
    }

    add(hit){
        var time = new Date().getTime();
        this.history[time] = hit;
        this.trimOld(time);
    }

    trimOld(time = new Date().getTime()){
        for(var i in this.history){
            if(time - i - this.rememberFor > 0){
                delete this.history[i];
            }
        }
    }

    clear(){
        this.history = {};
    }

    getTotal(){
        this.trimOld();

        var total = 0;
        for(var i in this.history){
            total += this.history[i];
        }
        return total;
    }
}
