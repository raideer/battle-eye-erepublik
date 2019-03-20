import $ from 'jQuery';
import { cloneObject } from './Utils';

export default class DeployEmulator {
    constructor() {
        this.enabled = false;
        this.minHp = 40;
        this.it = null;

        this.timingDefault = 750;
        this.timingSlow = 2500;
        this.timingEat = 1000;
        this.timingLockout = 300;

        this.energyLeft = 0;
        this.selectedEnergy = 0;
        this.energyInfo = [];

        this.onProgressUpdate = null;
        this.onStopCallback = null;
        this.previousKill = null;

        this.stats = null;
    }

    shoot() {
        return $.post(`/${window.erepublik.settings.culture}/military/fight-shoo${window.SERVER_DATA.onAirforceBattlefield ? 'oo' : 'o'}t/${SERVER_DATA.battleId}`, {
            sideId: window.SERVER_DATA.countryId,
            battleId: window.SERVER_DATA.battleId,
            _token: window.SERVER_DATA.csrfToken
        });
    }

    shouldEatSpecial() {
        for (const i in this.energyInfo) {
            if (
                this.energyInfo[i].tier
                && this.energyInfo[i].tier >= 10
                && this.energyInfo[i].amount > 0
            ) {
                return true;
            }
        }

        return false;
    }

    async eat() {
        const data = await $.getJSON(`/${window.erepublik.settings.culture}/main/eat?format=json&_token=${window.SERVER_DATA.csrfToken}&buttonColor=${this.shouldEatSpecial() ? 'orange' : 'blue'}`);
        window.energy.processResponse(data);

        for (const q in data.units_consumed) {
            const consumed = data.units_consumed[q];
            if (consumed <= 0) continue;

            if (!this.stats.units_consumed[q]) {
                this.stats.units_consumed[q] = consumed;
            } else {
                this.stats.units_consumed[q] += consumed;
            }

            for (const i in this.energyInfo) {
                if (this.energyInfo[i].tier == q) {
                    this.energyInfo[i].amount -= consumed;

                    if (this.energyInfo[i].amount <= 0) {
                        delete this.energyInfo[i];
                    }
                    break;
                }
            }
        }

        return data;
    }

    runAttack(t = this.timingDefault) {
        if (!this.enabled) return;
        clearInterval(this.it);
        this.it = setTimeout(this.attack.bind(this), t);
    }

    start(selectedEnergy, energyInfo, onProgressUpdate, onStopCallback) {
        // Disable stuff++ autoeating
        $('#AutoBotSwitch').text('AUTOBOT ON');
        //
        this.selectedEnergy = selectedEnergy;
        this.energyLeft = selectedEnergy;
        this.energyInfo = cloneObject(energyInfo);
        this.onStopCallback = onStopCallback;
        this.onProgressUpdate = onProgressUpdate;
        this.enabled = true;
        this.stats = {
            xpGained: 0,
            kills: 0,
            hits: 0,
            damage: 0,
            rankPoints: 0,
            pp: 0,
            co: 0,
            units_consumed: {}
        };

        clearInterval(this.it);
        this.runAttack();
    }

    stop() {
        // console.log('Stopping');
        clearInterval(this.it);
        this.enabled = false;

        // Re-enabling stuff++ auto eating
        $('#AutoBotSwitch').text('AUTOBOT OFF');

        if (typeof this.onProgressUpdate == 'function') {
            this.onProgressUpdate(100);
        }

        if (typeof this.onStopCallback == 'function') {
            this.onStopCallback(this.stats);
        }
    }

    updateStats(data) {
        this.stats.kills++;
        this.stats.damage += data.user.givenDamage;
        this.stats.xpGained += data.user.earnedXp;
        this.stats.rankPoints += data.user.earnedRankPoints;
        this.stats.hits += data.hits;
        this.stats.pp += data.hits;

        if (this.previousKill) {
            this.stats.cc += (data.details.currency - this.previousKill.details.currency) || 0;
        }
    }

    handleShootData(data) {
        switch (data.message) {
        case 'UNKNOWN_SIDE':
        case 'WRONG_SIDE':
            window.location.href = data.url;
            break;
        case 'ENEMY_ATTACKED':
        case 'LOW_HEALTH':
            window.globalNS.userInfo.wellness = 0;
            this.runAttack(0);
            break;
        case 'ZONE_INACTIVE':
            this.stop();
            window.alert('Zone inactive');
            break;
        case 'SHOOT_LOCKOUT':
            this.timingDefault += 50;
            // console.log('lockout', this.timingDefault);
            this.runAttack(this.timingLockout);
            break;
        case 'ENEMY_KILLED': {
            this.updateStats(data);
            this.previousKill = data;

            if (!$('#eRS_settings').length) {
                // Do this only if stuff++ is not enabled to avoid conflicts
                $('#total_damage strong').html(erepublik.functions.formatNumber(data.user.givenDamage + window.BattleEye.personalDamage));
            }

            window.battleFX.updateRank(data.rank);
            window.totalPrestigePoints += data.hits;
            $('#prestige_value').text(parseInt(window.totalPrestigePoints));
            $('#side_bar_currency_account_value').text(parseInt(data.details.currency));
            $('.left_player .energy_progress').css({
                width: `${data.details.current_energy_ratio}%`
            })
            .removeClass(['high', 'medium', 'low'])
            .addClass(
                data.details.current_energy_ratio < 20
                    ? 'low' : data.details.current_energy_ratio > 60 ? 'high' : 'medium'
            );

            if (data.user.weaponQuantity >= 0) {
                $('.weapon_no').text(parseInt(data.user.weaponQuantity));
            }

            window.globalNS.updateSideBar(data.details);

            this.energyLeft -= data.hits * 10;

            if (typeof this.onProgressUpdate == 'function') {
                this.onProgressUpdate(100 - (this.energyLeft * 100 / this.selectedEnergy));
            }

            if (this.energyLeft >= this.minHp) {
                return this.runAttack();
            }

            this.stop();
            break;
        }
        default:
            this.stop();
            break;
        }
    }

    attack() {
        if (!this.enabled) return;
        if (window.globalNS.userInfo.wellness < this.minHp) {
            if (Math.min(
                window.reset_health_to_recover - window.globalNS.userInfo.wellness,
                window.food_remaining)
            < window.smallestFood.use) {
                // Will eat special food
                const amtLeft = this.energyInfo.reduce((acc, item) => {
                    if (!item.tier || item.tier < 10) return acc;
                    return acc + item.amount;
                }, 0);
                // Stop if no special food left
                if (amtLeft <= 0) {
                    return this.stop();
                }
            }

            // console.log('LOW HP', window.globalNS.userInfo.wellness, this.minHp);

            this.eat().then(() => {
                this.runAttack(this.timingEat);
            });
        } else {
            this.shoot().then(data => this.handleShootData(data));
        }
    }
}
