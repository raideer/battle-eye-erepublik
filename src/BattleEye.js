import Stats from './classes/Stats';
import Layout from './classes/Layout';
import EventHandler from './classes/EventHandler';

import BattleStatsLoader from './BattleStatsLoader';
import ExcelGenerator from './ExcelGenerator';
import $ from 'jQuery';

const SERVER_DATA = window.SERVER_DATA;
const erepublik = window.erepublik;

export default class BattleEye {
    constructor() {
        this.version = '2.0.6';
        this.connected = true;
        this.loading = true;

        this.second = 0;
        this.contributors = {};
        this.knownErrors = [];
        this.apiURL = 'https://battleeye.raideer.xyz';

        this.events = new EventHandler();
        this.updateRate = BattleEyeStorage.get('layoutUpdateRate');

        this.teamA = new Stats(SERVER_DATA.leftBattleId);
        this.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        this.teamB = new Stats(SERVER_DATA.rightBattleId);
        this.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        this.teamA.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
        this.teamB.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

        this.firstKills = null;

        this.revolutionCountry = null;
        if (SERVER_DATA.isCivilWar) {
            if (SERVER_DATA.invaderId == SERVER_DATA.leftBattleId) {
                this.teamA.revolution = true;
                this.teamAName = `${this.teamBName} Revolution`;
                this.revolutionCountry = this.teamBName;
            } else {
                this.teamB.revolution = true;
                this.teamBName = `${this.teamAName} Revolution`;
                this.revolutionCountry = this.teamBName;
            }
        }

        pomelo.disconnect = () => {
            // tried to dc
            setTimeout(() => {
                this.connected = true;
            }, 2000);
        };


        this.layout = new Layout({
            teamAName: this.teamAName,
            teamBName: this.teamBName,
            version: this.version,
            revolutionCountry: this.revolutionCountry
        }, this);

        BattleStatsLoader.getNbpStats(SERVER_DATA.battleId)
        .then(data => {
            if (data.zone_finished) {
                $('#battleeye-loading').hide();
                return Promise.resolve();
            }

            BattleStatsLoader.loadStats().then(stats => {
                BattleStatsLoader.processStats(stats, this.teamA, this.teamB);
                this.events.emit('log', 'Battle stats loaded.');
                $('#battleeye-loading').hide();

                BattleStatsLoader.calibrateDominationPercentages(data, this.teamA, this.teamB, this.second);
            });

            this.fetchBattleEyeData();

            return Promise.resolve();
        })
        .then(() => {
            this.layout.update(this.getTeamStats());

            window.ajaxSuccess.push((data, url) => {
                // If data is nbp-stats
                if (url.match('nbp-stats')) {
                    this.nbpStats = data;
                    BattleStatsLoader.calibrateDominationPercentages(data, this.teamA, this.teamB, this.second);
                }
            });

            BattleStatsLoader.getFirstKills(SERVER_DATA.battleId).then(kills => {
                this.firstKills = kills;
            });

            this.notifyConnection(true);
        });

        this.runTicker();

        this.handleEvents();
    }

    reload() {
        $('#battleeye__minimonitor').remove();
        $('#battleeye__live').remove();
        clearInterval(this.interval);
        window.BattleEye = new BattleEye();
        window.BattleEye.overridePomelo();
    }

    exportStats(type, data) {
        ExcelGenerator.exportStats(type, data);
    }

    resetSettings() {
        window.BattleEyeStorage.loadDefaults();
    }

    async fetchBattleEyeData() {
        belLog('Fetching data.json');
        let data;
        try {
            data = await $.getJSON('https://cdn.raideer.xyz/data.json');
            this.contributors = data.contributors;

            this.displayContributors();

            if (data.knownErrors) {
                this.knownErrors = data.knownErrors;
            }

            belLog('Data JSON received and processed');
            this.events.emit('log', 'Data.json synced');
        } catch (e) {
            belLog('Failed to download data.json');
            throw e;
        }

        try {
            if (!data) return;
            $.ajax({
                type: 'POST',
                url: `${this.apiURL}/touch`,
                data: {
                    citizen: erepublik.citizen.citizenId,
                    version: this.version
                }
            }).then(() => {
                belLog('API touched');
                this.events.emit('log', 'API touched');
            });
        } catch (e) {
            belLog('Failed to reach the API');
            throw e;
        }
    }

