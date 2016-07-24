var battleEyeLive = {
    init: function(){
        var self = this;
        console.log('Battle Eye INIT');
        self.window = unsafeWindow;

        var storage = self.settingsStorage = new Settings();
        if(storage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        storage.define('hideOtherDivs', false, "Hide other divisions");
        storage.define('reduceLoad', false, "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance");
        storage.define('highlightDivision', true, "Highlight current division");
        storage.define('showAverageDamage', false, "Show average damage dealt");
        storage.define('showKills', true, "Show kills done by each division");
        storage.define('showDpsBar', true, "Show DPS bar");
        storage.define('showDamageBar', false, "Show Damage bar");

        self.settings = storage.getAll();

        self.events = new EventHandler();
        self.teamA = new Stats(self.window.SERVER_DATA.leftBattleId);
        self.teamAName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.leftBattleId];
        self.teamB = new Stats(self.window.SERVER_DATA.rightBattleId);
        self.teamBName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.rightBattleId];

        self.getBattleDamageStats(function(left, right){
            for(var div = 1; div < 4; div++){
                var leftDmg = 0;
                var rightDmg = 0;

                for(var i in left['div' + div]){
                    var hit = left['div' + div][i];
                    leftDmg += Number(hit.value.replace(/[,\.]/g,''));
                }

                for(var i in right['div' + div]){
                    var hit = right['div' + div][i];
                    rightDmg += Number(hit.value.replace(/[,\.]/g,''));
                }

                console.log(leftDmg);
                console.log(self.teamA.divisions.get('div' + div));

                self.teamA.divisions.get('div' + div).damage += leftDmg;
                self.teamB.divisions.get('div' + div).damage += rightDmg;
            }
        });

        self.overridePomelo();

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version
        }, {'all': self.settings});

        [].forEach.call(document.querySelectorAll('.bel-settings-field'), function(div){
            div.addEventListener('change', function(event){
                var input = event.target;
                var value = input.checked;
                self.settingsStorage.set(input.name, input.checked);
                self.settings[input.name].value = input.checked
            });
        });

        self.runTicker();
        self.handleEvents();
    },

    getTeamStats: function(){
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleDamageStats: function(callback){
        var self = this;
        var token = document.querySelector('input[name="_token"]').value;
        var battleId = self.window.SERVER_DATA.battleId;
        var division = self.window.SERVER_DATA.division;
        var attacker = self.window.SERVER_DATA.leftBattleId;
        var defender = self.window.SERVER_DATA.rightBattleId;
        var round = Number(document.querySelector('#round_number').innerHTML.match(/\d/)[0]);

        var attackerData = {
            div1: [],div2: [],div3: [],div4: []
        };
        var defenderData = {
            div1: [],div2: [],div3: [],div4: []
        };

        var request = function(div,pageLeft,pageRight,cb) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://www.erepublik.com/en/military/battle-console",
                data: '_token='+token+'&action=battleStatistics&battleId='+battleId+'&division='+div+'&leftPage='+pageLeft+'&rightPage='+pageRight+'&round='+round+'&type=damage&zoneId=1',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function(response) {
                    var data = JSON.parse(response.responseText);
                    console.log(data);
                    cb(data);
                }
            });
        }

        var handler = function(div, cb){
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function(whileCb){
                request(div,page,page,function(data) {
                    console.log(page);
                    saveFighterData(data, div);
                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    page++;

                    whileCb();
                });
            },function(){
                return page < maxPage;
            },function() {
                // console.log('do while ended')
                cb();
            });
        };

        var saveFighterData = function(data, div) {
            // console.log('saving data');
            for(var i in data[attacker].fighterData){
                attackerData['div'+div].push(data[attacker].fighterData[i]);
            }

            for(var i in data[defender].fighterData){
                defenderData['div'+div].push(data[defender].fighterData[i]);
            }
        }

        async.each([1,2,3,4], handler.bind(self), function(){
            if(typeof callback == 'function'){
                callback(attackerData, defenderData);
            }
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
            self.layout.update(self.getTeamStats());
        }
    }
};

setTimeout(function(){
    battleEyeLive.init();
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
