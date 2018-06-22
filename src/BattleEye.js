import Stats from './classes/Stats';
import Layout from './classes/Layout';
import EventHandler from './classes/EventHandler';

import BattleStatsLoader from './BattleStatsLoader';
import ExcelGenerator from './ExcelGenerator';
import $ from 'jQuery';

export default class BattleEye {
    constructor() {
        this.version = '2.0.4';
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

            return Promise.resolve();
        })
        .then(() => {
            this.layout.update(this.getTeamStats());

            window.ajaxSuccess.push((data, url) => {
                // If data is nbp-stats
                if (url.match('nbp-stats')) {
                    BattleStatsLoader.calibrateDominationPercentages(data, this.teamA, this.teamB, this.second);
                }
            });
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

    async checkForUpdates() {
        let data;
        try {
            data = await $.getJSON('https://dl.dropboxusercontent.com/s/mz1p3g7pyiu69qx/data.json');
            this.contributors = data.contributors;
            this.displayContributors();

            if (data.knownErrors) {
                this.knownErrors = data.knownErrors;
            }

            if (data.api) {
                this.apiURL = data.api;
            }

            // const version = parseInt(data.version.replace(/\D/g, ''));
            // const currentVersion = parseInt(this.version.replace(/\D/g, ''));
            // if (currentVersion != version) {
            //     belLog('Versions do not match!');
            //     $('#battleeye-version').addClass('is-warning').removeClass('is-main').after(`
            //         <a href="${data.updateUrl}" id="battleeye-update" class="tag is-danger">
            //             Update available
            //         </a>
            //     `);
            // }

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
        $('.bel-contributor').each(() => {
            $(this).removeClass('bel-contributor')
            .removeAttr('style')
            .removeAttr('original-title');
        });

        for (const color in this.contributors) {
            const players = this.contributors[color];
            for (const j in players) {
                var cId = players[j];
                if (erepublik.citizen.citizenId == cId) {
                    $('#battleConsole .left_player .player_name').css({
                        textShadow: `0 0 10px ${color}`,
                        color: `${color}`
                    }).attr('original-title', 'BattleEye contributor').tipsy();
                } else if ($(`li[data-citizen-id="${cId}"] .player_name a`).length > 0) {
                    $(`li[data-citizen-id="${cId}"] .player_name a`).css({
                        textShadow: `0 0 10px ${color}`,
                        color: color
                    }).attr('original-title', 'BattleEye contributor').addClass('bel-contributor').tipsy();
                }
            }
        }
    }

    getTeamStats() {
        return {
            left: this.teamA.toObject(),
            right: this.teamB.toObject()
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
            if (second % 3 === 0 && this.updateContributors === true) {
                this.updateContributors = false;
                this.displayContributors();
            }

            this.teamA.updateDps(second);
            this.teamB.updateDps(second);

            if (second % this.updateRate === 0) {
                this.layout.update(this.getTeamStats());
            }
        };

        this.events.on('tick', handleTick.bind(this));
    }

    overridePomelo() {
        const messageHandler = data => {
            this.updateContributors = true;
            this.handle(data);
        };

        const closeHandler = data => {
            belLog(`Socket closed [${data.reason}]`);
            this.connected = false;
            this.layout.update(this.getTeamStats());
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));

        this.layout.update(this.getTeamStats());
        this.checkForUpdates();
    }

    handle(data) {
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.connected = true;
    }
}