    async generateSummary() {
        const data = [];
        this.events.emit('log', 'Generating summary...');

        for (let round = 1; round <= SERVER_DATA.zoneId; round++) {
            let divs = [1, 2, 3, 4];

            if (round % 4 === 0) {
                divs = [11];
            }

            const stats = await BattleStatsLoader.loadStats(round, divs, state => {
                this.events.emit('summary.update', state);
            });

            data[round] = stats;
        }

        const leftTotalStats = new Stats(SERVER_DATA.leftBattleId);
        const rightTotlaStats = new Stats(SERVER_DATA.rightBattleId);
        const roundStats = [];

        leftTotalStats.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
        rightTotlaStats.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

        for (const round in data) {
            const stats = data[round];
            if (!roundStats) continue;
            BattleStatsLoader.processStats(stats, leftTotalStats, rightTotlaStats);
            roundStats[round] = {
                left: new Stats(SERVER_DATA.leftBattleId),
                right: new Stats(SERVER_DATA.rightBattleId)
            };

            roundStats[round].left.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
            roundStats[round].right.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

            BattleStatsLoader.processStats(stats, roundStats[round].left, roundStats[round].right);
            this.events.emit('log', `Processed round ${round + 1}`);
        }

        for (const i in roundStats) {
            roundStats[i].left = roundStats[i].left.toObject();
            roundStats[i].right = roundStats[i].right.toObject();
        }

        this.events.emit('summary.finished', [leftTotalStats.toObject(), rightTotlaStats.toObject(), roundStats, data]);
        this.events.emit('log', 'Summary data fetching done');
    }

    displayContributors() {
        const styles = [];

        const playerIsContributor = this.isPlayerContributor();
        if (playerIsContributor) {
            $('.left_player .player_name').css({
                textShadow: `0 0 10px ${playerIsContributor}`,
                color: `${playerIsContributor}`
            }).attr('original-title', 'Thank you for supporting BattleEye!').tipsy();
        }

        const ids = [];

        for (const color in this.contributors) {
            const colorStyles = this.contributors[color].map(id => {
                return `li[data-citizen-id="${id}"] .player_name a`;
            });

            styles.push(`${colorStyles.join(', ')} { textShadow: 0 0 10px ${color} !important; color: ${color} !important; }`);
            ids.push(colorStyles);
        }

        $('head').append(`
            <style>
                ${styles.join(' ')}
            </style>
        `);
    }

    isPlayerContributor(citizen = erepublik.citizen.citizenId) {
        let res = null;

        for (const color in this.contributors) {
            for (const i in this.contributors[color]) {
                if (this.contributors[color][i] == citizen) {
                    res = color;
                    break;
                }
            }

            if (res) break;
        }

        return res;
    }

    getTeamStats() {
        return {
            left: this.teamA.toObject(),
            right: this.teamB.toObject(),
            firstKills: this.firstKills
        };
    }

    runTicker() {
        const ticker = () => {
            this.second++;
            this.events.emit('tick', this.second);
        };

        this.interval = setInterval(ticker.bind(this), 1000);
    }

    handleEvents() {
        const handleTick = second => {
            this.teamA.updateDps(second);
            this.teamB.updateDps(second);

            if (second % this.updateRate === 0) {
                this.layout.update(this.getTeamStats());
            }
        };

        this.events.on('tick', handleTick.bind(this));
    }

    notifyConnection(connected = true) {
        if (connected) {
            $('#be_connected')
            .addClass('is-connected')
            .removeClass('is-disconnected')
            .attr('original-title', 'Connection to the server successfully established').tipsy();
        } else {
            $('#be_connected')
            .addClass('is-disconnected')
            .removeClass('is-connected')
            .attr('original-title', 'Not connected to the server!').tipsy();
        }
    }

    overridePomelo() {
        const messageHandler = data => {
            this.handle(data);
        };

        const closeHandler = data => {
            belLog(`Socket closed [${data.reason}]`);
            this.connected = false;
            this.layout.update(this.getTeamStats());
            this.notifyConnection(false);
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));

        this.layout.update(this.getTeamStats());
    }

    handle(data) {
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.connected = true;
    }
}
