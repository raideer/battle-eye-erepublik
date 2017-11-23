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

                console.log(`Processed ${type} for division ${div} round ${round} | ${page}/${maxPage}`);
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
                        teamA.divisions.get(`div${div}`);
                    } else {
                        rightDmg += dmg;
                        teamB.countries.handleBare(bareData);
                        teamB.divisions.get(`div${div}`);
                    }
                });

                division.kills.forEach(player => {
                    const kills = Number(String(player.value).replace(/[^0-9]/g, ''));

                    if (side == 'left') {
                        leftKl += kills;
                        teamA.countries.handleKills(player.country_permalink, kills);
                        teamA.divisions.get(`div${div}`).countries.handleKills(player.country_permalink, kills);
                    } else {
                        rightKl += kills;
                        teamB.countries.handleKills(player.country_permalink, kills);
                        teamB.divisions.get(`div${div}`).countries.handleKills(player.country_permalink, kills);
                    }
                });
            });

            teamA.divisions.get(`div${div}`).damage += leftDmg;
            teamB.divisions.get(`div${div}`).damage += rightDmg;
            teamA.damage += leftDmg;
            teamB.damage += rightDmg;
            teamA.divisions.get(`div${div}`).hits += leftKl;
            teamB.divisions.get(`div${div}`).hits += rightKl;
            teamA.hits += leftKl;
            teamB.hits += rightKl;
        });
    }

    fixDamageDifference(nbpstats, leftTeam, rightTeam) {
        function dif(target, a, b) {
            return Math.round(Math.abs(target - (a * 100 / (a + b))) * 100000) / 100000;
        }

        function calculateFix(targetPerc, leftDamage, rightDamage) {
            if (SERVER_DATA.mustInvert) {
                targetPerc = 100 - targetPerc;
            }

            var simulatedLeftDmg = leftDamage;
            var totalFix = 0;
            var loops = 0;

            while (dif(targetPerc, simulatedLeftDmg, rightDamage) > 0.05) {
                var leftPerc = simulatedLeftDmg * 100 / (simulatedLeftDmg + rightDamage);
                var fix = Math.round((simulatedLeftDmg * targetPerc / leftPerc) - simulatedLeftDmg);
                simulatedLeftDmg += fix;
                totalFix += fix;
                loops++;
            }

            var originalDif = dif(targetPerc, leftDamage, rightDamage);
            var currentDif = dif(targetPerc, simulatedLeftDmg, rightDamage);

            belLog('Improved from', originalDif, 'to', currentDif, 'Loops:', loops);

            return Math.round(totalFix);
        }
        const invaderDomination = nbpstats.division.domination;
        const divs = SERVER_DATA.division === 11 ? [11] : [1, 2, 3, 4];

        divs.forEach(div => {
            const left = leftTeam.divisions.get(`div${div}`);
            const right = rightTeam.divisions.get(`div${div}`);

            const targetPerc = Math.round((SERVER_DATA.mustInvert ? 100 - invaderDomination[div] : invaderDomination[div]) * 10000) / 10000;
            const currentPerc = Math.round(left.damage * 100 * 10000 / (left.damage + right.damage)) / 10000;

            if (targetPerc === currentPerc) {
                return;
            }

            console.log(targetPerc, currentPerc);

            const fix = calculateFix(invaderDomination[div], left.damage, right.damage);
            left.damage += fix;

            // const targetDamage = targetPerc * (left.damage + right.damage) / currentPerc;
            // left.damage -= (left.damage + right.damage) - targetDamage;
            //
            console.log(
                SERVER_DATA.mustInvert ? 100 - invaderDomination[div] : invaderDomination[div],
                left.damage * 100 / (left.damage + right.damage)
            );
        });
    }

    async getNbpStats(battleId) {
        const data = await $j.getJSON(`https://www.erepublik.com/${erepublik.settings.culture}/military/nbp-stats/${battleId}/${SERVER_DATA.division}`);
        console.log('Retrieved nbp stats');
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
