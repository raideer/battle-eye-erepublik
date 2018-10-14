import $ from 'jQuery';

export function uid() {
    return `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4);
}

export function prettifyCountryName(country) {
    var prettyName = country;
    if (prettyName === 'Republic-of-Macedonia-FYROM') {
        prettyName = 'Republic of Macedonia (FYROM)';
    }

    prettyName = prettyName.replace(/-/g, ' ');

    return prettyName;
}

export const divisions = window.SERVER_DATA.division == 11 ? [11] : [1, 2, 3, 4];
export const division = window.SERVER_DATA.division;
export const currentRound = window.SERVER_DATA.zoneId;
export const isAir = currentRound % 4 === 0;

export function divName(div) {
    if (div == 11) {
        return 'AIR';
    }

    return `DIV ${div}`;
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
    if (useBattleEye) {
        const aDamage = window.BattleEye.teamA.divisions.get(division).damage;
        const bDamage = window.BattleEye.teamB.divisions.get(division).damage;
        return round(aDamage * 100 / (aDamage + bDamage), 100);
    }

    let d = window.BattleEye.nbpStats.division.domination[division];
    if (SERVER_DATA.mustInvert) {
        d = 100 - d;
    }

    return d;
}

export function currentStats(side) {
    return window.BattleEye.nbpStats.stats.current[currentRound][division][side].top_damage;
}

export function currentBH(side) {
    const stats = currentStats(side);
    if (stats.length > 0) {
        return stats[0];
    }

    return null;
}
