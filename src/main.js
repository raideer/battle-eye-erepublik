var settings = {};
var modules = null;
var storage = null;
var battleEyeLive = {
    init: function(){
        var self = this;
        console.log('Battle Eye INIT');

        storage = self.settingsStorage = new Storage();
        if(storage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        //Defining default settings
        storage.define('showOtherDivs', true, 'Structure', "Show other divisions");
        storage.define('reduceLoad', false, 'Performance', "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance");
        storage.define('highlightDivision', true, 'Visual', "Highlight current division");
        storage.define('highlightValue', true, 'Visual', "Highlight winning side");
        storage.define('showAverageDamage', false, 'Structure', "Show average damage dealt");
        storage.define('showKills', false, 'Structure', "Show kills done by each division");
        storage.define('showDpsBar', true, 'Bars', "Show DPS bar");
        storage.define('showDamagePerc', true, 'Structure', "Show Damage percentages");
        storage.define('showDamageBar', true, 'Bars', "Show Damage bar");
        storage.define('gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time.");
        storage.define('enableLogging', false, 'Other', "Enable logging to console");

        modules = new ModuleLoader(self.settingsStorage);
        modules.load(new AutoShooter());
        modules.load(new Other());
        //
        //Loading settings
        storage.loadSettings();
        settings = storage.getAll();
        //

        self.events = new EventHandler();
        self.teamA = new Stats(SERVER_DATA.leftBattleId);
        self.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        self.teamB = new Stats(SERVER_DATA.rightBattleId);
        self.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

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
                        leftDmg += Number(hit.value.replace(/[,\.]/g,''));
                    }

                    for(var i in rightDamage['div' + div]){
                        var hit = rightDamage['div' + div][i];
                        rightDmg += Number(hit.value.replace(/[,\.]/g,''));
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
                    self.teamA.divisions.get('div' + div).hits += leftKl;
                    self.teamB.divisions.get('div' + div).hits += rightKl;
                }
            });
        }

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version
        });

        self.layout.update(self.getTeamStats());

        pomelo.disconnect = function() {}

        self.checkForUpdates();

        [].forEach.call(document.querySelectorAll('.bel-settings-field'), function(div){
            div.addEventListener('change', function(event){
                var input = event.target;

                if(input.type == "checkbox"){
                    var value = input.checked;
                }else{
                    var value = input.value;
                }
                self.settingsStorage.set(input.name, value);
                settings[input.name].value = value;
            });
        });

        self.runTicker();
        self.handleEvents();
        modules.run();
    },

    resetSettings: function() {
        storage.loadDefaults();
        settings = storage.getAll();
    },

    checkForUpdates: function() {
        $j.get('https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/data.json', function(data) {
            var version = parseInt(data.version.replace(/\D/g,""));
            var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
            if(currentVersion != version){
                document.querySelector('.bel-version').classList.add('bel-version-outdated');
                document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/battle-eye-live.user.js">Update</a>';
            }
        });
    },

    getTeamStats: function(){
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleStats: function(callback){
        var self = this;
        var token = csrfToken;
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

            $j.post('http://www.erepublik.com/en/military/battle-console',{
                _token: window.csrfToken,
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
                    page++;
                    whileCb();
                }, 'damage');

            },function(){
                return page < maxPage;
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
                    page++;

                    whileCb();
                }, 'kills');
            },function(){
                return page < maxPage;
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

            self.handle(data);
		};

        pomelo.on('onMessage', handler);
    },
    handle: function(data){
        var self = this;

        // console.log(data);

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
