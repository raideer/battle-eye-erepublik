import $ from 'jQuery';

import { currentDomination, currentBH, isAir, takeRight } from './Utils';

export default class AutoAttacker {
    constructor() {
        this.enabled = false; // Is auto attacker enabled
        this.interval = null; // Holds the timer
        this.state = {};

        this.killsLeft = 0;
        this.damageLeft = 0;

        this.attackMode = 'kills';
        this.attackDelay = 950;

        this.paddingDiff = 0;
        this._minValueMultiplier = isAir ? 1000 : 1000000;
    }

    runAttack(t = this.attackDelay) {
        if (!this.enabled) return;
        clearInterval(this.interval);
        this.interval = setTimeout(this.attack.bind(this), t);
    }

    setEnabled(value) {
        this.enabled = value;
        this.state.enabled = value;
    }

    stop() {
        this.setEnabled(false);
        clearInterval(this.interval);
        this.updateProgress();
    }

    start(state) {
        this.setEnabled(true);
        clearInterval(this.interval);

        if (state.damage) {
            this.attackMode = 'damage';
            this.damageLeft = (state.damage * this._minValueMultiplier) - window.BattleEye.personalDamage;
            if (this.damageLeft <= 0) {
                this.state.feed.push('<i class="fas fa-hand-paper"></i> Invalid target damage');
                this.stop();
                return;
            }
        } else if (state.allIn) {
            this.attackMode = 'allin';
        } else if (state.damagePadding > 0) {
            this.attackMode = 'padding';
            this.paddingDiff = parseInt(currentBH(SERVER_DATA.leftBattleId).damage) + (this.state.damagePadding * this._minValueMultiplier) - window.BattleEye.personalDamage;
        } else {
            this.attackMode = 'kills';
            this.killsLeft = state.kills;
        }

        this.runAttack(this.attackDelay);
    }

    updateProgress() {
        window.BattleEye.events.emit('autoattacker.progress', {
            enabled: this.enabled,
            killsLeft: this.killsLeft,
            damageLeft: this.damageLeft,
            attackMode: this.attackMode,
            paddingDiff: this.paddingDiff
        });
    }

    _checkRules(data) {
        let stop = false;

        if (this.attackMode == 'kills' && this.killsLeft <= 0) {
            stop = true;
            this.state.feed.push('<i class="fas fa-thumbs-up has-text-success"></i> Finished kills task');
        } else if (this.attackMode == 'damage' && this.damageLeft <= 0) {
            stop = true;
            this.state.feed.push('<i class="fas fa-thumbs-up has-text-success"></i> Finished damage task');
        } else if (!this.state.eatEB && !window.food_remaining && window.globalNS.userInfo.wellness < this.state.minHp) {
            stop = true;
            this.state.feed.push('<i class="fas fa-exclamation has-text-danger"></i> No food remaining');
        } else if (this.state.stopCO && (!data.reward || !data.reward.reward)) {
            stop = true;
            this.state.feed.push('<i class="fas fa-exclamation has-text-danger"></i> CO not active');
        } else if (this.state.stopEPIC && !data.user.epicBattle) {
            stop = true;
            this.state.feed.push('<i class="fas fa-exclamation has-text-danger"></i> EPIC not active');
        } else if (this.state.stopWeapons && data.user.weaponQuantity <= 0) {
            stop = true;
            this.state.feed.push('<i class="fas fa-exclamation has-text-danger"></i> Out of weapons');
        } else if (this.attackMode != 'padding' && this.state.maxDomination > 0 && this.state.maxDomination < currentDomination(this.state.beDomination)) {
            stop = true;
            this.state.feed.push('<i class="fas fa-thumbs-up has-text-success"></i> Reached max domination');
        } else if (this.attackMode == 'padding' && window.BattleEye.personalDamage > parseInt(currentBH(SERVER_DATA.leftBattleId).damage) + (this.state.damagePadding * this._minValueMultiplier)) {
            this.state.feed.push(`<i class="fas fa-thumbs-up has-text-success"></i> Padding larger than ${this.state.damagePadding}m. Waiting`);
        }

        if (stop) {
            this.stop();
        }
    }

    attack() {
        if (!this.enabled) return;
        if (window.globalNS.userInfo.wellness < this.state.minHp) {
            if (Math.min(
                window.reset_health_to_recover - window.globalNS.userInfo.wellness,
                window.food_remaining)
                >= window.smallestFood.use
                || this.state.eatEB) {
                this.eat().then(data => {
                    const consumedUnits = [];
                    for (const q in data.units_consumed) {
                        if (data.units_consumed[q] > 0) {
                            const type = q == 10 ? 'EB' : `Q${q}`;
                            consumedUnits.push(`${type} x ${data.units_consumed[q]}`);
                        }
                    }

                    this.state.feed.push(`Health low. Eating ${consumedUnits.join(', ')}`);
                    this.runAttack(900);
                });
            } else {
                this.state.feed.push('<i class="fas fa-exclamation has-text-danger"></i> Out of food');
                this.stop();
            }

            if (this.state.feed.length > 100) {
                this.state.feed = takeRight(this.state.feed, 100);
            }

            return;
        }

        this.shoot().then(data => {
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
                this.state.feed.push('<i class="fas fa-exclamation has-text-warning"></i> Zone inactive');
                break;
            case 'SHOOT_LOCKOUT':
                this.attackDelay += 50;
                this.runAttack(600);
                console.log('aa delay', this.attackDelay);
                // this.state.feed.push('<i class="fas fa-exclamation has-text-warning"></i> Shoot lockout. Retrying');
                break;
            case 'ENEMY_KILLED': {
                if (this.state.showKills) {
                    this.state.feed.push(`Shot ${data.hits} hits at <b>${data.enemy.name}</b> for  <b>${data.user.givenDamage.toLocaleString()}</b>`);
                }

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

                if (this.attackMode == 'kills') {
                    this.killsLeft--;
                } else if (this.attackMode == 'damage') {
                    this.damageLeft -= data.user.givenDamage;
                    if (this.damageLeft < 0) {
                        this.damageLeft = 0;
                    }
                } else if (this.attackMode == 'padding') {
                    this.paddingDiff -= data.user.givenDamage;
                }

                this.updateProgress();

                if (this.state.allIn || this.killsLeft > 0 || this.damageLeft > 0 || (this.attackMode == 'padding' && this.paddingDiff > 0)) {
                    this.runAttack();
                }

                this._checkRules(data);
                break;
            }
            default:
                this.state.feed.push(`<i class="fas fa-exclamation has-text-danger"></i> Received unknown response: ${data.message}`);
                this.stop();
                break;
            }
        });
    }

    async eat() {
        const data = await $.getJSON(`/${window.erepublik.settings.culture}/main/eat?format=json&_token=${window.SERVER_DATA.csrfToken}&buttonColor=${this.state.eatEB ? 'orange' : 'blue'}`);
        window.energy.processResponse(data);
        return data;
    }

    async shoot() {
        const data = await $.post(`/${window.erepublik.settings.culture}/military/fight-shoo${window.SERVER_DATA.onAirforceBattlefield ? 'oo' : 'o'}t/${SERVER_DATA.battleId}`, {
            sideId: window.SERVER_DATA.countryId,
            battleId: window.SERVER_DATA.battleId,
            _token: window.SERVER_DATA.csrfToken
        });

        return data;
    }

    toggleEnabled(state) {
        this.setEnabled(!this.enabled);
        this.state = state;

        if (this.interval) {
            clearInterval(this.interval);
        }

        if (this.enabled) {
            this.start(state);
        } else {
            this.stop();
        }

        return this.enabled;
    }
}
