class Stats extends DpsHandler{
    constructor(id){
        super(10);

        this.id = id;
        this.damage = 0;
        this.hits = 0;
        this.constructDivisions();
    }

    constructDivisions(){
        this.divisions = new Divisions();

        this.divisions.create('div1', 1);
        this.divisions.create('div2', 2);
        this.divisions.create('div3', 3);
        this.divisions.create('div4', 4);
        this.divisions.create('div11', 11);
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
            'damage': this.damage,
            'id': this.id,
            'dps': this.dps,
            'hits': this.hits,
            'avgHit': Math.round(this.damage/this.hits),
            'divisions': this.divisions.toObject()
        };
    }
}
