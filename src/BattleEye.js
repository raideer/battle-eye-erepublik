import Utils from './classes/Utils';
import Stats from './classes/Stats';
import Layout from './classes/Layout';
import SettingsStorage from './classes/Storage';
import Stylesheet from './classes/Stylesheet';
import EventHandler from './classes/EventHandler';
import ModuleLoader from './classes/modules/ModuleLoader';

import OtherModule from './classes/modules/Other';
import PercentageFixer from './classes/modules/PercentageFixer';
// import AutoShooterModule from './classes/modules/AutoShooter';

export default class BattleEye{
    constructor(){
        belTime('battleEyeConstructor');
        var self = this;
        window.BattleEye = this;
        window.viewData = {
            connected: true
        };

        this.second = 0;
        this.contributors = {};
        this.alerts = {};

        if(window.BattleEyeStorage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        const modules = new ModuleLoader();
              modules.load(new PercentageFixer());
              modules.load(new OtherModule());

        window.BattleEyeStorage.loadSettings();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();

        this.events = new EventHandler();

        this.teamA = new Stats(SERVER_DATA.leftBattleId);
        this.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        this.teamB = new Stats(SERVER_DATA.rightBattleId);
        this.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        this.teamA.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
        this.teamB.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

        this.revolutionCountry = null;
        if(SERVER_DATA.isCivilWar){
            if(SERVER_DATA.invaderId == SERVER_DATA.leftBattleId){
                this.teamA.revolution = true;
                this.teamAName = `${this.teamBName} Revolution`;
                this.revolutionCountry = this.teamBName;
            }else{
                this.teamB.revolution = true;
                this.teamBName = `${this.teamAName} Revolution`;
                this.revolutionCountry = this.teamBName;
            }
        }

        var resistanceBonusAttacker = $j('#pvp_header .domination span.resistance_influence_value.attacker em');
        var resistanceBonusDefender = $j('#pvp_header .domination span.resistance_influence_value.defender em');
        window.leftDetBonus = 1;
        window.rightDetBonus = 1;

        if(resistanceBonusAttacker.length > 0){
            if(!this.teamA.defender){
                window.leftDetBonus = parseFloat(resistanceBonusAttacker.html());
            }else{
                window.rightDetBonus = parseFloat(resistanceBonusAttacker.html());
            }
        }else if(resistanceBonusDefender.length > 0){
            if(this.teamA.defender){
                window.leftDetBonus = parseFloat(resistanceBonusDefender.html());
            }else{
                window.rightDetBonus = parseFloat(resistanceBonusDefender.html());
            }
        }

        self.forceDisconnect = pomelo.disconnect;
        pomelo.disconnect = () => {};

        this.events.on('layout.ready', (layout)=>{
            layout.update(self.getTeamStats());
            self.checkForUpdates();
            self.getNbpStats(SERVER_DATA.battleId).then((data)=>{
                if(!data.zone_finished){
                    self.loadBattleStats();
                }else{
                    $j('#bel-loading').hide();
                }
            });

            modules.run();
        });

        this.layout = new Layout({
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': this.revolutionCountry
        }, this);

        this.defineListeners();

        this.runTicker();

        this.handleEvents();
        belTimeEnd('battleEyeConstructor');
    }

    defineListeners(){
        var self = this;

        $j('.bel-settings-field').on('change', function(event) {
            var input = event.target;
            var value;

            if(input.type == "checkbox"){
                value = input.checked;
            }else{
                value = input.value;
            }

            window.BattleEyeStorage.set(input.name, value);
            window.BattleEyeSettings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            self.events.emit('log', `Updated setting ${input.name} to ${value}`);

            $j("label[for=\""+targetAtt+"\"]").notify("Saved", {position: "right middle", className: "success"});
        });
    }

    sortByValue(obj){
        var sorted = {};
        var sortedKeys = Object.keys(obj).sort((a,b) => {return obj[a]-obj[b];}).reverse();

        for(var i in sortedKeys){
        	sorted[sortedKeys[i]] = obj[sortedKeys[i]];
        }

        return sorted;
    }

    getNbpStats(battleId, cb){
        var self = this;
        return new Promise((resolve, reject)=>{
            $j.get('https://www.erepublik.com/en/military/nbp-stats/' + battleId, function(data) {
                data = JSON.parse(data);
                resolve(data);
                if(typeof cb === 'function'){
                    cb(data);
                }
            }).error((e) => {
                reject(e);
            });
        });
    }

    processBattleStats(data, teamA, teamB){
        return new Promise((resolve, reject)=>{
            var divs = [1,2,3,4,11];
            var hit, dmg, i, bareData, killValue;

            if(!data){
                belLog('undefined data - returning');
                return resolve();
            }

            for(var d in divs){
                var div = divs[d];
                var leftDmg = 0;
                var rightDmg = 0;
                var leftKl = 0;
                var rightKl = 0;

                for(i in data.leftDamage['div' + div]){
                    hit = data.leftDamage['div' + div][i];
                    dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftDmg += dmg;

                    bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    teamA.countries.handleBare(bareData);
                    teamA.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(i in data.rightDamage['div' + div]){
                    hit = data.rightDamage['div' + div][i];
                    dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    rightDmg += dmg;

                    bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    teamB.countries.handleBare(bareData);
                    teamB.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(i in data.leftKills['div' + div]){
                    hit = data.leftKills['div' + div][i];
                    killValue = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftKl += killValue;
                    teamA.countries.handleKills(hit.country_permalink, killValue);
                    teamA.divisions.get('div' + div).countries.handleKills(hit.country_permalink, killValue);
                }

                for(i in data.rightKills['div' + div]){
                    hit = data.rightKills['div' + div][i];
                    killValue = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    rightKl += killValue;
                    teamB.countries.handleKills(hit.country_permalink, killValue);
                    teamB.divisions.get('div' + div).countries.handleKills(hit.country_permalink, killValue);
                }

                teamA.divisions.get('div' + div).damage += leftDmg;
                teamB.divisions.get('div' + div).damage += rightDmg;
                teamA.damage += leftDmg;
                teamB.damage += rightDmg;
                teamA.divisions.get('div' + div).hits += leftKl;
                teamB.divisions.get('div' + div).hits += rightKl;
                teamA.hits += leftKl;
                teamB.hits += rightKl;
            }


            resolve();
        });
    }

    loadBattleStats(){
        var self = this;

        if(!window.BattleEyeSettings.gatherBattleStats.value){
            self.events.emit('log', 'Battle stat fetching canceled since the battle is over.');
            return $j('#bel-loading').hide();
        }

        self.getBattleStats().then((data)=>{
            self.events.emit('log', 'Battle stats fetched. Processing...');
            return self.processBattleStats(data, self.teamA, self.teamB);
        }).then(()=>{
            self.events.emit('log', 'Battle stats loaded.');
            self.events.emit('battlestats.loaded');
            $j('#bel-loading').hide();
            self.layout.update(self.getTeamStats());
        });
    }

    resetSettings(){
        window.BattleEyeStorage.loadDefaults();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();
    }

    checkForUpdates(){
        var self = this;
        return new Promise((resolve, reject)=>{
            $j.get('https://dl.dropboxusercontent.com/u/86379644/data.json', function(data) {
                data = JSON.parse(data);
                self.contributors = data.contributors;
                self.alerts = data.alerts;
                self.displayContributors();

                var version = parseInt(data.version.replace(/\D/g,""));
                var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
                if(currentVersion != version){
                    document.querySelector('#bel-version .bel-alert').classList.add('bel-alert-danger');
                    document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="'+data.updateUrl+'">Update</a>';
                }

                belLog('Data JSON received and processed');
                self.events.emit('log', 'Data.json synced');
                resolve(data);
            }).error(function(error){
                console.error('Failed to download data.json');
                reject(error);
            });
        });
    }

    generateSummary(){
        var self = this;
        var data = [];
        this.step = 1;
        self.events.emit('log', 'Generating summary...');
        var round = 1;
        function getStats(cb){
            var divRange = [1,2,3,4];
            if(round % 4 === 0){
                divRange = [11];
            }

            self.getBattleStats(round, divRange).then((stats)=>{
                self.events.emit('summary.update', round);
                data[round] = stats;
                round++;
                if(round <= SERVER_DATA.zoneId){
                    getStats(cb);
                }else{
                    cb();
                }
            });
        }

        getStats(()=>{
            // belLog(data);
            var left = new Stats(SERVER_DATA.leftBattleId);
            var right = new Stats(SERVER_DATA.rightBattleId);
            var rounds = [], round;

            left.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
            right.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

            async.eachOf(data, (roundStats, key, cb)=>{
                if(!roundStats) return cb();
                // belLog('round',key,roundStats);
                self.processBattleStats(roundStats, left, right).then(()=>{
                    rounds[key] = {
                        left: new Stats(SERVER_DATA.leftBattleId),
                        right: new Stats(SERVER_DATA.rightBattleId)
                    };

                    rounds[key].left.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
                    rounds[key].right.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

                    self.processBattleStats(roundStats, rounds[key].left, rounds[key].right).then(()=>{
                        self.events.emit('log', 'Processed round ' + (key+1));
                        cb();
                    });
                });
            }, ()=>{
                for(var i in rounds){
                    rounds[i].left = rounds[i].left.toObject();
                    rounds[i].right = rounds[i].right.toObject();
                }

                self.events.emit('summary.finished', [left.toObject(), right.toObject(), rounds, data]);
                self.events.emit('log', 'Summary data fetching done');
            });
        });
    }

    displayContributors(){
        $j('.bel-contributor').each(function() {
            $j(this).removeClass('bel-contributor')
                   .removeAttr('style')
                   .removeAttr('original-title');
        });

        for(var color in this.contributors){
            var players = this.contributors[color];
            for(var j in players){
                var cId = players[j];
                if(erepublik.citizen.citizenId == cId){
                    $j('#battleConsole .left_player .player_name').css({
                        textShadow: `0 0 10px ${color}`,
                        color: `${color}`
                    }).attr('original-title', "BattleEye contributor").tipsy();
                }else if($j('li[data-citizen-id="'+cId+'"] .player_name a').length > 0){
                    $j('li[data-citizen-id="'+cId+'"] .player_name a').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                }
            }
        }
    }

    getTeamStats(){
        return {
            left: this.teamA.toObject(),
            right: this.teamB.toObject()
        };
    }

    getBattleStats(round = SERVER_DATA.zoneId, divRange = null){
        var self = this;

        return new Promise((resolve, reject) => {

            var attacker = SERVER_DATA.leftBattleId;
            var defender = SERVER_DATA.rightBattleId;

            var leftDamage = {div1: [], div2: [], div3: [], div4: [], div11: []},
                rightDamage = {div1: [], div2: [], div3: [], div4: [], div11: []},
                leftKills = {div1: [], div2: [], div3: [], div4: [], div11: []},
                rightKills = {div1: [], div2: [], div3: [], div4: [], div11: []};

            var request = function(div,pageLeft,pageRight,type) {
                if(type === undefined){
                    type = 'damage';
                }

                return new Promise((resolve, reject) => {
                    $j.post('https://www.erepublik.com/en/military/battle-console',{
                        _token: SERVER_DATA.csrfToken,
                        action: 'battleStatistics',
                        battleId: SERVER_DATA.battleId,
                        division: div,
                        leftPage: pageLeft,
                        rightPage: pageRight,
                        round: round,
                        type: type,
                        zoneId: parseInt(round, 10)
                    }, function(data) {
                        resolve(data);
                    });
                });
            };

            var damageHandler = function(div, cb){
                var page = 1;
                var maxPage = 1;
                var i;

                async.doWhilst(function(whileCb){
                    request(div, page, page, 'damage').then((data) => {
                        for(i in data[attacker].fighterData){
                            leftDamage['div'+div].push(data[attacker].fighterData[i]);
                        }
                        for(i in data[defender].fighterData){
                            rightDamage['div'+div].push(data[defender].fighterData[i]);
                        }

                        maxPage = Math.max(data[attacker].pages, data[defender].pages);

                        if(window.BattleEyeSettings.enableLogging.value){
                            belLog('Finished damage page '+page+"/"+maxPage+" div"+div);
                            self.events.emit('log', `Fetched damage ${page}/${maxPage} for div${div}`);
                        }

                        page++;
                        whileCb();
                    });
                },function(){
                    return page <= maxPage;
                },function() {
                    cb();
                });
            };

            var killsHandler = function(div, cb){
                var page = 1;
                var maxPage = 1;

                async.doWhilst(function(whileCb){
                    request(div,page,page, 'kills').then((data) => {
                        for(var i in data[attacker].fighterData){
                            leftKills['div'+div].push(data[attacker].fighterData[i]);
                        }

                        for(var j in data[defender].fighterData){
                            rightKills['div'+div].push(data[defender].fighterData[j]);
                        }

                        maxPage = Math.max(data[attacker].pages, data[defender].pages);
                        if(window.BattleEyeSettings.enableLogging.value){
                            belLog('Finished kill page '+page+"/"+maxPage+" div"+div);
                            self.events.emit('log', `Fetched kills ${page}/${maxPage} for div${div}`);
                        }
                        page++;

                        whileCb();
                    });
                }, function(){
                    return page <= maxPage;
                }, function() {
                    cb();
                });
            };

            if(divRange === null){
                divRange = (SERVER_DATA.division == 11)?[11]:[1,2,3,4];
            }

            async.each(divRange, damageHandler.bind(self), function(){
                async.each(divRange, killsHandler.bind(self), function(){
                    resolve({leftDamage, rightDamage, leftKills, rightKills});
                });
            });
        });
    }

    runTicker(){
        var ticker = () => {
            this.second++;
            this.events.emit('tick', this.second);
        };

        this.interval = setInterval(ticker.bind(this), 1000);
    }

    handleEvents(){
        var handleTick = function(second){
            if(second % 3 === 0 && self.updateContributors){
                this.updateContributors = false;
                this.displayContributors();
            }
            this.teamA.updateDps(second);
            this.teamB.updateDps(second);
            this.layout.update(this.getTeamStats());
        };

        this.events.on('tick', handleTick.bind(this));
    }

    overridePomelo(){
        var messageHandler = function(data) {
            this.updateContributors = true;
            this.handle(data);
		};

        var closeHandler = function(data){
            belLog('Socket closed ['+data.reason+']');
            window.viewData.connected = false;
            this.layout.update(this.getTeamStats());
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));
    }

    handle(data){
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.layout.update(this.getTeamStats());
        window.viewData.connected = true;
    }
}
