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

    number(number, toLocaleString = false) {
        const n = parseFloat(number);
        if (!isNaN(n) && n !== Infinity) {
            return toLocaleString ? n.toLocaleString() : n;
        }

        return toLocaleString ? '0' : 0;
    }

    formatDate(date) {
        var d = new Date(date),
            month = `${(d.getMonth() + 1)}`,
            day = `${d.getDate()}`,
            year = d.getFullYear();
    
        if (month.length < 2) month = `0${month}`;
        if (day.length < 2) day = `0${day}`;
    
        return [year, month, day].join('-');
    }
}

export default new Utils();
