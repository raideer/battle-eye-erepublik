class Utils {
    uid() {
        return `0000${(Math.random() * Math.pow(36, 4) << 0).toString(36)}`.slice(-4);
    }

    prettifyCountryName(country) {
        var prettyName = country;
        if (prettyName === 'Republic-of-Macedonia-FYROM') {
            prettyName = 'Republic-of-Macedonia';
        }

        prettyName = prettyName.replace(/-/g, ' ');

        return prettyName;
    }

    sortByValue(obj) {
        const sorted = {};
        const sortedKeys = Object.keys(obj).sort((a, b) => { return obj[a] - obj[b]; }).reverse();

        for (var i in sortedKeys) {
            sorted[sortedKeys[i]] = obj[sortedKeys[i]];
        }

        return sorted;
    }

    lastDigit(number) {
        return number.toString().split('').pop();
    }
}

export default new Utils();
