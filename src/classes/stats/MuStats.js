export const MuStats = superclass => class extends superclass {
    constructor() {
        super();
        this.stats.military_units = {};

        this.handlers.push(data => {
            const unitId = data.msg.militaryUnitId;
            if (!unitId) return;

            if (!this.stats.military_units[unitId]) {
                this.stats.military_units[unitId] = {
                    damage: 0,
                    kills: 0
                };
            }

            this.stats.military_units[unitId].damage += data.msg.damage;
            this.stats.military_units[unitId].kills += 1;
        });
    }
};

