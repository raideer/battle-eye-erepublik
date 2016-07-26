var battleEyeLive = {
    init: function(){
        var self = this;
        console.log('Battle Eye INIT');
        self.window = unsafeWindow;

        var storage = self.settingsStorage = new Storage();
        if(storage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

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

        self.settings = storage.getAll();

        self.events = new EventHandler();
        self.teamA = new Stats(self.window.SERVER_DATA.leftBattleId);
        self.teamAName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.leftBattleId];
        self.teamB = new Stats(self.window.SERVER_DATA.rightBattleId);
        self.teamBName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.rightBattleId];

        if(self.settings.gatherBattleStats.value){
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

        self.layout.update(self.getTeamStats(), self.settings);

        self.window.pomelo.disconnect = exportFunction(function() {
        }, self.window);

        self.checkForUpdates();

        [].forEach.call(document.querySelectorAll('.bel-settings-field'), function(div){
            div.addEventListener('change', function(event){
                var input = event.target;
                var value = input.checked;
                self.settingsStorage.set(input.name, input.checked);
                self.settings[input.name].value = input.checked;
            });
        });

        self.runTicker();
        self.handleEvents();
    },

    checkForUpdates: function() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/data.json",
            onload: function(response) {
                var data = JSON.parse(response.responseText);
                var version = parseInt(data.version.replace(/\D/g,""));
                var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
                if(currentVersion != version){
                    document.querySelector('.bel-version').classList.add('bel-version-outdated');
                    document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/battle-eye-live.user.js">Update</a>';
                }
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
        var token = document.querySelector('input[name="_token"]').value;
        var battleId = self.window.SERVER_DATA.battleId;
        var division = self.window.SERVER_DATA.division;
        var attacker = self.window.SERVER_DATA.leftBattleId;
        var defender = self.window.SERVER_DATA.rightBattleId;
        var round = self.window.SERVER_DATA.zoneId;

        var attackerData = {div1: [], div2: [], div3: [], div4: [], div11: []};
        var defenderData = {div1: [], div2: [], div3: [], div4: [], div11: []};;
        var attackerKillData = {div1: [], div2: [], div3: [], div4: [], div11: []};;
        var defenderKillData = {div1: [], div2: [], div3: [], div4: [], div11: []};;

        var request = function(div,pageLeft,pageRight,cb,type) {
            if(type == undefined){
                type = 'damage';
            }
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://www.erepublik.com/en/military/battle-console",
                data: '_token='+token+'&action=battleStatistics&battleId='+battleId+'&division='+div+'&leftPage='+pageLeft+'&rightPage='+pageRight+'&round='+round+'&type='+type+'&zoneId=1',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function(response) {
                    var data = JSON.parse(response.responseText);
                    cb(data);
                }
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

        var divRange = (division == 11)?[11]:[1,2,3,4];

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
            self.layout.update(self.getTeamStats(), self.settings);
        });
    },

    overridePomelo: function(){
        var self = this;

        var handler = function(data) {
			if(self.window.currentPlayerDisplayRateValue !== "Maximum") {
				if(self.window.battleFX.checkPlayerDisplayRate(self.window.currentPlayerDisplayRateValue)) {
					self.window.battleFX.populatePlayerData(data);
				}
			} else {
				self.window.battleFX.populatePlayerData(data);
			}

            self.handle(data);
		};

        self.window.pomelo.on('onMessage', exportFunction(handler, unsafeWindow));
    },
    handle: function(data){
        var self = this;

        // console.log(data);

        self.teamA.handle(data);
        self.teamB.handle(data);
        if(!self.settings.reduceLoad.value){
            self.layout.update(self.getTeamStats(), self.settings);
        }
    }
};

battleEyeLive.init();
setTimeout(function(){
    battleEyeLive.overridePomelo();
    //Removing that annoying cometchat background
    var waitForCometchat = setInterval(fixCometchat, 500);
    function fixCometchat(){
        var cometchat = document.getElementById('cometchat_base');
        if(cometchat !== null){
            var style = "width:auto;position:aboslute;right:0;background:none;";
            cometchat.setAttribute('style', style);
            clearInterval(waitForCometchat);
        }
    }
}, 2000);
