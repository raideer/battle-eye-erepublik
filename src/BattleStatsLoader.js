import Collection from './Collection';

class BattleStatsLoader {
    async loadStats(round = SERVER_DATA.zoneId, divs = null) {
        const leftData = new Collection();
        const rightData = new Collection();
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

    processStats(stats, teams) {
        const divs = [1, 2, 3, 4, 11];

        console.log(stats);
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
