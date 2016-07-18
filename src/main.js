
var battleEyeLive = {
    init: function(){
        console.log('Battle Eye INIT');
        this.window = unsafeWindow;

        this.events = new EventHandler();
        this.teamA = new Stats(this.window.SERVER_DATA.leftBattleId);
        this.teamAName = this.window.SERVER_DATA.countries[this.window.SERVER_DATA.leftBattleId]
        this.teamB = new Stats(this.window.SERVER_DATA.rightBattleId);
        this.teamBName = this.window.SERVER_DATA.countries[this.window.SERVER_DATA.rightBattleId]
        this.overridePomelo();
        this.layout = new Layout(new Stylesheet());
        this.runTicker();
        this.handleEvents();
    },
    getTeamStats(){
        return {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
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
        }

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
				};
			} else {
				self.window.battleFX.populatePlayerData(data);
			}

            self.handle(data);
		};

        self.window.pomelo.on('onMessage', exportFunction(handler, unsafeWindow));
    },
    handle: function(data){
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.layout.update(this.getTeamStats());
    }
};

setTimeout(function(){
    battleEyeLive.init();
    //Removing that annoying cometchat background
    var waitForCometchat = setInterval(fixCometchat, 500);
    function fixCometchat(){
        var cometchat = document.getElementById('cometchat_base');
        if(cometchat != null){
            var style = "width:auto;position:aboslute;right:0;background:none;";
            cometchat.setAttribute('style', style);
            clearInterval(waitForCometchat);
        }
    }
}, 2000);
