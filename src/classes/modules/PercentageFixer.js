import Module from './Module';

export default class PercentageFixer extends Module{
    constructor(){
        super('Percentage Fixer', '');
    }

    defineSettings(){
        return [
            ['percFixEnabled', true, "Enable percentage fixer", "Temporary solution to eRepublik's battle stat inconsistencies"]
        ];
    }

    round(num, acc = 100000){
        return Math.round(num*acc)/acc;
    }

    dif(target, a, b){
        return Math.round(Math.abs(target - (a * 100 / (a + b)))*100000)/100000;
    }

    calculateFix(targetPerc, leftDamage, rightDamage){
        if(SERVER_DATA.mustInvert){
            targetPerc = 100 - targetPerc;
        }

        var simulatedLeftDmg = leftDamage;
        var totalFix = 0;
        var loops = 0;

        while(this.dif(targetPerc, simulatedLeftDmg, rightDamage) > 0.05){
            var leftPerc = simulatedLeftDmg * 100 / (simulatedLeftDmg + rightDamage);
            var fix = Math.round(simulatedLeftDmg * targetPerc / leftPerc - simulatedLeftDmg);
            simulatedLeftDmg+=fix;
            totalFix+=fix;
            loops++;
        }

        var originalDif = this.dif(targetPerc, leftDamage, rightDamage);
        var currentDif = this.dif(targetPerc, simulatedLeftDmg, rightDamage);

        belLog('Improved from', originalDif, 'to', currentDif, 'Loops:', loops);

        return Math.round(totalFix);
    }

    run(){
        var self = this;
        if(!window.BattleEyeSettings.percFixEnabled.value){
            return;
        }

        window.BattleEye.events.on('battlestats.loaded', ()=>{
            var left = window.BattleEye.teamA.toObject();
            var right = window.BattleEye.teamB.toObject();

            var divs, i, leftdmg, rightdmg;
            if(SERVER_DATA.division === 11){
                divs = [11];
            }else{
                divs = [1,2,3,4];
            }

            window.BattleEye.getNbpStats(SERVER_DATA.battleId).then((stats)=>{
                var currentInvader = stats.division.domination;
                var fix, currentDomination, logmsg, inaccuracy, loops;

                for(i in divs){
                    leftdmg = left.divisions['div' + divs[i]].damage;
                    rightdmg = right.divisions['div' + divs[i]].damage;

                    var targetPerc = currentInvader[divs[i]];
                    fix = self.calculateFix(targetPerc, leftdmg, rightdmg);

                    window.BattleEye.teamA.divisions.get('div' + divs[i]).damage += fix;
                    logmsg = `Added ${fix.toLocaleString()} damage to div${divs[i]}`;
                    belLog(logmsg);
                }
            });

        });
    }
}
