
var battleEyeLive = {
    init: function(){
        console.log('Battle Eye INIT');
        if(GM_info.scriptHandler == "Tampermonkey"){
            this.window = unsafeWindow;
        }else{
            this.window = window;
        }

        this.events = new EventHandler();
        this.teamA = new Stats(this.window.leftBattleId);
        this.teamB = new Stats(this.window.rightBattleId);
        this.overridePomelo();
        this.layout = new Layout();
        this.runTicker();

        this.handleEvents();
    },
    getTeamStats(){
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
        self.window.pomelo.on('onMessage', function(data) {
			if(self.window.currentPlayerDisplayRateValue !== "Maximum") {
				if(self.window.battleFX.checkPlayerDisplayRate(self.window.currentPlayerDisplayRateValue)) {
					self.window.battleFX.populatePlayerData(data);
				};
			} else {
				self.window.battleFX.populatePlayerData(data);
			}

            self.handle(data);
		});
    },
    handle: function(data){
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.layout.update(this.getTeamStats());
    }
};

setTimeout(function(){
    battleEyeLive.init();
}, 1000);
