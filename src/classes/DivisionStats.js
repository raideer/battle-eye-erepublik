class DivisionStats extends DpsHandler{
    constructor(division){
        super(10);
        this.division = division;
        this.hits = 0;
        this.damage = 0;
    }

    handle(data){
        if(data.division != this.division){
            return;
        }

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
    }

    toObject(){
        return {
            'damage': this.damage.toLocaleString(),
            'id': this.id,
            'dps': this.dps.toLocaleString(),
            'avgHit': Math.round(this.damage/this.hits).toLocaleString()
        };
    }
}
