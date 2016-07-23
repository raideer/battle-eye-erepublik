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
