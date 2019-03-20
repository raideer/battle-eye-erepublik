import { cloneObject } from './Utils';
import DeployEmulator from './DeployEmulator';
import $ from 'jQuery';
import DeployMobile from './DeployMobile';

export default class Deployer {
    constructor(battleEye) {
        this._ppBeforeStart = 0;
        this.battleEye = battleEye;
        this.deployActive = false;
        this.citizenData = null;

        this.emulator = new DeployEmulator;
        this.mobile = new DeployMobile;
    }

    reducer(oldState = {
        deployType: 'emulator',
        inventory: null,
        energyInfo: null,
        deployActive: false,
        energySlider: 0,
        foodSlider: 0,
        energybarSlider: 0,
        sliderMin: 40,
        sliderMax: 100,
        activeWeapon: parseInt($('#weapon_btn').data('quality')),
        energyUsage: [],
        stats: null,
        showStats: false,
        progress: 0
    }, action) {
        const state = cloneObject(oldState);
        switch (action.type) {
        case 'SET_DEPLOY_STATUS': {
            state.deployActive = !!action.value;
            window.BattleEye.deployer.deployActive = !!action.value;
            return state;
        }
        case 'SET_INVENTORY': {
            state.inventory = action.value;
            state.energyInfo = window.BattleEye.deployer.getEnergyInfo(action.value);
            state.sliderMax = state.energyInfo.maxUsableEnergy;
            return state;
        }
        case 'SET_WEAPON_AMOUNT': {
            const inventory = cloneObject(state.inventory);
            for (const i in inventory.ammo) {
                if (inventory.ammo[i].qualityId == action.qualityId) {
                    inventory.ammo[i].amount = action.amount;
                }
            }

            state.inventory = inventory;
            return state;
        }
        case 'SET_ACTIVE_WEAPON': {
            state.activeWeapon = parseInt(action.value);
            return state;
        }
        case 'SET_SHOW_STATS': {
            state.showStats = !!action.value;
            return state;
        }
        case 'SET_DEPLOY_STATS': {
            state.stats = action.value;
            return state;
        }
        case 'RESET_STATS': {
            state.stats = null;
            return state;
        }
        case 'SET_DEPLOY_PROGRESS': {
            state.progress = parseInt(action.value);
            return state;
        }
        case 'UPDATE_ENERGY_USAGE': {
            const usage = window.BattleEye.deployer.getEnergyUsage(action.value, state.energyInfo);
            state.energyUsage = usage.energy;
            return state;
        }
        default:
            return oldState;
        }
    }

    cancelDeploy() {
        const { deployer } = this.battleEye.store.getState();

        if (deployer.deployType == 'emulator') {
            this.emulator.stop();
        } else {
            this.mobile.stop();
        }

        this.battleEye.store.dispatch({
            type: 'SET_DEPLOY_STATUS',
            value: false
        });
    }

    async loadBattleInventory() {
        const inventory = await $.getJSON(`https://www.erepublik.com/${erepublik.settings.culture}/main/mobile-battlefield-inventory`);
        window.BattleEye.store.dispatch({
            type: 'SET_INVENTORY',
            value: inventory
        });
    }

    getEnergyInfo(inventory) {
        let pool = 0;
        let maxUsableEnergy = 0;
        let maxEbEnergy = 0;
        let recoverableFoodSources = [];
        let specialFoodSources = [];
        const recoverable = inventory.recoverable_energy || 0;
        maxUsableEnergy += recoverable;

        inventory.energy_sources.forEach(source => {
            if (source.type == 'pool') {
                maxUsableEnergy += source.energy;
                pool = source.energy;
                return;
            }

            if (source.tier >= 10) {
                maxUsableEnergy += source.energy;
                maxEbEnergy += source.energy;
                specialFoodSources.push(source);
            } else {
                recoverableFoodSources.push(source);
            }
        });

        recoverableFoodSources = recoverableFoodSources.sort((a, b) => {
            return b.tier - a.tier;
        });

        specialFoodSources = specialFoodSources.sort((a, b) => {
            return b.tier - a.tier;
        });

        return {
            pool,
            maxUsableEnergy,
            maxEbEnergy,
            recoverableFoodSources,
            specialFoodSources,
            recoverable
        };
    }

    getEnergyUsage(selectedEnergy, energyInfo) {
        const energy = [];

        if (energyInfo.pool - selectedEnergy < 0) {
            // Pool smaller then selected. Need to eat

            const toRecover = Math.abs(energyInfo.pool - selectedEnergy);

            if (energyInfo.recoverable - toRecover >= 0) {
                // Can satisfy selection by eating food
                energy.push({
                    amount: Math.ceil(toRecover / 2)
                });
            } else {
                if (energyInfo.recoverable != 0) {
                    energy.push({
                        amount: Math.ceil(energyInfo.recoverable / 2)
                    });
                }

                let toRecoverWithSpecialFood = Math.abs(energyInfo.recoverable - toRecover);
                const sources = energyInfo.specialFoodSources.slice(0);
                while (toRecoverWithSpecialFood > 0 && sources.length > 0) {
                    const source = sources.pop();

                    if (source.energy - toRecoverWithSpecialFood >= 0) {
                        const recoversPerUse = Math.round(source.energy / source.amount);

                        energy.push({
                            tier: source.tier,
                            amount: Math.ceil(toRecoverWithSpecialFood / recoversPerUse)
                        });

                        toRecoverWithSpecialFood = 0;
                    } else {
                        toRecoverWithSpecialFood -= source.energy;

                        energy.push({
                            tier: source.tier,
                            amount: source.amount
                        });
                    }
                }
            }
        }

        return {
            selectedEnergy,
            energy
        };
    }

    deployCompleted() {
        this.battleEye.store.dispatch({
            type: 'SET_DEPLOY_STATUS',
            value: false
        });
        this.battleEye.store.dispatch({
            type: 'SET_SHOW_STATS',
            value: true
        });

        this.loadBattleInventory();
    }

    deploy(selectedEnergy) {
        const { deployer } = this.battleEye.store.getState();

        this.emulator.start(selectedEnergy, deployer.energyUsage, progress => {
            this.battleEye.store.dispatch({
                type: 'SET_DEPLOY_PROGRESS',
                value: progress
            });
        }, stats => {
            this.battleEye.store.dispatch({
                type: 'SET_DEPLOY_STATS',
                value: stats
            });
            this.deployCompleted();
        });

        this.battleEye.store.dispatch({
            type: 'RESET_STATS'
        });

        this.battleEye.store.dispatch({
            type: 'SET_DEPLOY_STATUS',
            value: true
        });
    }
}
