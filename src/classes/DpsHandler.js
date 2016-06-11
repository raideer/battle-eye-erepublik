class DpsHandler{
    constructor(rem){
        this.rememberDpsFor = rem;
        this.hitHistory = new HitHistory(rem * 1000);
        this.hitStreakSeconds = 0;
        this.lastHit = 0;
        this.dps = 0;
    }

    addHit(damage){
        this.lastHit = new Date().getTime();
        this.hitHistory.add(damage);
    }

    updateDps(timeData){
        var recentDamage = this.hitHistory.getTotal();
        if(this.hitStreakSeconds < this.rememberDpsFor){
            this.hitStreakSeconds++;
        }

        this.dps = Math.round(recentDamage/this.hitStreakSeconds);
        if(timeData.time - this.lastHit >= 10000){
            this.hitHistory.clear();
            this.hitStreakSeconds = 0;
        }
    }
}
