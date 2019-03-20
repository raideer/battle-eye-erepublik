export const BaseStats = superclass => class extends superclass {
    constructor() {
        super();
        this.stats.damage = 0;
        this.stats.kills = 0;
        this.stats.avgDmg = 0;

        this.handlers.push(data => {
            this.stats.damage += data.msg.damage;
            this.stats.kills++;
            this.stats.avgDmg = Math.round(this.stats.damage / this.stats.kills);
        });
    }
};

