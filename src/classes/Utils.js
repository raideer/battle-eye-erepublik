import $ from 'jQuery';
import countries from '../countries.json';

export function uid() {
    return `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4);
}

export const leftSideName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
export const rightSideName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];
export const divisions = window.SERVER_DATA.division == 11 ? [11] : [1, 2, 3, 4];
export const division = window.SERVER_DATA.division;
export const currentRound = window.SERVER_DATA.zoneId;
export const isAir = currentRound % 4 === 0;
export const leftId = window.SERVER_DATA.leftBattleId;
export const rightId = window.SERVER_DATA.rightBattleId;

export function getNested(obj, path) {
    if (!obj) return;

    const keys = path.split('.');
    let currentObj;

    for (const key of keys) {
        if (!currentObj && obj.hasOwnProperty(key)) {
            currentObj = obj[key];
        } else if (currentObj && currentObj.hasOwnProperty(key)) {
            currentObj = currentObj[key];
        } else {
            return;
        }
    }

    return currentObj;
}

const imagesLoading = [];

export function loadImage(src) {
    if (imagesLoading.indexOf(src) >= 0) {
        return;
    }

    return new Promise(resolve => {
        imagesLoading.push(src);
        const img = new window.Image();
        img.addEventListener('load', () => {
            resolve(img);
        });
        img.src = src;
    });
}

export function textToColor(text, withHash = true) {
    const color = intToRGB(hashCode(text));

    if (withHash) {
        return `#${color}`;
    }

    return color;
}

export function cloneObject(obj) {
    return Object.assign({}, obj);
}

export function deepCloneObject(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) return obj; // primitives
    if (obj instanceof Set) return new Set(obj); // See note about this!
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    const result = obj instanceof Date ? new Date(obj)
        : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
            : obj.constructor ? new obj.constructor()
                : Object.create(null);
    hash.set(obj, result);
    if (obj instanceof Map) {
        Array.from(obj, ([key, val]) => result.set(key, deepCloneObject(val, hash)));
    }

    return Object.assign(result, ...Object.keys(obj).map(
        key => ({ [key]: deepCloneObject(obj[key], hash) })
    ));
}

export function chunk(arr, len) {
    const chunks = [];
    let i = 0;
    const n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}

export function foodIdToName(id) {
    switch (parseInt(id)) {
    case 10:
        return 'Energy Bar';
    case 11:
        return 'Energy Bar x2';
    case 12:
    case 13:
        return 'Carrot';
    case 14:
        return 'Ice Cream';
    case 15:
        return 'Pumpkin';
    case 16:
        return 'Winter Treat';
    case 17:
        return 'Energy Bar x3';
    }

    return `Q${id}`;
}

export function range(from, to) {
    const nums = [];

    for (let i = from; i < to; i++) {
        nums.push(i);
    }

    return nums;
}

export function getStatsName(type) {
    switch (type) {
    case 'countries':
        return 'Country';
    case 'military_units':
        return 'Military Unit';
    }

    return type;
}

export function getFirepower(q) {
    switch (parseInt(q)) {
    case 1:
        return 20;
    case 2:
        return 40;
    case 3:
        return 60;
    case 4:
        return 80;
    case 5:
        return 100;
    case 6:
        return 120;
    case 7:
        return 200;
    }

    return 0;
}

export function calculateInfluence(strength, rankValue, firePower) {
    return 10 * (1 + (strength / 400)) * (1 + (rankValue / 5)) * (1 + (firePower / 100));
}

export function getWeaponBoosterBonus() {
    const activeBoosters = window.angular.element('#boosters_timers').scope().activeBoosters;
    let bonus = 0;

    for (const booster of activeBoosters) {
        if (!booster.display) continue;
        for (const attribute in booster.attributes) {
            if (attribute == 'damageBoost') {
                bonus += parseInt(booster.attributes[attribute].value);
            }
        }
    }

    return bonus;
}

export function divName(div) {
    if (div == 11) {
        return 'AIR';
    }

    return `DIVISION ${div}`;
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }

    // eslint-disable-next-line
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function getClassName(ob) {
    const classes = [];

    for (const className in ob) {
        if (ob[className]) {
            classes.push(className);
        }
    }

    return classes.join(' ');
}

