import Stats from './classes/Stats';
import Layout from './classes/Layout';
import EventHandler from './classes/EventHandler';

import BattleStatsLoader from './BattleStatsLoader';
import ExcelGenerator from './ExcelGenerator';

export default class BattleEye {
    constructor() {
        belTime('battleEyeConstructor');

        this.connected = true;

        this.second = 0;
        this.contributors = {};
        this.alerts = {};

        if (window.BattleEyeStorage === false) {
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        window.BattleEyeStorage.loadSettings();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();

        this.events = new EventHandler();

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
            version: GM_info.script.version,
            revolutionCountry: this.revolutionCountry
        }, this);

        this.layout.update(this.getTeamStats());
        this.checkForUpdates();
        BattleStatsLoader.getNbpStats(SERVER_DATA.battleId)
        .then(async data => {
            if (data.zone_finished) {
                $j('#bel-loading').hide();
                return;
            }

            if (BattleEyeSettings.gatherBattleStats.value) {
                const stats = await BattleStatsLoader.loadStats();
                BattleStatsLoader.processStats(stats, this.teamA, this.teamB);
                this.events.emit('log', 'Battle stats loaded.');
            }

            if (BattleEyeSettings.fixPercentages.value) {
                BattleStatsLoader.fixDamageDifference(data, this.teamA, this.teamB);
            }
        })
        .then(() => {
            $j('#bel-loading').hide();
            this.layout.update(this.getTeamStats());

            window.ajaxSuccess.push((data, url) => {
                // If data is nbp-stats
                if (url.match('nbp-stats')) {
                    if (BattleEyeSettings.fixPercentages.value) {
                        BattleStatsLoader.fixDamageDifference(data, this.teamA, this.teamB);
                        belLog('Fixed dif');
                    }
                }
            });
        });

        this.defineListeners();

        this.runTicker();

        this.handleEvents();
        belTimeEnd('battleEyeConstructor');
    }

    defineListeners() {
        $j('.bel-settings-field').on('change', event => {
            const input = event.target;
            let value;

            if (input.type == 'checkbox') {
                value = input.checked;
            } else {
                value = input.value;
            }

            window.BattleEyeStorage.set(input.name, value);
            window.BattleEyeSettings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            this.events.emit('log', `Updated setting ${input.name} to ${value}`);
            $j(`label[for="${targetAtt}"]`).notify('Saved', { position: 'right middle', className: 'success' });
        });
    }

    sortByValue(obj) {
        const sorted = {};
        const sortedKeys = Object.keys(obj).sort((a, b) => { return obj[a] - obj[b]; }).reverse();

        for (var i in sortedKeys) {
            sorted[sortedKeys[i]] = obj[sortedKeys[i]];
        }

        return sorted;
    }

    exportStats(type, data) {
        ExcelGenerator.exportStats(type, data);
    }

    processBattleStats(data, teamA, teamB) {
        const divs = [1, 2, 3, 4, 11];

        if (!data) {
            belLog('undefined data - returning');
            return;
        }

        for (const d in divs) {
            const div = divs[d];
            let leftDmg = 0;
            let rightDmg = 0;
            let leftKl = 0;
            let rightKl = 0;

            ['leftDamage', 'rightDamage'].forEach(side => {
                for (const i in data[side][`div${div}`]) {
                    const hit = data[side][`div${div}`][i];
                    const dmg = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,.]/g, ''));

                    const bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    if (side == 'leftDamage') {
                        leftDmg += dmg;
                        teamA.countries.handleBare(bareData);
                        teamA.divisions.get(`div${div}`).countries.handleBare(bareData);
                    } else {
                        rightDmg += dmg;
                        teamB.countries.handleBare(bareData);
                        teamB.divisions.get(`div${div}`).countries.handleBare(bareData);
                    }
                }
            });

            ['leftKills', 'rightKills'].forEach(side => {
                for (const i in data[side][`div${div}`]) {
                    const hit = data[side][`div${div}`][i];
                    const killValue = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,.]/g, ''));
                    if (side == 'leftKills') {
                        leftKl += killValue;
                        teamA.countries.handleKills(hit.country_permalink, killValue);
                        teamA.divisions.get(`div${div}`).countries.handleKills(hit.country_permalink, killValue);
                    } else {
                        rightKl += killValue;
                        teamB.countries.handleKills(hit.country_permalink, killValue);
                        teamB.divisions.get(`div${div}`).countries.handleKills(hit.country_permalink, killValue);
                    }
                }
            });

            teamA.divisions.get(`div${div}`).damage += leftDmg;
            teamB.divisions.get(`div${div}`).damage += rightDmg;
            teamA.damage += leftDmg;
            teamB.damage += rightDmg;
            teamA.divisions.get(`div${div}`).hits += leftKl;
            teamB.divisions.get(`div${div}`).hits += rightKl;
            teamA.hits += leftKl;
            teamB.hits += rightKl;
        }
    }

    resetSettings() {
        window.BattleEyeStorage.loadDefaults();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();
    }

    async checkForUpdates() {
        try {
            const data = await $j.getJSON('https://dl.dropbox.com/s/mz1p3g7pyiu69qx/data.json');
            this.contributors = data.contributors;
            this.alerts = data.alerts;
            this.displayContributors();

            const version = parseInt(data.version.replace(/\D/g, ''));
            const currentVersion = parseInt(GM_info.script.version.replace(/\D/g, ''));
            if (currentVersion != version) {
                document.querySelector('#bel-version .bel-alert').classList.add('bel-alert-danger');
                document.querySelector('#bel-version').innerHTML += `<a class="bel-btn" href="${data.updateUrl}">Update</a>`;
            }

            belLog('Data JSON received and processed');
            this.events.emit('log', 'Data.json synced');
            return data;
        } catch (e) {
            belLog('Failed to download data.json');
            console.error('Failed to download data.json');
        }
    }

    async generateSummary() {
        const data = [];
        this.step = 1;
        this.events.emit('log', 'Generating summary...');

        for (let round = 1; round <= SERVER_DATA.zoneId; round++) {
            let divs = [1, 2, 3, 4];

            if (round % 4 === 0) {
                divs = [11];
            }

            const stats = await BattleStatsLoader.loadStats(round, divs);
            this.events.emit('summary.update', round);
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
        $j('.bel-contributor').each(() => {
            $j(this).removeClass('bel-contributor')
            .removeAttr('style')
            .removeAttr('original-title');
        });

        for (const color in this.contributors) {
            const players = this.contributors[color];
            for (const j in players) {
                var cId = players[j];
                if (erepublik.citizen.citizenId == cId) {
                    $j('#battleConsole .left_player .player_name').css({
                        textShadow: `0 0 10px ${color}`,
                        color: `${color}`
                    }).attr('original-title', 'BattleEye contributor').tipsy();
                } else if ($j(`li[data-citizen-id="${cId}"] .player_name a`).length > 0) {
                    $j(`li[data-citizen-id="${cId}"] .player_name a`).css({
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
            if (second % 3 === 0 && this.updateContributors) {
                this.updateContributors = false;
                this.displayContributors();
            }

            this.teamA.updateDps(second);
            this.teamB.updateDps(second);
            this.layout.update(this.getTeamStats());
        };

        this.events.on('tick', handleTick.bind(this));
    }

    overridePomelo() {
        const messageHandler = data => {
            this.updateContributors = true;
            this.handle(data);
        };

        const closeHandler = data => {
            console.log(data);
            belLog(`Socket closed [${data.reason}]`);
            this.connected = false;
            this.layout.update(this.getTeamStats());
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));
    }

    handle(data) {
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.connected = true;
    }
}
