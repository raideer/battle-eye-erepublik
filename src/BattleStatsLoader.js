import { divisions, cloneObject, chunk, countryPermalinkToName, arrayUnique } from './classes/Utils';
import $ from 'jQuery';

const citizenUnits = {};

class BattleStatsLoader {
    async loadStats(round = window.SERVER_DATA.zoneId, divs = divisions, divProcessedCallback = null) {
        const leftData = {};
        const rightData = {};
        const leftId = window.SERVER_DATA.leftBattleId;
        const rightId = window.SERVER_DATA.rightBattleId;

        const collectStats = async (div, type) => {
            let page = 1;
            let maxPage = 1;
            do {
                const stats = await this.getStats(div, round, page, page, type);

                for (const i in stats[leftId].fighterData) {
                    const data = leftData[div];
                    data[type].push(stats[leftId].fighterData[i]);
                }

                for (const i in stats[rightId].fighterData) {
                    const data = rightData[div];
                    data[type].push(stats[rightId].fighterData[i]);
                }

                maxPage = Math.max(stats[leftId].pages, stats[rightId].pages);
                if (maxPage === 0) {
                    maxPage = 1;
                }

                belLog(`Processed ${type} for division ${div} round ${round} | ${page}/${maxPage}`);

                if (typeof divProcessedCallback == 'function') {
                    divProcessedCallback({
                        type, div, round, page, maxPage
                    });
                }

                page++;
            } while (page <= maxPage);
        };

        for (const division of divs) {
            leftData[division] = { kills: [], damage: [] };
            rightData[division] = { kills: [], damage: [] };
            await collectStats(division, 'damage');
            await collectStats(division, 'kills');
        }

        return {
            left: leftData,
            right: rightData
        };
    }

    _pairCitizenData(stats) {
        const data = {};
        const citizenIds = [];

        ['left', 'right'].forEach(side => {
            for (const div in stats[side]) {
                if (!data[side]) {
                    data[side] = {
                        1: [],
                        2: [],
                        3: [],
                        4: [],
                        11: []
                    };
                }

                for (const damage of stats[side][div].damage) {
                    const newDamage = cloneObject(damage);
                    newDamage.damage = damage.raw_value;
                    delete newDamage.value;
                    delete newDamage.raw_value;
                    data[side][div].push(newDamage);
                    citizenIds.push(damage.citizenId);
                }

                for (const kill of stats[side][div].kills) {
                    const entry = data[side][div].find(i => i.citizenId == kill.citizenId);
                    if (!entry) {
                        belLog('No entry pair for', kill.citizenId);
                        continue;
                    }

                    const newKill = cloneObject(kill);

                    newKill.kills = kill.raw_value;
                    delete newKill.value;
                    delete newKill.raw_value;

                    const i = data[side][div].indexOf(entry);
                    data[side][div][i] = Object.assign(entry, newKill);
                }
            }
        });

        return [data, citizenIds];
    }

    _assignStats(data, statsLeft, statsRight) {
        ['left', 'right'].forEach(side => {
            for (const div in data[side]) {
                for (const citizen of data[side][div]) {
                    const statsSide = side === 'left' ? statsLeft : statsRight;

                    statsSide.stats.damage += citizen.damage;
                    statsSide.stats.kills += citizen.kills;

                    if (!statsSide.stats.countries[citizen.country_permalink]) {
                        statsSide.stats.countries[citizen.country_permalink] = {
                            damage: 0,
                            kills: 0,
                            name: countryPermalinkToName(citizen.country_permalink)
                        };
                    }

                    statsSide.stats.countries[citizen.country_permalink].damage += citizen.damage;
                    statsSide.stats.countries[citizen.country_permalink].kills += citizen.kills;

                    if (citizen.mu) {
                        if (!statsSide.stats.military_units[citizen.mu.id]) {
                            statsSide.stats.military_units[citizen.mu.id] = {
                                damage: 0,
                                kills: 0
                            };
                        }

                        statsSide.stats.military_units[citizen.mu.id].damage += citizen.damage;
                        statsSide.stats.military_units[citizen.mu.id].kills += citizen.kills;

                        if (!statsSide.stats.divisions[div].military_units[citizen.mu.id]) {
                            statsSide.stats.divisions[div].military_units[citizen.mu.id] = {
                                damage: 0,
                                kills: 0
                            };
                        }

                        statsSide.stats.divisions[div].military_units[citizen.mu.id].damage += citizen.damage;
                        statsSide.stats.divisions[div].military_units[citizen.mu.id].kills += citizen.kills;
                    }

                    statsSide.stats.divisions[div].damage += citizen.damage;
                    statsSide.stats.divisions[div].kills += citizen.kills;

                    if (!statsSide.stats.divisions[div].countries[citizen.country_permalink]) {
                        statsSide.stats.divisions[div].countries[citizen.country_permalink] = {
                            damage: 0,
                            kills: 0,
                            name: countryPermalinkToName(citizen.country_permalink)
                        };
                    }

                    statsSide.stats.divisions[div].countries[citizen.country_permalink].damage += citizen.damage;
                    statsSide.stats.divisions[div].countries[citizen.country_permalink].kills += citizen.kills;
                }
            }
        });
    }

