var settings = {};
var contributors = [];
var modules = null;
var storage = null;
var battleEyeLive = {
    init: function(){
        var self = this;
        console.log('[BATTLEEYE] Initialisation');

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
        storage.define('showDamageBar', true, 'Bars', "Show Damage bar");
        storage.define('largerBars', false, 'Bars', "Larger bars");

        storage.define('enableLogging', false, 'Other', "Enable logging to console");


        modules = new ModuleLoader(self.settingsStorage);
        modules.load(new AutoShooter());
        modules.load(new Other());

        //Loading settings
        storage.loadSettings();
        settings = storage.getAll();
        //

        self.events = new EventHandler();
        self.teamA = new Stats(SERVER_DATA.leftBattleId);
        self.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        self.teamB = new Stats(SERVER_DATA.rightBattleId);
        self.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version
        });

        self.layout.update(self.getTeamStats());

        pomelo.disconnect = function() {}

        self.checkForUpdates();

        self.loadBattleStats();

        $j('.bel-settings-field').on('change', function(event) {
            var input = event.target;

            if(input.type == "checkbox"){
                var value = input.checked;
            }else{
                var value = input.value;
            }
            self.settingsStorage.set(input.name, value);
            settings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            $j("label[for=\""+targetAtt+"\"]").notify("Saved", {position: "right middle", className: "success"});
        });

        self.runTicker();
        self.handleEvents();
        modules.run();
    },

    loadBattleStats: function() {
        var self = this;
        if(settings.gatherBattleStats.value){
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
                        var dmg = Number(hit.value.replace(/[,\.]/g,''));
                        leftDmg += dmg;

                        self.teamA.countries.handleBare({
                            damage: dmg,
                            permalink: hit.country_permalink
                        });
                    }

                    for(var i in rightDamage['div' + div]){
                        var hit = rightDamage['div' + div][i];
                        var dmg = Number(hit.value.replace(/[,\.]/g,''));
                        rightDmg += dmg;

                        self.teamB.countries.handleBare({
                            damage: dmg,
                            permalink: hit.country_permalink
                        });
                    }

                    for(var i in leftKills['div' + div]){
                        var hit = leftKills['div' + div][i];
                        leftKl += Number(hit.value.replace(/[,\.]/g,''));
                    }

                    for(var i in rightKills['div' + div]){
                        var hit = rightKills['div' + div][i];
                        rightKl += Number(hit.value.replace(/[,\.]/g,''));
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
        }
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
                }else if($j('li[data-citizen-id="'+cId+'"] .player_name').length > 0){
                    $j('li[data-citizen-id="'+cId+'"] .player_name').css({
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
            if(type == undefined){
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
                zoneId: 1
            }, function(data) {
                cb(data);
            });
        }

        var damageHandler = function(div, cb){
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function(whileCb){
                request(div,page,page,function(data) {
                    for(var i in data[attacker].fighterData){
                        attackerData['div'+div].push(data[attacker].fighterData[i]);
                    }
                    for(var i in data[defender].fighterData){
                        defenderData['div'+div].push(data[defender].fighterData[i]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    if(settings.enableLogging.value){
                        console.log('[BATTLEEYE] Finished damage page '+page+"/"+maxPage);
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

                    for(var i in data[defender].fighterData){
                        defenderKillData['div'+div].push(data[defender].fighterData[i]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    if(settings.enableLogging.value){
                        console.log('[BATTLEEYE] Finished kill page '+page+"/"+maxPage);
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
            self.teamA.updateDps(timeData);
            self.teamB.updateDps(timeData);
            self.layout.update(self.getTeamStats());
        });
    },

    overridePomelo: function(){
        var self = this;

        var handler = function(data) {
			if(currentPlayerDisplayRateValue !== "Maximum") {
				if(battleFX.checkPlayerDisplayRate(currentPlayerDisplayRateValue)) {
					battleFX.populatePlayerData(data);
				}
			} else {
				battleFX.populatePlayerData(data);
			}

            self.displayContributors();
            self.handle(data);
		};

        pomelo.on('onMessage', handler);
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
