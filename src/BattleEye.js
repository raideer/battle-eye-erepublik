import Layout from './classes/Layout';
import Side from './classes/stats/Side';
import Deployer from './classes/Deployer';
import EventHandler from './classes/EventHandler';
import { currentDamage, cloneObject, loadImage } from './classes/Utils';

import { createStore, combineReducers } from 'redux';
import $ from 'jQuery';

import BattleStatsLoader from './BattleStatsLoader';
import ExcelGenerator from './ExcelGenerator';

export default class BattleEye {
    constructor() {
        this.version = '2.2.0';
        this.fktVersion = null; // Current First Kill Tracker version
        this.connected = true; // Has BE connected to the socket
        this.loading = true; // Is BattleEye still loading
        this.deployer = new Deployer(this);

        this.store = createStore(combineReducers({
            main: this.reducer,
            deployer: this.deployer.reducer
        }));

        this.muData = null;

        this.interval = null; // Holds the main clock
        this.second = 0; // Current second
        this.nbpStats = null; // Last fetched nbp data
        this.contributors = {}; // List of contributors
        this.knownErrors = []; // List of known errors fetched from data.json
        this.apiURL = 'https://battleeye.raideer.xyz';

        this.events = new EventHandler();
        this.updateRate = BattleEyeStorage.get('layoutUpdateRate');

        this.statsA = new Side(window.SERVER_DATA.leftBattleId);
        this.statsB = new Side(window.SERVER_DATA.rightBattleId);

        this.personalDamage = currentDamage();

        this.layout = new Layout();

        BattleStatsLoader.getNbpStats(window.SERVER_DATA.battleId)
        .then(data => {
            if (data.zone_finished) {
                this.hideLoader();
                return Promise.resolve();
            }

            BattleStatsLoader.loadStats().then(stats => {
                BattleStatsLoader.processStats(stats, this.statsA, this.statsB);
                belLog('Battle stats loaded');
                this.hideLoader();

                BattleStatsLoader.calibrateDominationPercentages(data, this.statsA, this.statsB, this.second);
            });

            this.fetchBattleEyeData();

            return Promise.resolve();
        })
        .then(() => {
            this.layout.render();
            this.updateMuData();

            window.ajaxSuccess.push((data, url) => {
                // If data is nbp-stats
                if (url.match('nbp-stats')) {
                    this.store.dispatch({
                        type: 'UPDATE_NBP',
                        value: data,
                        second: this.second
                    });

                    BattleStatsLoader.calibrateDominationPercentages(data, this.statsA, this.statsB, this.second);
                } else if (url.match(/fight-shooot|fight-shoooot|deploy-bomb/) && !data.error && data.message == 'ENEMY_KILLED') {
                    this.personalDamage += data.user.givenDamage;
                    if (data.user.weaponQuantity >= 0) {
                        this.store.dispatch({
                            type: 'SET_WEAPON_AMOUNT',
                            qualityId: data.user.weaponId,
                            amount: parseInt(data.user.weaponQuantity)
                        });
                    }
                } else if (url.match('military/change-weapon')) {
                    this.store.dispatch({
                        type: 'SET_ACTIVE_WEAPON',
                        value: data.weaponId
                    });
                }
            });

            BattleStatsLoader.getHovercard(window.SERVER_DATA.citizenId).then(data => {
                this.store.dispatch({
                    type: 'MAIN_SET',
                    field: 'hovercard',
                    value: data
                });
            });


            this.loadFirstKills();

            this.notifyConnection(true);
        });

        this.runTicker();
    }

    async updateMuData() {
        let downloadMuData = false;

        if (BattleEyeStorage.has('muDataChecksum')) {
            const checksum = await BattleStatsLoader.getMuDataChecksum();

            if (BattleEyeStorage.get('muDataChecksum') != checksum) {
                downloadMuData = true;
            }
        } else {
            downloadMuData = true;
        }

        if (downloadMuData) {
            const data = await BattleStatsLoader.downloadMuData();
            this.muData = data.data.reduce((acc, unit) => {
                acc[unit.id] = unit;
                return acc;
            }, {});
            BattleEyeStorage.set('muDataChecksum', data.checksum);
            BattleEyeStorage.set('muData', JSON.stringify(this.muData));
            console.log('Downloaded latest muData');
        } else {
            this.muData = JSON.parse(BattleEyeStorage.get('muData'));
        }
    }

    loadCountryImage(countryCode) {
        const code = String(countryCode).toLowerCase();

        const images = this.store.getState().main.countryImages;

        if (images[code]) {
            return images[code];
        }

        const loading = loadImage(`https://cdn.jsdelivr.net/gh/hjnilsson/country-flags/png100px/${code}.png`);

        if (loading) {
            loading.then(data => {
                this.store.dispatch({
                    type: 'ADD_COUNTRY_IMAGE',
                    code,
                    value: data
                });
            });
        }

        return false;
    }