    async processStatsMultiple(items) {
        const citizensToLoad = [];
        const dataList = {};

        for (const i in items) {
            // eslint-disable-next-line
            const [stats, statsLeft, statsRight] = items[i];

            const [data, citizenIds] = this._pairCitizenData(stats);
            citizensToLoad.push(...citizenIds);
            dataList[i] = data;
        }

        const muData = [];
        const chunks = chunk(arrayUnique(citizensToLoad), 190);

        for (const citizenList of chunks) {
            try {
                const citizenData = await this.getCitizenUnits(citizenList);
                citizenData.forEach(d => muData.push(d));
            } catch (e) {
                console.error('Could not load units for:', citizenList.join(','));
            }
        }

        for (const i in items) {
            // eslint-disable-next-line
            const [stats, statsLeft, statsRight] = items[i];
            const data = dataList[i];

            for (const side in data) {
                for (const div in data[side]) {
                    for (const citizen of data[side][div]) {
                        const citizenMu = muData.find(mu => mu.citizen_id == citizen.citizenId);
                        citizen.mu = citizenMu ? citizenMu.mu : null;
                    }
                }
            }

            this._assignStats(data, statsLeft, statsRight);
        }
    }

    async processStats(stats, statsLeft, statsRight, loadMuData = true) {
        if (!stats) {
            belLog('undefined data - returning');
            return;
        }

        const [data, citizenIds] = this._pairCitizenData(stats);

        // Load MU data
        if (loadMuData) {
            const muData = [];
            const chunks = chunk(citizenIds, 20);

            for (const citizenList of chunks) {
                try {
                    const citizenData = await this.getCitizenUnits(citizenList);
                    citizenData.forEach(d => muData.push(d));
                } catch (e) {
                    console.error('Could not load units for:', citizenList.join(','));
                }
            }

            // Pair muData with citizen data
            for (const side in data) {
                for (const div in data[side]) {
                    for (const citizen of data[side][div]) {
                        const citizenMu = muData.find(mu => mu.citizen_id == citizen.citizenId);
                        citizen.mu = citizenMu ? citizenMu.mu : null;
                    }
                }
            }
        }

        this._assignStats(data, statsLeft, statsRight);
    }

    // Synces eRepublik's and BattleEye's domination percentages
    calibrateDominationPercentages(nbpstats, leftTeam, rightTeam, second) {
        if (!nbpstats) return;

        function round(num) {
            return Math.round(num * 100000) / 100000;
        }

        // Problem: percentages returned by NBP stats are up to 30 seconds old, so syncing
        // damange with old data can be very inaccurate in larger battles
        //
        // Solution: track BE percentages for the last 30 seconds and find one that's
        // closest to percentage returned by NBP stats (abs(BE - NBP)). Add damage to left side, so that
        // this difference between NBP and t-x percentages is 0
        function findSmallestDelta(left, right, targetPerc) {
            const history = [];
            left.forEach((item, i) => {
                history.push({
                    left: item,
                    right: right[i]
                });
            });

            let smallestPair;
            let smallest = 100;

            history.forEach(pair => {
                if (left.damage === 0 || right.damage === 0) return;
                const perc = round(pair.left.damage / (pair.right.damage + pair.left.damage));
                const delta = Math.abs(perc - targetPerc);
                if (delta < smallest) {
                    smallest = delta;
                    smallestPair = pair;
                }
            });

            return smallestPair;
        }

        function fix(targetPerc, left, right) {
            // L = left damage
            // R = right damage
            // Tp = target percentage

            //  L * Tp + R * Tp - L
            // --------------------- = Damage difference
            //       1 - Tp

            // L * Tp      L        R * Tp
            // ------  -  ----   +  ------
            // 1 - Tp     1 - Tp    1  - Tp

            const ltp = (left.damage / (1 - targetPerc)) * targetPerc;
            const rtp = (right.damage / (1 - targetPerc)) * targetPerc;
            const l = left.damage / (1 - targetPerc);

            const addToLeft = Math.round(ltp - l + rtp);

            if (addToLeft === 0) {
                return [0, 0];
            }

            return [
                round(targetPerc) - round(left.damage / (left.damage + right.damage)),
                addToLeft
            ];
        }

        const invaderDomination = nbpstats.division.domination;

        // Fix each division
        divisions.forEach(div => {
            const left = leftTeam.stats.divisions[div];
            const right = rightTeam.stats.divisions[div];

            // Get kill history from the last 20 seconds
            const leftHistory = left.damageHistory.filter(item => {
                return item.time >= second - 20;
            });
            const rightHistory = right.damageHistory.filter(item => {
                return item.time >= second - 20;
            });

            // Percentage returned by NBP stats
            const targetPerc = round(window.SERVER_DATA.mustInvert ? 100 - invaderDomination[div] : invaderDomination[div]) / 100;

            let closest = findSmallestDelta(leftHistory, rightHistory, targetPerc);

            if (!closest) {
                closest = {
                    left, right
                };
            }

            if (closest.left.damage === 0 || closest.right.damage === 0) {
                belLog('No damage. Skipping percentage sync');
                return;
            }

            const [diff, add] = fix(targetPerc, closest.left, closest.right);

            left.damage += add;
            leftTeam.damage += add;

            belLog('Adding to left', add, `${div} (${diff} diff @ T+${second})`);
        });
    }

