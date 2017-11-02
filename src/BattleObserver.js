import Team from './stats/Team';
import Layout from './Layout';
import BattleStatsLoader from './BattleStatsLoader';

export default class BattleObserver {
    constructor() {
        this.clock = null;
        this.clockSecond = 0;
        this.teams = {};

        this.teams.left = new Team(SERVER_DATA.leftBattleId,
            SERVER_DATA.countries[SERVER_DATA.leftBattleId]);
        this.teams.right = new Team(SERVER_DATA.rightBattleId,
            SERVER_DATA.countries[SERVER_DATA.rightBattleId]);

        if (SERVER_DATA.isCivilWar) {
            if (SERVER_DATA.invaderId == this.teams.left.id) {
                this.teams.left.revolution = true;
            } else {
                this.teams.right.revolution = true;
            }
        }

        this.layout = new Layout();
        // BattleStatsLoader.loadStats()
        // .then(stats => BattleStatsLoader.processStats(stats, this.teams));
    }

    onTick() {
        this.clockSecond++;

        this.teams.left.updateDps(this.clockSecond);
        this.teams.right.updateDps(this.clockSecond);

        this.layout.update(this.teams);
    }

    // Gets called from index
    run() {
        console.log('Running BO');
        pomelo.on('onMessage', this.handleMessage.bind(this));
        pomelo.on('close', this.handleClose.bind(this));

        // Starts the internal clock / calls onTick every second
        this.clock = setInterval(this.onTick.bind(this), 1000);
    }

    handleMessage(data) {
        if (this.teams.left.id === data.side) {
            this.teams.left.handle(data, this.clockSecond);
        } else if (this.teams.right.id === data.side) {
            this.teams.right.handle(data, this.clockSecond);
        }
    }

    handleClose(message) {
        // Socket closed
        console.error('Pomelo socket closed', message);
    }
}
