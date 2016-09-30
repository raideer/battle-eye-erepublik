import Module from './Module';

export default class PercentageFixer extends Module{
    constructor(){
        super('Percentage Fixer', '');
    }

    defineSettings(){
        return [
            ['percFixEnabled', false, "Enable percentage fixer", "Temporary solution to eRepublik's battle stat inconsistencies"]
        ];
    }

    run(){
        var self = this;
        battleEyeLive.events.on('battleConsoleLoaded', function() {
            //Getting domination info from erepublik's nbp stats page
            self.getNbpStats(function(data){
                data = JSON.parse(data);

                //Domination values for the defending side
                var dom = data.division.domination;

                if(SERVER_DATA.division == 11){
                    var divs = [11];
                }else{
                    var divs = [1,2,3,4];
                }

                //Checking each division seperately
                for(var i in divs){
                    var domination = dom[divs[i]];
                    if(domination == 50){
                        continue;
                    }

                    //Total damage left
                    var aDamage = battleEyeLive.teamA.divisions.get('div'+divs[i]).damage;
                    //Total damage right
                    var bDamage = battleEyeLive.teamB.divisions.get('div'+divs[i]).damage;

                    var totalDamage = 0;
                        totalDamage += aDamage;
                        totalDamage += bDamage;

                    //Calculate BattleEye's damage percentage for the defending side
                    if(SERVER_DATA.leftBattleId == SERVER_DATA.defenderId){
                        var perc = (aDamage / totalDamage)*100;
                        var left = true;
                    }else{
                        var perc = (bDamage / totalDamage)*100;
                        var left = false;
                    }

                    //If percentages are not the same
                    if(Math.round(perc) != Math.round(domination)){
                        // log(perc, "be perc")
                        // log(domination, 'domination perc');
                        //
                        // log((perc/100)*totalDamage, 'be division damage');
                        // log((domination/100)*totalDamage, 'division damage');

                        //Difference between BattleEye's expected damage and actual damage
                        var diff = totalDamage * (perc/100) - totalDamage * (domination/100);
                        log(diff, 'difference');

                        if(diff > 0){
                            //Adding missing damage to the defending side
                            if(left){
                                battleEyeLive.teamA.divisions.get('div'+divs[i]).damage += Math.round(Math.abs(diff));
                            }else{
                                battleEyeLive.teamB.divisions.get('div'+divs[i]).damage += Math.round(Math.abs(diff));
                            }
                        }else{
                            //Adding missing damage to the attacking side
                            if(!left){
                                battleEyeLive.teamB.divisions.get('div'+divs[i]).damage += Math.round(Math.abs(diff));
                            }else{
                                battleEyeLive.teamA.divisions.get('div'+divs[i]).damage += Math.round(Math.abs(diff));
                            }
                        }

                        log(`Div ${divs[i]} percentages fixed`);
                    }else{
                        log(`Div ${divs[i]} percentages are accurate`);
                    }
                }
            })
        });
    }

    getNbpStats(cb){
        $j.get('https://www.erepublik.com/en/military/nbp-stats/'+SERVER_DATA.battleId+'/2', function (data) {
            if(typeof cb == 'function'){
                cb(data);
            }
        });
    }
}
