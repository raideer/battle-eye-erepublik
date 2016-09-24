function log(data, desc){
    if(desc === undefined){
        desc = '';
    }
    console.log("[BATTLEEYE] "+desc + ": " + data);
}

var settings = {};
var contributors = [];
var modules = null;
var storage = null;
var battleEyeLive = {
    closed: false,
    nbpStats: null,
    updateContributors: true,
    init: function(){
        var self = this;
        console.log('[BATTLEEYE] Initialisation');

        //Setting up the Storage class, that handles localStorage stuff
        storage = self.settingsStorage = new Storage();
        if(storage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        //Defining default settings
        storage.define('showOtherDivs', true, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below.");
        storage.define('showDiv1', true, 'Structure', "Show DIV 1");
        storage.define('showDiv2', true, 'Structure', "Show DIV 2");
        storage.define('showDiv3', true, 'Structure', "Show DIV 3");
        storage.define('showDiv4', true, 'Structure', "Show DIV 4");
        storage.define('showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count");
        storage.define('showAverageDamage', false, 'Structure', "Show average damage dealt");
        storage.define('showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield");
        storage.define('showKills', false, 'Structure', "Show kills done by each division");
        storage.define('showDamagePerc', true, 'Structure', "Show Damage percentages");
        storage.define('moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh');

        storage.define('reduceLoad', false, 'Performance', "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance");
        storage.define('gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time.");

        storage.define('highlightDivision', true, 'Visual', "Highlight current division");
        storage.define('highlightValue', true, 'Visual', "Highlight winning side");

        storage.define('showDpsBar', true, 'Bars', "Show DPS bar");
        storage.define('showDamageBar', false, 'Bars', "Show Damage bar");
        storage.define('showDominationBar', true, 'Bars', "Show Domination bar");
        storage.define('largerBars', false, 'Bars', "Larger bars");

        storage.define('enableLogging', false, 'Other', "Enable logging to console");


        modules = new ModuleLoader(self.settingsStorage);
        modules.load(new AutoShooter());
        modules.load(new Other());
        // modules.load(new BattleHistory());
        // modules.load(new PercentageFixer());

        //Loading settings
        storage.loadSettings();
        settings = storage.getAll();
        //

        self.events = new EventHandler();

        //Defining Stats classes for both sides
        self.teamA = new Stats(SERVER_DATA.leftBattleId);
        self.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        self.teamB = new Stats(SERVER_DATA.rightBattleId);
        self.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        if(SERVER_DATA.defenderId == SERVER_DATA.leftBattleId){
            self.teamA.defender = true;
        }else{
            self.teamB.defender = true;
        }

        var revolCountry = null;
        if(SERVER_DATA.isCivilWar){
            if(SERVER_DATA.invaderId == SERVER_DATA.leftBattleId){
                self.teamA.revolution = true;
                self.teamAName = self.teamBName + " Revolution";
                revolCountry = self.teamBName;
            }else{
                self.teamB.revolution = true;
                self.teamBName = self.teamAName + " Revolution";
                revolCountry = self.teamAName;
            }
        }

        var resistanceBonusAttacker = $j('#pvp_header .domination span.resistance_influence_value.attacker em');
        var resistanceBonusDefender = $j('#pvp_header .domination span.resistance_influence_value.defender em');
        self.leftDetBonus = 1;
        self.rightDetBonus = 1;

        if(resistanceBonusAttacker.length > 0){
            if(!self.teamA.defender){
                self.leftDetBonus = parseFloat(resistanceBonusAttacker.html());
            }else{
                self.rightDetBonus = parseFloat(resistanceBonusAttacker.html());
            }
        }

        if(resistanceBonusDefender.length > 0){
            if(self.teamA.defender){
                self.leftDetBonus = parseFloat(resistanceBonusDefender.html());
            }else{
                self.rightDetBonus = parseFloat(resistanceBonusDefender.html());
            }
        }

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': revolCountry
        });

        //Rendering the layout
        self.layout.update(self.getTeamStats());

        //Overriding pomelo's disconnect to avoid interruptions by 3rd parties
        pomelo.disconnect = function() {};

        //Updates data from data.json
        self.checkForUpdates();

        //Loads stats from erepublik's battle console
        self.loadBattleStats();

        //Listens to setting changes
        $j('.bel-settings-field').on('change', function(event) {
            var input = event.target;
            var value;

            if(input.type == "checkbox"){
                value = input.checked;
            }else{
                value = input.value;
            }
            self.settingsStorage.set(input.name, value);
            settings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            $j("label[for=\""+targetAtt+"\"]").notify("Saved", {position: "right middle", className: "success"});
        });

        $j('[data-tab="other"]').click(function(){
            self.nbpStats = null;
            self.updateNbpStats(function(data){

            });
        });

        self.runTicker();
        self.handleEvents();
        modules.run();
    },
    updateNbpStats: function(cb){
        var self = this;
        $j.get('https://www.erepublik.com/en/military/nbp-stats/85503/2', function(data) {
            data = JSON.parse(data);
            self.nbpStats = data;
            self.nbpUpdated = new Date();
            if(typeof cb == 'function'){
                cb(data);
            }
        });
    },
    //Loads stats from erepublik's battle console
    loadBattleStats: function() {
        var self = this;
        if(!settings.gatherBattleStats.value){
            $j('#bel-loading').hide();
            return;
        }

        self.getBattleStats(function(leftDamage, rightDamage, leftKills, rightKills){
            var divs = [1,2,3,4,11];

            for(var d in divs){
                var div = divs[d];
                var leftDmg = 0;
                var rightDmg = 0;
                var leftKl = 0;
                var rightKl = 0;

                for(var i in leftDamage['div' + div]){
                    var hit = leftDamage['div' + div][i];
                    var dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    }

                    self.teamA.countries.handleBare(bareData);
                    self.teamA.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(var i in rightDamage['div' + div]){
                    var hit = rightDamage['div' + div][i];
                    var dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    rightDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    self.teamB.countries.handleBare(bareData);
                    self.teamB.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(var i in leftKills['div' + div]){
                    var hit = leftKills['div' + div][i];
                    leftKl += (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                }

                for(var i in rightKills['div' + div]){
                    var hit = rightKills['div' + div][i];
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
        });
    },

    resetSettings: function() {
        storage.loadDefaults();
        settings = storage.getAll();
    },

    checkForUpdates: function() {
        var self = this;
        $j.get('https://dl.dropboxusercontent.com/u/86379644/data.json', function(data) {
            data = JSON.parse(data);
            contributors = data.contributors;
            self.displayContributors();
            var version = parseInt(data.version.replace(/\D/g,""));
            var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
            if(currentVersion != version){
                document.querySelector('.bel-version').classList.add('bel-version-outdated');
                document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="'+data.updateUrl+'">Update</a>';
            }

            console.log('[BATTLEEYE] Data JSON received and processed');
        }).error(function(error){
            console.error('[BATTLEEYE] Failed to download data.json');
        });
    },

    displayContributors: function() {
        $j('.bel-contributor').each(function() {
            $j(this).removeClass('bel-contributor')
                   .removeAttr('style')
                   .removeAttr('original-title');
        });

        for(var color in contributors){
            var players = contributors[color];
            for(var j in players){
                var cId = players[j];
                if(erepublik.citizen.citizenId == cId){
                    $j('#battleConsole .left_player .player_name').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").tipsy();
                }else if($j('li[data-citizen-id="'+cId+'"] .player_name a').length > 0){
                    $j('li[data-citizen-id="'+cId+'"] .player_name a').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                }
            }
        }
    },

    getTeamStats: function(){
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleStats: function(callback){
        var self = this;
        var attacker = SERVER_DATA.leftBattleId;
        var defender = SERVER_DATA.rightBattleId;

        var attackerData = {div1: [], div2: [], div3: [], div4: [], div11: []},
            defenderData = {div1: [], div2: [], div3: [], div4: [], div11: []},
            attackerKillData = {div1: [], div2: [], div3: [], div4: [], div11: []},
            defenderKillData = {div1: [], div2: [], div3: [], div4: [], div11: []};

        var request = function(div,pageLeft,pageRight,cb,type) {
            if(type === undefined){
                type = 'damage';
            }

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
                cb(data);
            });
        }

        var damageHandler = function(div, cb){
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function(whileCb){
                request(div, page, page, function(data) {
                    for(var i in data[attacker].fighterData){
                        attackerData['div'+div].push(data[attacker].fighterData[i]);
                    }
                    for(var i in data[defender].fighterData){
                        defenderData['div'+div].push(data[defender].fighterData[i]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);

                    if(settings.enableLogging.value){
                        console.log('[BATTLEEYE] Finished damage page '+page+"/"+maxPage+" div"+div);
                    }
                    page++;
                    whileCb();
                }, 'damage');
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
                request(div,page,page,function(data) {

                    for(var i in data[attacker].fighterData){
                        attackerKillData['div'+div].push(data[attacker].fighterData[i]);
                    }

                    for(var j in data[defender].fighterData){
                        defenderKillData['div'+div].push(data[defender].fighterData[j]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    if(settings.enableLogging.value){
                        console.log('[BATTLEEYE] Finished kill page '+page+"/"+maxPage+" div"+div);
                    }
                    page++;

                    whileCb();
                }, 'kills');
            },function(){
                return page <= maxPage;
            },function() {
                cb();
            });
        };

        var divRange = (SERVER_DATA.division == 11)?[11]:[1,2,3,4];

        async.each(divRange, damageHandler.bind(self), function(){
            async.each(divRange, killsHandler.bind(self), function(){
                callback(attackerData, defenderData, attackerKillData, defenderKillData);
                self.events.emit('battleConsoleLoaded', null);
            });
        });

    },

    runTicker: function(){
        var self = this;
        var second = 0;

        var ticker = function(){
            second++;
            var timeData = {
                'second': second,
                'time': new Date().getTime()
            };
            self.events.emit('tick', timeData);
        };

        self.interval = setInterval(ticker, 1000);
    },

    handleEvents: function(){
        var self = this;
        self.events.on('tick', function(timeData) {
            if(timeData.second % 3 === 0 && self.updateContributors){
                self.updateContributors = false;
                self.displayContributors();
            }
            self.teamA.updateDps(timeData);
            self.teamB.updateDps(timeData);
            self.layout.update(self.getTeamStats());
        });
    },

    overridePomelo: function(){
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
    },
    handle: function(data){
        var self = this;
        self.teamA.handle(data);
        self.teamB.handle(data);
        if(!settings.reduceLoad.value){
            self.layout.update(self.getTeamStats());
        }
    }
};

battleEyeLive.init();
setTimeout(function(){
    battleEyeLive.overridePomelo();
}, 2000);