export function findCountry(field, value) {
    for (const country of countries) {
        if (country[field] == value) {
            return country;
        }
    }

    return null;
}

export function countryPermalinkToId(permalink) {
    const c = findCountry('permalink', permalink);
    if (c) {
        return c.id;
    }

    return null;
}

export function countryPermalinkToName(permalink) {
    const c = findCountry('permalink', permalink);
    if (c) {
        return c.name;
    }

    return null;
}

export function arrayUnique(arr) {
    return arr.filter((v, i, a) => a.indexOf(v) === i);
}

export function countryIdToName(id) {
    const c = findCountry('id', id);
    if (c) {
        return c.name;
    }

    return null;
}

export function countryIdToCode(id) {
    const c = findCountry('id', id);
    if (c) {
        return c.code;
    }

    return null;
}

export function countryCodeToId(code) {
    const c = findCountry('code', code);
    if (c) {
        return c.id;
    }

    return null;
}

export function takeRight(array, n = 1) {
    const length = array == null ? 0 : array.length;
    if (!length) {
        return [];
    }

    n = length - n;

    return array.slice(n < 0 ? 0 : n, length);
}

export function truncate(string, length) {
    const array = string.split('');
    if (array.length <= length) {
        return string;
    }

    return `${array.slice(0, length).join('')}...`;
}

export function getPerc(a, b, precision = 100) {
    let ap = 0;
    if (a + b !== 0) {
        ap = Math.round(a * 100 * precision / (a + b)) / precision;
    }

    return ap;
}

export function sortByValue(obj) {
    const sorted = {};
    const sortedKeys = Object.keys(obj).sort((a, b) => { return obj[a] - obj[b]; }).reverse();

    for (var i in sortedKeys) {
        sorted[sortedKeys[i]] = obj[sortedKeys[i]];
    }

    return sorted;
}

export function round(num, precision = 1) {
    return Math.round(num * precision) / precision;
}

export function lastDigit(n) {
    return n.toString().split('').pop();
}

export function number(n, toLocaleString = false) {
    n = parseFloat(n);
    if (!isNaN(n) && n !== Infinity) {
        return toLocaleString ? n.toLocaleString() : n;
    }

    return toLocaleString ? '0' : 0;
}

export function formatDate(date) {
    var d = new Date(date),
        month = `${(d.getMonth() + 1)}`,
        day = `${d.getDate()}`,
        year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
}

export function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export function intToRGB(i) {
    var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
}

export function arrayRemoveElement(array, element) {
    const copy = array.slice();
    const index = copy.indexOf(element);

    if (index > -1) {
        copy.splice(index, 1);
    }

    return copy;
}

export function arrayReverse(array) {
    const copy = array.slice();
    copy.reverse();
    return copy;
}

export function currentDamage() {
    return window.erepublik.functions.stripNumber($('#total_damage strong').html() || 0);
}

export function currentDomination(useBattleEye = false) {
    const { main } = window.BattleEye.store.getState();
    if (main.nbp.error) return 0;

    if (useBattleEye) {
        const aDamage = window.BattleEye.teamA.divisions.get(division).damage;
        const bDamage = window.BattleEye.teamB.divisions.get(division).damage;
        return round(aDamage * 100 / (aDamage + bDamage), 100);
    }

    let d = main.nbp.division.domination[division];
    if (SERVER_DATA.mustInvert) {
        d = 100 - d;
    }

    return d;
}

export function currentRankPoints() {
    return parseInt(String($('#rank_min').text()).replace(/\D/g, ''));
}

export function nextRankPoints() {
    return parseInt(String($('#rank_max').attr('original-title')).replace(/\D/g, ''));
}

export function currentStats(side) {
    const { main } = window.BattleEye.store.getState();
    if (main.nbp.error) {
        return [];
    }

    return main.nbp.stats.current[currentRound][division][side].top_damage;
}

export function currentBH(side) {
    const stats = currentStats(side);
    if (stats.length > 0) {
        return stats[0];
    }

    return null;
}

class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass || class {};
    }

    with(...mixins) {
        return mixins.reduce((mixedClass, mixin) => mixin(mixedClass), this.superclass);
    }
}

export const mix = superclass => new MixinBuilder(superclass);
