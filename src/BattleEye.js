import Utils from './classes/Utils';
import Stats from './classes/Stats';
import Layout from './classes/Layout';
import SettingsStorage from './classes/Storage';
import Stylesheet from './classes/Stylesheet';
import EventHandler from './classes/EventHandler';
import ModuleLoader from './classes/modules/ModuleLoader';

import OtherModule from './classes/modules/Other';
import AutoShooterModule from './classes/modules/AutoShooter';

class BattleEye{
    constructor(){
        window.storage = this.storage = new SettingsStorage();
        if(this.storage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        this.defineDefaultSettings();

        const modules = new ModuleLoader(this.storage);
              modules.load(new AutoShooterModule());
              modules.load(new OtherModule());

        this.storage.loadSettings();
        window.settings = this.storage.getAll();
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

        this.layout = new Layout({
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': this.revolutionCountry
        });

        this.layout.update(this.getTeamStats());

        pomelo.disconnect = () => {};

        this.checkForUpdates();

        this.loadBattleStats();

        this.defineListeners();

        this.runTicker();

        this.handleEvents();

        modules.run();
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
            self.storage.set(input.name, value);
            self.settings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            $j("label[for=\""+targetAtt+"\"]").notify("Saved", {position: "right middle", className: "success"});
        });
    }

    defineDefaultSettings(){
        var self = this;
        function define(settings){
            for(var i in settings){
                self.storage.define.apply(self.storage, settings[i]);
            }
        }

        var settings = [
            ['showOtherDivs', true, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below."],
            ['showDiv1', true, 'Structure', "Show DIV 1"],
            ['showDiv2', true, 'Structure', "Show DIV 2"],
            ['showDiv3', true, 'Structure', "Show DIV 3"],
            ['showDiv4', true, 'Structure', "Show DIV 4"],
            ['showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count"],
            ['showAverageDamage', false, 'Structure', "Show average damage dealt"],
            ['showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield"],
            ['showKills', false, 'Structure', "Show kills done by each division"],
            ['showDamagePerc', true, 'Structure', "Show Damage percentages"],
            ['moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh'],
            ['reduceLoad', false, 'Performance', "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance"],
            ['gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time."],
            ['highlightDivision', true, 'Visual', "Highlight current division"],
            ['highlightValue', true, 'Visual', "Highlight winning side"],
            ['showDpsBar', true, 'Bars', "Show DPS bar"],
            ['showDamageBar', false, 'Bars', "Show Damage bar"],
            ['showDominationBar', true, 'Bars', "Show Domination bar"],
            ['largerBars', false, 'Bars', "Larger bars"],
            ['enableLogging', false, 'Other', "Enable logging to console"]
        ];

        define(settings);
    }

    updateNbpStats(cb){
        var self = this;
        return new Promise((resolve, reject)=>{
            $j.get('https://www.erepublik.com/en/military/nbp-stats/85503/2', function(data) {
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

    loadBattleStats(){
        var self = this;

        if(!window.settings.gatherBattleStats.value){
            return $j('#bel-loading').hide();
        }

        var processData = (data) => {
            console.log('Processing data');
            console.log(data);
            var divs = [1,2,3,4,11];

            for(var d in divs){
                var div = divs[d];
                var leftDmg = 0;
                var rightDmg = 0;
                var leftKl = 0;
                var rightKl = 0;

                for(var i in data.leftDamage['div' + div]){
                    var hit = data.leftDamage['div' + div][i];
                    var dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    }

                    self.teamA.countries.handleBare(bareData);
                    self.teamA.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(var i in data.rightDamage['div' + div]){
                    var hit = data.rightDamage['div' + div][i];
                    var dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    rightDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    self.teamB.countries.handleBare(bareData);
                    self.teamB.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(var i in data.leftKills['div' + div]){
                    var hit = data.leftKills['div' + div][i];
                    leftKl += (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                }

                for(var i in data.rightKills['div' + div]){
                    var hit = data.rightKills['div' + div][i];
                    rightKl += (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                }

                self.teamA.divisions.get('div' + div).damage += leftDmg;
                self.teamB.divisions.get('div' + div).damage += rightDmg;
                self.teamA.damage += leftDmg;
                self.teamB.damage += rightDmg;
                self.teamA.divisions.get('div' + div).hits += leftKl;
                self.teamB.divisions.get('div' + div).hits += rightKl;
                self.teamA.hits += leftKl;
                self.teamB.hits += rightKl;
            }

            $j('#bel-loading').hide();
        }

        this.getBattleStats().then(processData);
    }

    resetSettings(){
        this.storage.loadDefaults();
        window.settings = this.storage.getAll();
    }

    checkForUpdates(){
        var self = this;
        return new Promise((resolve, reject)=>{
            $j.get('https://dl.dropboxusercontent.com/u/86379644/data.json', function(data) {
                data = JSON.parse(data);
                self.contributors = data.contributors;
                self.displayContributors();

                var version = parseInt(data.version.replace(/\D/g,""));
                var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
                if(currentVersion != version){
                    document.querySelector('.bel-version').classList.add('bel-version-outdated');
                    document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="'+data.updateUrl+'">Update</a>';
                }

                console.log('[BATTLEEYE] Data JSON received and processed');
                resolve(data);
            }).error(function(error){
                console.error('[BATTLEEYE] Failed to download data.json');
                reject(error);
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
                        textShadow: `0 0 10px ${color} !important`,
                        color: `${color} !important`
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

    getBattleStats(){
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
                        round: SERVER_DATA.zoneId,
                        type: type,
                        zoneId: parseInt(SERVER_DATA.zoneId, 10)
                    }, function(data) {
                        resolve(data);
                    });
                });
            }

            var damageHandler = function(div, cb){
                var page = 1;
                var maxPage = 1;

                async.doWhilst(function(whileCb){
                    request(div, page, page, 'damage').then((data) => {
                        for(var i in data[attacker].fighterData){
                            leftDamage['div'+div].push(data[attacker].fighterData[i]);
                        }
                        for(var i in data[defender].fighterData){
                            rightDamage['div'+div].push(data[defender].fighterData[i]);
                        }

                        maxPage = Math.max(data[attacker].pages, data[defender].pages);

                        if(window.settings.enableLogging.value){
                            console.log('[BATTLEEYE] Finished damage page '+page+"/"+maxPage+" div"+div);
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
                        if(window.settings.enableLogging.value){
                            console.log('[BATTLEEYE] Finished kill page '+page+"/"+maxPage+" div"+div);
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

            var divRange = (SERVER_DATA.division == 11)?[11]:[1,2,3,4];

            async.each(divRange, damageHandler.bind(self), function(){
                async.each(divRange, killsHandler.bind(self), function(){
                    console.log('Finished fetching data');
                    resolve({leftDamage, rightDamage, leftKills, rightKills});
                });
            });
        });
    }

    runTicker(){
        var second = 0;

        var ticker = () => {
            second++;
            this.events.emit('tick', {
                second: second,
                time: new Date().getTime()
            });
        };

        this.interval = setInterval(ticker.call(this), 1000);
    }

    handleEvents(){
        var self = this;
        this.events.on('tick', (timeData) => {
            if(timeData.second % 3 === 0 && self.updateContributors){
                self.updateContributors = false;
                self.displayContributors();
            }
            self.teamA.updateDps(timeData);
            self.teamB.updateDps(timeData);
            self.layout.update(self.getTeamStats());
        });
    }

    overridePomelo(){
        var self = this;

        var handler = function(data) {
            self.updateContributors = true;
            self.handle(data);
		};

        pomelo.on('onMessage', handler);
        pomelo.on('close', function(data){
            console.log('[BATTLEEYE] Socket closed ['+data.reason+']');
            self.closed = true;
            $j('#belClosed').show();
            clearTimeout(self.interval);
        });
    }

    handle(data){
        var self = this;
        self.teamA.handle(data);
        self.teamB.handle(data);
        if(!settings.reduceLoad.value){
            self.layout.update(self.getTeamStats());
        }
    }
}

export default (new BattleEye());
