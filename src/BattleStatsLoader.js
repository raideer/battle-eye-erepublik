class BattleStatsLoader {
    async loadStats(round = SERVER_DATA.zoneId, divs = null) {
        const leftData = new Map();
        const rightData = new Map();
        const leftId = SERVER_DATA.leftBattleId;
        const rightId = SERVER_DATA.rightBattleId;

        if (!divs) {
            divs = SERVER_DATA.division === 11 ? [11] : [1, 2, 3, 4];
        }

        const collectStats = async (div, type) => {
            let page = 1;
            let maxPage = 1;
            do {
                const stats = await this.getStats(div, round, page, page, type);

                for (const i in stats[leftId].fighterData) {
                    const data = leftData.get(div);
                    data[type].push(stats[leftId].fighterData[i]);
                    leftData.set(div, data);
                }

                for (const i in stats[rightId].fighterData) {
                    const data = rightData.get(div);
                    data[type].push(stats[rightId].fighterData[i]);
                    rightData.set(div, data);
                }

                maxPage = Math.max(stats[leftId].pages, stats[rightId].pages);

                belLog(`Processed ${type} for division ${div} round ${round} | ${page}/${maxPage}`);
                page++;
            } while (page <= maxPage);
        };

        for (const division of divs) {
            leftData.set(division, { kills: [], damage: [] });
            rightData.set(division, { kills: [], damage: [] });
            await collectStats(division, 'damage');
            await collectStats(division, 'kills');
        }

        return {
            left: leftData,
            right: rightData
        };
    }

    processStats(stats, teamA, teamB) {
        const divs = [1, 2, 3, 4, 11];

        if (!stats) {
            belLog('undefined data - returning');
            return;
        }

        divs.forEach(div => {
            let leftDmg = 0;
            let rightDmg = 0;
            let leftKl = 0;
            let rightKl = 0;

            ['left', 'right'].forEach(side => {
                const sideStats = stats[side];

                const division = sideStats.get(div);
                if (!division) return;

                division.damage.forEach(player => {
                    const dmg = Number(String(player.value).replace(/[^0-9]/g, ''));
                    const bareData = {
                        damage: dmg,
                        permalink: player.country_permalink
                    };

                    if (side == 'left') {
                        leftDmg += dmg;
                        teamA.countries.handleBare(bareData);
                        teamA.divisions.get(div).countries.handleBare(bareData);
                    } else {
                        rightDmg += dmg;
                        teamB.countries.handleBare(bareData);
                        teamB.divisions.get(div).countries.handleBare(bareData);
                    }
                });

                division.kills.forEach(player => {
                    const kills = Number(String(player.value).replace(/[^0-9]/g, ''));

                    if (side == 'left') {
                        leftKl += kills;
                        teamA.countries.handleKills(player.country_permalink, kills);
                        teamA.divisions.get(div).countries.handleKills(player.country_permalink, kills);
                    } else {
                        rightKl += kills;
                        teamB.countries.handleKills(player.country_permalink, kills);
                        teamB.divisions.get(div).countries.handleKills(player.country_permalink, kills);
                    }
                });
            });

            teamA.divisions.get(div).damage += leftDmg;
            teamB.divisions.get(div).damage += rightDmg;
            teamA.damage += leftDmg;
            teamB.damage += rightDmg;
            teamA.divisions.get(div).hits += leftKl;
            teamB.divisions.get(div).hits += rightKl;
            teamA.hits += leftKl;
            teamB.hits += rightKl;
        });
    }

    fixDamageDifference(nbpstats, leftTeam, rightTeam, second) {
        if (!nbpstats) return;

        function round(num) {
            return Math.round(num * 100000) / 100000;
        }

        function findClosestDelta(left, right, targetPerc) {
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
            //  L * Tp + R * Tp - L
            // ---------------------
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

        const divs = SERVER_DATA.division === 11 ? [11] : [1, 2, 3, 4];

        divs.forEach(div => {
            const left = leftTeam.divisions.get(div);
            const right = rightTeam.divisions.get(div);

            const leftHistory = left.damageHistory.filter(item => {
                return item.time >= second - 20;
            });

            const rightHistory = right.damageHistory.filter(item => {
                return item.time >= second - 20;
            });

            const targetPerc = round(SERVER_DATA.mustInvert ? 100 - invaderDomination[div] : invaderDomination[div]) / 100;

            let closest = findClosestDelta(leftHistory, rightHistory, targetPerc);

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

    async getNbpStats(battleId) {
        const data = await $j.getJSON(`https://www.erepublik.com/${erepublik.settings.culture}/military/nbp-stats/${battleId}/${SERVER_DATA.division}`);
        belLog('Retrieved nbp stats');
        return data;
    }

    async getStats(division, round, pageLeft, pageRight, type = 'damage', battleId = SERVER_DATA.battleId) {
        const data = await $j.post('https://www.erepublik.com/en/military/battle-console', {
            _token: SERVER_DATA.csrfToken,
            action: 'battleStatistics',
            battleId: battleId,
            division: division,
            leftPage: pageLeft,
            rightPage: pageRight,
            round: round,
            type: type,
            zoneId: parseInt(round, 10)
        });

        return data;
    }
}

export default new BattleStatsLoader();