    reducer(oldState = {
        loading: true,
        hovercard: null,
        leftStats: null,
        rightStats: null,
        firstKills: {},
        nbp: null,
        lastNbp: 0,
        displayStats: 'countries',

        exportProgress: 0,
        exportProgressStatus: '',
        exportStep: 0,
        exportData: null,

        countryImages: {}
    }, action) {
        const state = cloneObject(oldState);

        switch (action.type) {
        case 'ADD_COUNTRY_IMAGE': {
            const images = cloneObject(state.countryImages);
            images[action.code] = action.value;
            state.countryImages = images;
            return state;
        }
        case 'MAIN_SET': {
            state[action.field] = action.value;
            return state;
        }
        case 'SET_EXPORT_STEP': {
            state.exportStep = parseInt(action.value);
            return state;
        }
        case 'UPDATE_EXPORT_PROGRESS': {
            state.exportProgress++;
            return state;
        }
        case 'SET_EXPORT_PROGRESS_STATUS': {
            state.exportProgressStatus = action.value;
            return state;
        }
        case 'SET_EXPORT_DATA': {
            state.exportData = JSON.parse(JSON.stringify(action.value));
            return state;
        }
        case 'UPDATE_STATS': {
            state.leftStats = JSON.parse(JSON.stringify(action.leftStats));
            // state.leftStats = cloneObject(action.leftStats);
            state.rightStats = JSON.parse(JSON.stringify(action.rightStats));
            // state.rightStats = cloneObject(action.rightStats);
            return state;
        }
        case 'UPDATE_FKT': {
            const fk = cloneObject(state.firstKills);
            fk[action.round] = action.value;
            state.firstKills = fk;
            return state;
        }
        case 'UPDATE_NBP': {
            state.nbp = action.value;
            state.lastNbp = action.second || 0;
            return state;
        }
        case 'CHANGE_STATS': {
            if (['countries', 'military_units'].indexOf(action.value) === -1) {
                return state;
            }

            state.displayStats = action.value;
            return state;
        }
        default:
            return oldState;
        }
    }

    loadFirstKills(round = window.SERVER_DATA.zoneId) {
        return BattleStatsLoader.getFirstKills(window.SERVER_DATA.battleId, round).then(kills => {
            this.store.dispatch({
                type: 'UPDATE_FKT',
                value: kills,
                round
            });
        });
    }

    hideLoader() {
        this.store.dispatch({
            type: 'MAIN_SET',
            field: 'loading',
            value: false
        });
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

    getCitizenInfo(citizenId) {
        return $.getJSON(`https://www.erepublik.com/${window.SERVER_DATA.culture}/main/citizen-profile-json/${citizenId}`);
    }

    async fetchBattleEyeData() {
        belLog('Fetching data.json');
        let data;
        try {
            data = await $.getJSON('https://cdn.raideer.xyz/data.json');
            this.contributors = data.contributors;
            this.fktVersion = data.fktVersion;

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
                    citizen: window.erepublik.citizen.citizenId,
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
        this.store.dispatch({ type: 'SET_EXPORT_STEP', value: 1 });

        const data = [];

        for (let round = 1; round <= window.SERVER_DATA.zoneId; round++) {
            let divs = [1, 2, 3, 4];

            if (round % 4 === 0) {
                divs = [11];
            }

            const stats = await BattleStatsLoader.loadStats(round, divs, state => {
                if (state.page == 1) {
                    this.store.dispatch({ type: 'UPDATE_EXPORT_PROGRESS' });
                }

                this.store.dispatch({
                    type: 'SET_EXPORT_PROGRESS_STATUS',
                    value: `[Round ${state.round}] Processed ${state.type} for division ${state.div} (${state.page}/${state.maxPage})`
                });
            });

            data[round] = stats;
        }

        this.store.dispatch({
            type: 'SET_EXPORT_PROGRESS_STATUS',
            value: 'Data fetching done. Organizing data'
        });

        const leftTotalStats = new Side(window.SERVER_DATA.leftBattleId);
        const rightTotalStats = new Side(window.SERVER_DATA.rightBattleId);
        const roundStats = [];
        const processStats = [];

        for (const round in data) {
            const stats = data[round];
            processStats.push([stats, leftTotalStats, rightTotalStats]);
            // await BattleStatsLoader.processStats(stats, leftTotalStats, rightTotalStats);
            roundStats[round] = {
                left: new Side(window.SERVER_DATA.leftBattleId),
                right: new Side(window.SERVER_DATA.rightBattleId)
            };
            processStats.push([stats, roundStats[round].left, roundStats[round].right]);
            // await BattleStatsLoader.processStats(stats, roundStats[round].left, roundStats[round].right);
        }

        await BattleStatsLoader.processStatsMultiple(processStats);

        for (const i in roundStats) {
            roundStats[i].left = roundStats[i].left.stats;
            roundStats[i].right = roundStats[i].right.stats;
        }

        this.store.dispatch({
            type: 'SET_EXPORT_DATA',
            value: {
                left: leftTotalStats.stats,
                right: rightTotalStats.stats,
                rounds: roundStats
            }
        });

        this.store.dispatch({ type: 'SET_EXPORT_STEP', value: 2 });
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

    isPlayerContributor(citizen = window.erepublik.citizen.citizenId) {
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

    runTicker() {
        const ticker = () => {
            this.second++;
            this.statsA.update(this.second);
            this.statsB.update(this.second);

            if (this.second % this.updateRate === 0) {
                this.updateStats();
            }
        };

        this.interval = setInterval(ticker, 1000);
    }

    updateStats() {
        this.store.dispatch({
            type: 'UPDATE_STATS',
            leftStats: this.statsA.stats,
            rightStats: this.statsB.stats
        });
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
            this.updateStats();
            this.notifyConnection(false);
        };

        pomelo.disconnect = () => {
            this.connected = false;
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));

        this.updateStats();
    }

    handle(data) {
        this.statsA.handle(data);
        this.statsB.handle(data);
        this.connected = true;
    }
}
