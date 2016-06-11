class Stats extends DpsHandler{
    constructor(id){
        super(10);
        this.id = id;
        this.damage = 0;
        this.hits = 0;
        this.dps = 0;
        this.divisions = new Divisions();
    }

    isSide(side){
        return this.id == side;
    }

    updateDps(timeData){
        super.updateDps(timeData);
        this.divisions.updateDps(timeData);
    }

    handle(data){
        if(!this.isSide(data.side)){
            return;
        }

        this.divisions.handle(data);

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
    }

    toObject(){
        return {
            'damage': this.damage.toLocaleString(),
            'id': this.id,
            'dps': this.dps.toLocaleString(),
            'avgHit': Math.round(this.damage/this.hits).toLocaleString(),
            'divisions': this.divisions.toObject()
        };
    }
}