    async getNbpStats(battleId = window.SERVER_DATA.battleId) {
        let data;

        try {
            data = await $.getJSON(`https://www.erepublik.com/${erepublik.settings.culture}/military/nbp-stats/${battleId}/${window.SERVER_DATA.division}`);
            belLog('Retrieved nbp stats');
        } catch (e) {
            console.error('Failed to retrieve nbp stats');
        }

        return data;
    }

    async getStats(division, round, pageLeft, pageRight, type = 'damage', battleId = window.SERVER_DATA.battleId) {
        let data;

        try {
            data = await $.post(`https://www.erepublik.com/${erepublik.settings.culture}/military/battle-console`, {
                _token: window.SERVER_DATA.csrfToken,
                action: 'battleStatistics',
                battleId: battleId,
                division: division,
                leftPage: pageLeft,
                rightPage: pageRight,
                round: round,
                type: type,
                zoneId: parseInt(round, 10)
            });
        } catch (e) {
            console.error(`Failed to retrieve stats for ${battleId} d${division} pl${pageLeft} pr${pageRight} r${round} t${type}`);
        }

        return data;
    }

    async getFirstKills(battleId, round) {
        try {
            const data = await $.getJSON(`https://battleeye.raideer.xyz/v2/firstHits/${window.btoa(`${battleId}:${round}:yu4oFSgaJvXk1PQVPiWH`)}`);
            return data;
        } catch (e) {
            console.error('Failed to fetch firstKills for this battle');
        }

        return null;
    }

    async getCitizenUnits(citizenList) {
        const data = [];

        for (const i in citizenList) {
            if (citizenUnits[citizenList[i]]) {
                data.push(citizenUnits[citizenList[i]]);
                citizenList.splice(i, 1);
            }
        }

        if (citizenList.length > 0) {
            try {
                const loadedData = await $.getJSON(`https://battleeye.raideer.xyz/v2/mulist/${citizenList.join(',')}`);
                loadedData.forEach(i => {
                    citizenUnits[i.citizen_id] = i;
                });
                data.push(...loadedData);
            } catch (e) {
                console.error('Failed to fetch citizenUnits for this battle');
            }
        }

        return data;
    }

    async getMuNames(muList) {
        try {
            const data = await $.getJSON(`https://battleeye.raideer.xyz/v2/munames/${muList.join(',')}`);
            return data;
        } catch (e) {
            console.error('Failed to fetch muNames for this battle');
        }

        return null;
    }

    async getCampaigns() {
        try {
            const data = await $.getJSON(`https://www.erepublik.com/${erepublik.settings.culture}/military/campaigns-new/`);
            return data;
        } catch (e) {
            console.error('Failed to fetch campaigns-new');
        }

        return null;
    }

    async downloadMuData() {
        try {
            const data = await $.getJSON('https://battleeye.raideer.xyz/v2/downloadMuList');
            return data;
        } catch (e) {
            console.error('Failed to fetch downloadMuList');
        }

        return null;
    }

    async getMuDataChecksum() {
        try {
            const data = await $.getJSON('https://battleeye.raideer.xyz/v2/mulistchecksum');
            return data.checksum;
        } catch (e) {
            console.error('Failed to fetch mulistchecksum');
        }

        return null;
    }

    async getHovercard(citizenId) {
        try {
            const data = await $.getJSON(`https://www.erepublik.com/en/main/citizen-hovercard/${citizenId}`);
            return data;
        } catch (e) {
            console.error(`Failed to fetch hovercard data for ${citizenId}`);
        }

        return null;
    }
}

export default new BattleStatsLoader();
