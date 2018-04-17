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

export const divisions = SERVER_DATA.division == 11 ? [11] : [1, 2, 3, 4];
export const division = SERVER_DATA.division;
export const currentRound = SERVER_DATA.zoneId;

export function divName(div) {
    if (div == 11) {
        return 'AIR';
    }

    return `DIV ${div}`;
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
