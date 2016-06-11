class Divisions{
    constructor(){
        this.div1 = new DivisionStats(1);
        this.div2 = new DivisionStats(2);
        this.div3 = new DivisionStats(3);
        this.div4 = new DivisionStats(4);
    }

    handle(data){
        this.div1.handle(data);
        this.div2.handle(data);
        this.div3.handle(data);
        this.div4.handle(data);
    }

    updateDps(time){
        this.div1.updateDps(time);
        this.div2.updateDps(time);
        this.div3.updateDps(time);
        this.div4.updateDps(time);
    }

    toObject(){
        return {
            'div1': this.div1.toObject(),
            'div2': this.div2.toObject(),
            'div3': this.div3.toObject(),
            'div4': this.div4.toObject()
        };
    }
}
