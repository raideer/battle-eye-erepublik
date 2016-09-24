// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Industrials
// @homepage    https://docs.google.com/spreadsheets/d/1Ebqp5Hb8KmGvX6X0FXmALO30Fv-IyfJHUGPkjKey8tg
// @description LIVE battlefield statistics
// @include     http*://www.erepublik.com/*/military/battlefield-new/*
// @version     1.4.2
// @require     https://fb.me/react-15.2.1.min.js
// @require     https://fb.me/react-dom-15.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/async/2.0.1/async.min.js
// @require     https://dl.dropboxusercontent.com/u/86379644/notify.js
// @run-at      document-idle
// @grant       none
// @noframes
// ==/UserScript==

class DpsHandler {
    constructor(rem) {
        this.rememberDpsFor = rem;
        this.hitHistory = new HitHistory(rem * 1000);
        this.hitStreakSeconds = 0;
        this.lastHit = 0;
        this.dps = 0;
    }

    addHit(damage) {
        this.lastHit = new Date().getTime();
        this.hitHistory.add(damage);
    }

    updateDps(timeData) {
        var recentDamage = this.hitHistory.getTotal();
        if (this.hitStreakSeconds < this.rememberDpsFor) {
            this.hitStreakSeconds++;
        }

        this.dps = Math.round(recentDamage / this.hitStreakSeconds);
        if (timeData.time - this.lastHit >= 10000) {
            this.hitHistory.clear();
            this.hitStreakSeconds = 0;
        }
    }
}

class CloseAlert extends React.Component {
    render() {
        return null;
        // return (
        //     <div id="belClosed" className="bel-closed">
        //         Connection to the server was closed. Refresh the page to reconnect
        //         <p>This has nothing to do with BattleEye. <i>Maybe You opened another battle in a new tab?</i></p>
        //     </div>
        // );
    }
}

class Feed extends React.Component {
    printDivisions() {
        if (!this.props.data) {
            return null;
        }

        var divs = [];
        var divInfo = [];

        if (SERVER_DATA.division == 11) {
            divInfo = [[11, 'Air Division']];
        } else {
            divInfo = [[1, 'Division 1'], [2, 'Division 2'], [3, 'Division 3'], [4, 'Division 4']];
        }

        for (var d in divInfo) {
            var info = divInfo[d];

            if (!this.props.settings.showOtherDivs.value) {
                if (info[0] != SERVER_DATA.division) {
                    continue;
                }
            }

            if (!this.props.settings.showDiv1.value && info[0] == 1) {
                continue;
            }

            if (!this.props.settings.showDiv2.value && info[0] == 2) {
                continue;
            }

            if (!this.props.settings.showDiv3.value && info[0] == 3) {
                continue;
            }

            if (!this.props.settings.showDiv4.value && info[0] == 4) {
                continue;
            }

            var divData = {};
            divData.left = this.props.data.left.divisions['div' + info[0]];
            divData.right = this.props.data.right.divisions['div' + info[0]];

            divs.push(React.createElement(FeedDivision, { data: divData, div: info, settings: this.props.settings }));
        }

        return divs;
    }

    printOverall() {
        var data = {};
        data.left = this.props.data.left;
        data.right = this.props.data.right;

        return React.createElement(FeedOverall, { data: data, settings: this.props.settings });
    }

    printCountries() {
        var data = {};
        data.left = this.props.data.left;
        data.right = this.props.data.right;

        return React.createElement(FeedCountries, { data: data, settings: this.props.settings });
    }

    printOther() {
        return React.createElement(FeedOther, null);
    }

    getContent() {
        if (this.props.tab == 'div') {
            return this.printDivisions();
        } else if (this.props.tab == 'overall') {
            return this.printOverall();
        } else if (this.props.tab == 'countries') {
            return this.printCountries();
        }
        // else if(this.props.tab == 'other'){
        //     return this.printOther();
        // }
    }

    render() {
        return React.createElement(
            'div',
            { className: 'bel-grid' },
            this.getContent()
        );
    }
}

class FeedCountries extends React.Component {
    constructor() {
        super();

        this.state = {
            tab: 'overall'
        };
    }
    getFlagStyle(c) {
        return {
            backgroundImage: `url('/images/flags_png/L/${ c }.png')`,
            backgroundPosition: "-4px -4px"
        };
    }

    getStats(side) {
        var content = [];
        var countries = [];

        if (this.state.tab == 'overall') {
            countries = this.props.data[side].countries;
        } else {
            countries = this.props.data[side].divisions[this.state.tab].countries;
        }

        for (var i in countries) {
            var c = countries[i];
            content.push(React.createElement(
                'div',
                null,
                React.createElement(
                    If,
                    { test: side == "right" },
                    React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                ),
                React.createElement(
                    'b',
                    null,
                    i
                ),
                ': ',
                c.damage.toLocaleString(),
                React.createElement(
                    If,
                    { test: side == "left" },
                    React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                ),
                React.createElement('hr', { className: 'bel' })
            ));
        }

        return content;
    }

    getTabButtons() {
        return [['overall', 'Total'], ['div1', 'DIV1'], ['div2', 'DIV2'], ['div3', 'DIV3'], ['div4', 'DIV4']];
    }

    changeTab(tab) {
        this.setState({
            'tab': tab
        });
    }

    render() {
        return React.createElement(
            'div',
            null,
            React.createElement(TabSelector, { changeTab: this.changeTab.bind(this), tab: this.state.tab, buttons: this.getTabButtons() }),
            React.createElement(
                'div',
                { id: 'bel-country-list' },
                React.createElement(
                    'div',
                    { className: 'bel-col-1-2 text-right' },
                    this.getStats('left')
                ),
                React.createElement(
                    'div',
                    { className: 'bel-col-1-2 text-left' },
                    this.getStats('right')
                )
            )
        );
    }
}

class FeedDivision extends React.Component {
    getPerc(a, b) {
        var ap = 0;
        if (a + b != 0) {
            ap = Math.round(a * 1000 / (a + b)) / 10;
        }

        return ap;
    }

    render() {
        var left = this.props.data.left;
        var right = this.props.data.right;
        var settings = this.props.settings;
        var highlightDivision = false;
        if (settings.highlightDivision.value && SERVER_DATA.division == this.props.div[0]) {
            highlightDivision = true;
        }

        var leftDomination = left.damage * battleEyeLive.leftDetBonus;
        var rightDomination = right.damage * battleEyeLive.rightDetBonus;

        var leftDmgPerPercent = Math.round(parseFloat(left.damage) / parseFloat(this.getPerc(leftDomination, rightDomination)));
        var rightDmgPerPercent = Math.round(parseFloat(right.damage) / parseFloat(this.getPerc(rightDomination, leftDomination)));
        if (battleEyeLive.leftDetBonus == battleEyeLive.rightDetBonus) {
            // rightDmgPerPercent = leftDmgPerPercent;
        }

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: "bel-col-1-1 text-center bel-title " + (highlightDivision ? "bel-highlight-title" : "") },
                this.props.div[1]
            ),
            React.createElement(
                'div',
                { className: 'belFeedValue' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-right' },
                        React.createElement(FeedTextValue, { a: "1% = " + leftDmgPerPercent.toLocaleString() + " dmg" }),
                        React.createElement(FeedValue, { green: true, a: this.getPerc(leftDomination, rightDomination), b: this.getPerc(rightDomination, leftDomination), highlight: settings.highlightValue.value, text: "%" })
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-center' },
                        'Domination'
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-left' },
                        React.createElement(FeedValue, { b: this.getPerc(leftDomination, rightDomination), a: this.getPerc(rightDomination, leftDomination), highlight: settings.highlightValue.value, text: "%" }),
                        React.createElement(FeedTextValue, { a: "1% = " + rightDmgPerPercent.toLocaleString() + " dmg" })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'belFeedValue' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-right' },
                        React.createElement(
                            If,
                            { test: settings.showKills.value },
                            React.createElement(FeedValue, { green: true, a: left.hits, b: right.hits, highlight: settings.highlightValue.value, text: "kills" })
                        ),
                        React.createElement(
                            If,
                            { test: settings.showDamagePerc.value },
                            React.createElement(FeedValue, { green: true, a: this.getPerc(left.damage, right.damage), b: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                        ),
                        React.createElement(FeedValue, { green: true, a: left.damage, b: right.damage, highlight: settings.highlightValue.value })
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-center' },
                        'Total Damage'
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-left' },
                        React.createElement(FeedValue, { a: right.damage, b: left.damage, highlight: settings.highlightValue.value }),
                        React.createElement(
                            If,
                            { test: settings.showDamagePerc.value },
                            React.createElement(FeedValue, { b: this.getPerc(left.damage, right.damage), a: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                        ),
                        React.createElement(
                            If,
                            { test: settings.showKills.value },
                            React.createElement(FeedValue, { a: right.hits, b: left.hits, text: "kills", highlight: settings.highlightValue.value })
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'belFeedValue' },
                React.createElement(
                    If,
                    { test: settings.showAverageDamage.value },
                    React.createElement(
                        'ul',
                        { className: 'list-unstyled' },
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-right' },
                            React.createElement(FeedValue, { green: true, a: left.avgHit, b: right.avgHit, highlight: settings.highlightValue.value })
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-center' },
                            'Average damage'
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-left' },
                            React.createElement(FeedValue, { a: right.avgHit, b: left.avgHit, highlight: settings.highlightValue.value })
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'belFeedValue' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-right' },
                        React.createElement(FeedValue, { green: true, a: left.dps, b: right.dps, highlight: settings.highlightValue.value })
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-center' },
                        'DPS'
                    ),
                    React.createElement(
                        'li',
                        { className: 'bel-col-1-3 text-left' },
                        React.createElement(FeedValue, { a: right.dps, b: left.dps, highlight: settings.highlightValue.value })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'bel-col-1-1' },
                React.createElement(
                    If,
                    { test: settings.showDominationBar.value },
                    React.createElement(
                        'div',
                        { className: 'text-left bel-text-tiny' },
                        'DOMINATION ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(',
                            React.createElement(
                                'strong',
                                null,
                                Math.abs(leftDomination - rightDomination).toLocaleString(),
                                ' '
                            ),
                            ' difference)'
                        )
                    ),
                    React.createElement(FeedProgressBar, { a: leftDomination, b: rightDomination })
                ),
                React.createElement(
                    If,
                    { test: settings.showDamageBar.value },
                    React.createElement(
                        'div',
                        { className: 'text-left bel-text-tiny' },
                        'DAMAGE ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(',
                            React.createElement(
                                'strong',
                                null,
                                Math.abs(left.damage - right.damage).toLocaleString(),
                                ' '
                            ),
                            ' difference)'
                        ),
                        ' ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(1% ~ ',
                            React.createElement('strong', null),
                            ')'
                        )
                    ),
                    React.createElement(FeedProgressBar, { a: left.damage, b: right.damage })
                ),
                React.createElement(
                    If,
                    { test: settings.showDpsBar.value },
                    React.createElement(
                        'div',
                        { className: 'text-left bel-text-tiny' },
                        'DPS ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(',
                            React.createElement(
                                'strong',
                                null,
                                Math.abs(left.dps - right.dps).toLocaleString()
                            ),
                            ' difference)'
                        )
                    ),
                    React.createElement(FeedProgressBar, { a: left.dps, b: right.dps })
                )
            )
        );
    }
}

class FeedOther extends React.Component {
    render() {
        if (battleEyeLive.nbpStats === null) {
            return React.createElement(
                'div',
                { className: 'bel-spinner' },
                React.createElement('div', { className: 'rect1' }),
                React.createElement('div', { className: 'rect2' }),
                React.createElement('div', { className: 'rect3' }),
                React.createElement('div', { className: 'rect4' }),
                React.createElement('div', { className: 'rect5' })
            );
        }

        return React.createElement(
            'div',
            { className: 'text-left' },
            React.createElement(
                'div',
                { className: 'bel-col-1-3' },
                React.createElement(
                    'b',
                    null,
                    'Highest hit:'
                ),
                ' ',
                parseInt(battleEyeLive.nbpStats.maxHit).toLocaleString()
            ),
            React.createElement('div', { className: 'bel-col-1-3' }),
            React.createElement('div', { className: 'bel-col-1-3' })
        );
    }
}

class FeedOverall extends React.Component {
    getPerc(a, b) {
        var ap = 0;
        if (a + b != 0) {
            ap = Math.round(a * 100 / (a + b));
        }

        return ap;
    }

    render() {
        var left = this.props.data.left;
        var right = this.props.data.right;
        var settings = this.props.settings;

        return React.createElement(
            'div',
            null,
            React.createElement(
                'div',
                { className: 'bel-col-1-1 text-center bel-title bel-highlight-title' },
                'Overall stats'
            ),
            React.createElement(
                'div',
                { className: 'bel-col-1-3 text-right' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            If,
                            { test: settings.showKills.value },
                            React.createElement(FeedValue, { green: true, a: left.hits, b: right.hits, highlight: settings.highlightValue.value, text: "kills" })
                        ),
                        React.createElement(
                            If,
                            { test: settings.showDamagePerc.value },
                            React.createElement(FeedValue, { green: true, a: this.getPerc(left.damage, right.damage), b: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                        ),
                        React.createElement(FeedValue, { green: true, a: left.damage, b: right.damage, highlight: settings.highlightValue.value })
                    ),
                    React.createElement(
                        If,
                        { test: settings.showAverageDamage.value },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(FeedValue, { green: true, a: left.avgHit, b: right.avgHit, highlight: settings.highlightValue.value })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(FeedValue, { green: true, a: left.dps, b: right.dps, highlight: settings.highlightValue.value })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'bel-col-1-3 text-center' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled bel-titles' },
                    React.createElement(
                        'li',
                        null,
                        'Total Damage'
                    ),
                    React.createElement(
                        If,
                        { test: settings.showAverageDamage.value },
                        React.createElement(
                            'li',
                            null,
                            'Average Damage'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        'DPS'
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'bel-col-1-3 text-left' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled' },
                    React.createElement(
                        'li',
                        null,
                        React.createElement(FeedValue, { a: right.damage, b: left.damage, highlight: settings.highlightValue.value }),
                        React.createElement(
                            If,
                            { test: settings.showDamagePerc.value },
                            React.createElement(FeedValue, { b: this.getPerc(left.damage, right.damage), a: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                        ),
                        React.createElement(
                            If,
                            { test: settings.showKills.value },
                            React.createElement(FeedValue, { a: right.hits, b: left.hits, text: "kills", highlight: settings.highlightValue.value })
                        )
                    ),
                    React.createElement(
                        If,
                        { test: settings.showAverageDamage.value },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(FeedValue, { a: right.avgHit, b: left.avgHit, highlight: settings.highlightValue.value })
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(FeedValue, { a: right.dps, b: left.dps, highlight: settings.highlightValue.value })
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'bel-col-1-1' },
                React.createElement(
                    If,
                    { test: settings.showDamageBar.value },
                    React.createElement(
                        'div',
                        { className: 'text-left bel-text-tiny' },
                        'DAMAGE ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(',
                            React.createElement(
                                'strong',
                                null,
                                Math.abs(left.damage - right.damage).toLocaleString(),
                                ' '
                            ),
                            ' difference)'
                        )
                    ),
                    React.createElement(FeedProgressBar, { a: left.damage, b: right.damage })
                ),
                React.createElement(
                    If,
                    { test: settings.showDpsBar.value },
                    React.createElement(FeedProgressBar, { a: left.dps, b: right.dps }),
                    React.createElement(
                        'div',
                        { className: 'text-left bel-text-tiny' },
                        'DPS ',
                        React.createElement(
                            'span',
                            { className: 'color-silver' },
                            '(',
                            React.createElement(
                                'strong',
                                null,
                                Math.abs(left.dps - right.dps).toLocaleString()
                            ),
                            ' difference)'
                        )
                    )
                )
            )
        );
    }

}

class FeedProgressBar extends React.Component {
    render() {
        var aPerc = 0,
            bPerc = 0;

        if (this.props.a + this.props.b !== 0) {
            aPerc = Math.round(this.props.a * 10000 / (this.props.a + this.props.b)) / 100;
            bPerc = Math.round(this.props.b * 10000 / (this.props.a + this.props.b)) / 100;
        }

        var teamA = {
            width: aPerc + "%"
        };

        var teamB = {
            width: bPerc + "%"
        };

        var progressStyle = {};
        if (settings.largerBars.value) {
            progressStyle.height = "8px";
        }

        return React.createElement(
            'div',
            { className: 'bel-progress', style: progressStyle },
            React.createElement('div', { className: 'bel-progress-center-marker' }),
            React.createElement('div', { className: 'bel-progress-bar bel-teama', style: teamA }),
            React.createElement('div', { className: 'bel-progress-bar bel-teamb', style: teamB })
        );
    }
}

class FeedTextValue extends React.Component {
    constructor() {
        super();
        this.props = {
            text: "",
            green: false
        };
    }

    render() {
        return React.createElement(
            'span',
            { className: 'bel-value' },
            this.props.a,
            ' ',
            this.props.text
        );
    }
}

class FeedValue extends React.Component {
    constructor() {
        super();
        this.props = {
            text: "",
            green: false
        };
    }

    render() {
        return React.createElement(
            'span',
            { className: "bel-value " + (this.props.a > this.props.b && this.props.highlight ? this.props.green == true ? "bel-value-hl-w" : "bel-value-hl-l" : "") },
            parseFloat(this.props.a).toLocaleString(),
            ' ',
            this.props.text
        );
    }
}

class Footer extends React.Component {
    render() {
        return null;
    }
}

class Header extends React.Component {
    getTeamElementStyle() {
        return {
            fontWeight: 700,
            fontSize: '1.3em'
        };
    }

    getHeaderListStyle() {
        return {
            paddingBottom: "6px",
            borderBottom: "1px solid #ecf0f1"
        };
    }

    getFlagStyle(c) {
        return {
            backgroundImage: `url('/images/flags_png/L/${ c }.png')`,
            backgroundPosition: "-4px -4px"
        };
    }

    render() {
        return React.createElement(
            'div',
            { id: 'battle_eye_header' },
            React.createElement(
                'ul',
                { className: 'list-unstyled list-inline text-left bel-header-menu', style: this.getHeaderListStyle() },
                React.createElement(
                    'li',
                    { id: 'bel-version' },
                    React.createElement(
                        'span',
                        { className: 'bel-version' },
                        this.props.data.version
                    ),
                    ' ',
                    React.createElement(
                        'a',
                        { href: 'http://bit.ly/BattleEye', target: '_blank' },
                        'BATTLE EYE'
                    )
                ),
                React.createElement(
                    'li',
                    { id: 'bel-loading' },
                    React.createElement(
                        'div',
                        { className: 'bel-spinner' },
                        React.createElement('div', { className: 'rect1' }),
                        React.createElement('div', { className: 'rect2' }),
                        React.createElement('div', { className: 'rect3' }),
                        React.createElement('div', { className: 'rect4' }),
                        React.createElement('div', { className: 'rect5' })
                    )
                ),
                React.createElement(
                    'li',
                    { className: 'pull-right' },
                    React.createElement(
                        'ul',
                        { className: 'list-unstyled list-inline' },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { className: 'bel-btn bel-btn-inverse', target: '_blank', href: 'http://bit.ly/BattleEye' },
                                'Homepage'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'a',
                                { className: 'bel-btn bel-btn-inverse', target: '_blank', href: 'http://www.erepublik.com/en/citizen/profile/8075739' },
                                'Contact/Donate'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'button',
                                { id: 'battle-eye-settings', onClick: this.props.openModal, className: 'bel-btn bel-btn-default' },
                                'Settings'
                            )
                        )
                    )
                )
            ),
            React.createElement(
                If,
                { test: SERVER_DATA.isCivilWar },
                React.createElement(
                    'div',
                    { className: 'bel-grid' },
                    React.createElement(
                        'div',
                        { className: 'bel-col-1-3 text-left bel-teama-color', style: this.getTeamElementStyle() },
                        React.createElement('div', { style: this.getFlagStyle(this.props.data.revolutionCountry), className: 'bel-country' }),
                        ' ',
                        this.props.data.teamAName
                    ),
                    React.createElement(
                        'div',
                        { className: 'bel-col-1-3 text-center', style: this.getTeamElementStyle() },
                        'CIVIL WAR'
                    ),
                    React.createElement(
                        'div',
                        { className: 'bel-col-1-3 text-right bel-teamb-color', style: this.getTeamElementStyle() },
                        React.createElement('div', { style: this.getFlagStyle(this.props.data.revolutionCountry), className: 'bel-country' }),
                        ' ',
                        this.props.data.teamBName
                    )
                )
            ),
            React.createElement(
                If,
                { test: !SERVER_DATA.isCivilWar },
                React.createElement(
                    'div',
                    { className: 'bel-grid' },
                    React.createElement(
                        'div',
                        { className: 'bel-col-1-2 text-left bel-teama-color', style: this.getTeamElementStyle() },
                        React.createElement('div', { style: this.getFlagStyle(this.props.data.teamAName), className: 'bel-country' }),
                        ' ',
                        this.props.data.teamAName
                    ),
                    React.createElement(
                        'div',
                        { className: 'bel-col-1-2 text-right bel-teamb-color', style: this.getTeamElementStyle() },
                        this.props.data.teamBName,
                        ' ',
                        React.createElement('div', { style: this.getFlagStyle(this.props.data.teamBName), className: 'bel-country' })
                    )
                )
            )
        );
    }
}

class If extends React.Component {
    render() {
        if (this.props.test) {
            return React.createElement(
                'span',
                null,
                this.props.children
            );
        }

        return null;
    }
}

class MiniMonitor extends React.Component {

    getPerc(a, b) {
        var ap = 0;
        if (a + b !== 0) {
            ap = Math.round(a * 1000 / (a + b)) / 10;
        }

        return ap;
    }

    printDivisions() {
        var data = [];
        var left = this.props.feedData.left;
        var right = this.props.feedData.right;

        var divs = [];

        if (SERVER_DATA.division == 11) {
            divs = [11];
        } else {
            divs = [1, 2, 3, 4];
        }

        for (var i in divs) {
            var div = divs[i];
            var leftDamage = left.divisions['div' + div].damage * battleEyeLive.leftDetBonus;
            var rightDamage = right.divisions['div' + div].damage * battleEyeLive.rightDetBonus;

            data.push(React.createElement(
                'div',
                null,
                React.createElement('div', { className: "bel-div bel-div" + div }),
                ' ',
                this.getPerc(leftDamage, rightDamage),
                '% - ',
                this.getPerc(rightDamage, leftDamage),
                '%'
            ));
        }

        return data;
    }

    render() {
        if (!settings.showMiniMonitor.value) {
            return null;
        }

        return React.createElement(
            'div',
            { className: 'bel-minimonitor' },
            this.printDivisions()
        );
    }
}

class SettingsField extends React.Component {
    getInput() {
        var setting = this.props.setting;
        // console.log(setting.value);
        if (typeof setting.value == "boolean") {
            return React.createElement(
                'div',
                null,
                React.createElement('input', { type: 'checkbox', defaultChecked: setting.value, className: 'bel-settings-field', id: setting.field.id, name: setting.field.id }),
                React.createElement(
                    'label',
                    { htmlFor: setting.field.id },
                    setting.field.name
                )
            );
        } else {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'label',
                    { htmlFor: setting.field.id },
                    setting.field.name
                ),
                React.createElement(
                    'div',
                    null,
                    React.createElement('input', { type: 'text', defaultValue: setting.value, className: 'bel-settings-field', id: setting.field.id, name: setting.field.id })
                )
            );
        }
    }

    render() {
        var setting = this.props.setting;
        return React.createElement(
            'div',
            { className: 'bel-checkbox' },
            this.getInput(),
            React.createElement(
                'div',
                { className: 'bel-field-description' },
                setting.field.desc
            )
        );
    }
}

class SettingsGroup extends React.Component {

    renderSettings() {
        var settings = this.props.settings;
        var components = [];

        for (var i in settings) {
            var setting = settings[i];
            components.push(React.createElement(SettingsField, { setting: setting }));
        }

        return components;
    }

    render() {
        return React.createElement(
            'div',
            { className: 'bel-col-1-2' },
            React.createElement(
                'h5',
                { className: 'bel-settings-group' },
                this.props.name
            ),
            React.createElement(
                'div',
                { className: 'bel-settings-container' },
                this.renderSettings()
            )
        );
    }
}

class SettingsModal extends React.Component {
    renderGroups() {
        var settings = this.props.settings;
        var components = [];
        var groups = {};

        for (var i in settings) {
            var setting = settings[i];

            if (groups[setting.field.group] == undefined) {
                groups[setting.field.group] = [];
            }

            groups[setting.field.group].push(setting);
        }

        for (var i in groups) {
            var group = groups[i];
            components.push(React.createElement(SettingsGroup, { name: i, settings: group }));
        }
        return components;
    }

    resetSettings() {
        battleEyeLive.resetSettings();
        $j('#bel-reset-settings').notify('Settings reset', 'info');
    }

    render() {
        return React.createElement(
            'div',
            { id: 'bel-settings-modal', className: "bel-settings " + (this.props.hidden ? "bel-hidden" : "") },
            React.createElement(
                'div',
                { className: 'clearfix' },
                React.createElement(
                    'ul',
                    { className: 'list-unstyled list-inline pull-right bel-header-menu' },
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { id: 'bel-reset-settings', onClick: this.resetSettings, href: 'javascript:void(0);', className: 'bel-btn bel-btn-inverse bel-btn-alert-success' },
                            'Reset to defaults'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'a',
                            { href: 'https://dl.dropboxusercontent.com/u/86379644/battle-eye-live.user.js', className: 'bel-btn bel-btn-inverse' },
                            'Update'
                        )
                    ),
                    React.createElement(
                        'li',
                        null,
                        React.createElement(
                            'button',
                            { id: 'bel-close-modal', onClick: this.props.closeModal, className: 'bel-btn bel-btn-danger' },
                            'Close'
                        )
                    )
                )
            ),
            React.createElement(
                'div',
                { className: 'bel-grid' },
                this.renderGroups()
            )
        );
    }
}

class TabSelector extends React.Component {
    getButtons() {
        var buttons = [];

        for (var i in this.props.buttons) {
            var a = this.props.buttons[i];
            buttons.push(React.createElement(
                'button',
                { 'data-tab': a[0], onClick: this.props.changeTab.bind(this, a[0]), className: this.getStyle(a[0]) },
                a[1]
            ));
        }

        return buttons;
    }

    getStyle(tab) {
        if (this.props.tab == tab) {
            return "bel-btn bel-btn-default";
        }

        return "bel-btn bel-btn-grey";
    }

    render() {
        return React.createElement(
            'div',
            { className: 'bel-tabs' },
            this.getButtons()
        );
    }
}

class Template extends React.Component {
    constructor() {
        super();
        this.state = {
            modalHidden: true,
            tab: 'div'
        };
    }

    openModal() {
        this.setState({
            'modalHidden': false
        });
    }

    closeModal() {
        this.setState({
            'modalHidden': true
        });
    }

    changeTab(tab) {
        this.setState({
            'tab': tab
        });
    }

    getTabButtons() {
        return [['div', 'Divisions'], ['overall', 'Total'], ['countries', 'Countries']
        // ,['other', 'Other']
        ];
    }

    render() {
        return React.createElement(
            'div',
            null,
            React.createElement(CloseAlert, null),
            React.createElement(SettingsModal, { closeModal: this.closeModal.bind(this), hidden: this.state.modalHidden, settings: this.props.settings }),
            React.createElement(Header, { openModal: this.openModal.bind(this), data: this.props.headerData }),
            React.createElement(TabSelector, { changeTab: this.changeTab.bind(this), tab: this.state.tab, buttons: this.getTabButtons() }),
            React.createElement(Feed, { data: this.props.feedData, settings: this.props.settings, tab: this.state.tab }),
            React.createElement(Footer, null)
        );
    }
}

class Module {
    constructor(name, description, autoload = true) {
        var self = this;
        self.name = name;
        self.desc = description;
        self.autoload = autoload;
    }

    defineSettings() {
        return [];
    }

    run(settings) {
        return null;
    }
}

class AutoShooter extends Module {
    constructor() {
        super('AutoShooter', 'Automatically shoots, when the FIGHT button is held');
    }

    /**
     * Defining settings for autoshooter
     */
    defineSettings() {
        return [['autoShooterEnabled', false, "Enable AutoShooter", "Automatically shoots, when the FIGHT button is held"], ['autoShooterStart', false, "Start AutoShooter immediately after the button is pressed.", "Otherwise, AutoShooter will start after the shot delay"], ['autoShooterEnter', true, "Shoot while holding ENTER"], ['autoShooterSpace', true, "Shoot while holding SPACE"], ['autoShooterDelay', 1500, "Delay between shots (in ms)"]];
    }

    run() {
        /**
         * Holds the timer interval data
         */
        var tid;

        var lastEvent;

        /**
         * eRepublik number format
         */
        function format(str) {
            return ("" + str).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        /**
         * Button click handler
         */
        document.getElementById("fight_btn").addEventListener("mousedown", function () {
            handle();
        });

        /**
         * Key press handler
         */
        document.onkeydown = function (e) {
            if (lastEvent && lastEvent.keyCode == e.keyCode) {
                return;
            }

            if ((settings.autoShooterEnter.value && e.keyCode == 13 || settings.autoShooterSpace.value && e.keyCode == 32) && settings.autoShooterEnabled.value) {
                lastEvent = e;
                handle();
                $j('#fight_btn').notify('AutoShooter started', { position: "top center", className: "info" });
            }
        };

        /**
         * Clears the delay, when the button is released
         */
        document.addEventListener("mouseup", function () {
            clearInterval(tid);
        });

        /**
         * Clears the delay, when the key is released
         */
        document.onkeyup = function (e) {
            if (settings.autoShooterEnter.value && e.keyCode == 13 || settings.autoShooterSpace.value && e.keyCode == 32) {
                lastEvent = null;
                clearInterval(tid);
            }
        };

        /**
         * AutoShooter handler
         */
        var handle = function () {
            //Checking if enabled
            if (!settings.autoShooterEnabled.value) {
                return;
            }

            //Posts fight request
            var action = function () {
                $j.post("/" + erepublik.settings.culture + "/military/fight-shoo" + (SERVER_DATA.onAirforceBattlefield ? "oo" : "o") + "t/" + SERVER_DATA.battleId, {
                    sideId: SERVER_DATA.countryId,
                    battleId: SERVER_DATA.battleId,
                    _token: SERVER_DATA.csrfToken
                }, function (data) {
                    if (settings.enableLogging.value) {
                        console.log("[BATTLEEYE] Request sent. Received: " + data.message);
                    }

                    if (data.message == "ENEMY_KILLED") {
                        window.totalPrestigePoints += data.hits;
                        globalNS.updateSideBar(data.details);
                        $j("#rank_min").text(format(data.rank.points) + " Rank Points");
                        $j("#rank_status_gained").css("width", data.rank.percentage + "%");

                        $j("#prestige_value").text(format(window.totalPrestigePoints));
                        $j("#side_bar_currency_account_value").text(format(data.details.currency));
                        $j(".left_player .energy_progress").css("width", data.details.current_energy_ratio + "%");
                        $j(".right_player .energy_progress").css("width", data.enemy.energyRatio + "%");
                        $j(".weapon_no").text(data.user.weaponQuantity);

                        if ($j('#eRS_options').length <= 0) {
                            var td = parseInt($j('#total_damage strong').text().replace(/,/g, ''));
                            $j('#total_damage strong').text(format(td + data.user.givenDamage));
                        }
                    } else if (data.message == "ENEMY_ATTACKED" || data.message == "LOW_HEALTH") {
                        $j('#fight_btn').notify('Low health. AutoShooter stopped', { position: "top center", className: "info" });
                        if (tid) clearInterval(tid);
                    } else if (data.message == "ZONE_INACTIVE") {
                        $j('#fight_btn').notify('Zone is inactive. AutoShooter stopped', { position: "top center", className: "info" });
                        if (tid) clearInterval(tid);
                    } else if (data.message == "SHOOT_LOCKOUT") {
                        $j('#fight_btn').notify('Shoot lockout (Shooting too fast?). AutoShooter stopped.', { position: "top center", className: "info" });
                        if (tid) clearInterval(tid);
                    } else {
                        $j('#fight_btn').notify('AutoShooter stopped. Received: "' + data.message + '"', { position: "top center", className: "warn" });
                        if (tid) clearInterval(tid);
                    }
                });
            };

            if (settings.autoShooterStart.value) {
                action();
            }
            tid = setInterval(action, Number(settings.autoShooterDelay.value));

            if (settings.enableLogging.value) {
                console.log("[BATTLEEYE] AutoShooter started");
            }
        };
    }
}

class BattleHistory extends Module {
    constructor() {
        super('Battle History', 'Displays recent battles where you have fought');
    }

    defineSettings() {
        return [['battleHistoryEnabled', true, 'Enable Battle History', 'Displays recent battles where you have fought']];
    }

    run() {
        if (!storage.has('battleHistoryData')) {
            storage.set('battleHistoryData', []);
        }

        $j('#pvp .battle_footer .footer_menu').append('<a id="bel-battle-history" original-title="Battle History" href="javascript: void(0);">Battle History</a>');
        $j('#bel-battle-history').tipsy({ gravity: 's' });
    }
}

class ModuleLoader {
    constructor(storage) {
        this.modules = {};
        this.storage = storage;
    }

    load(module) {
        if (module instanceof Module) {
            this.modules[module.name] = module;
            var settings = module.defineSettings();
            for (var i in settings) {
                var s = settings[i];
                this.storage.define(s[0], s[1], module.name, s[2], s[3]);
            }
        }
    }

    get(name) {
        return this.modules[name];
    }

    run() {
        for (var i in this.modules) {
            try {
                if (this.modules[i].autoload) {
                    this.modules[i].run();
                }
            } catch (e) {
                console.error(`Failed to run module ${ i }!: ${ e }`);
            }
        }
    }
}

class Other extends Module {
    constructor() {
        super('Other', 'Other miscellaneous enhancements');
    }

    defineSettings() {
        return [['otherFixCometchat', true, "Cometchat fix", "Removes the fading, clickblocking line from the bottom of the screen. (Requires a page refresh)"]];
    }

    run() {
        if (settings.otherFixCometchat.value) {
            //Removing that annoying cometchat background
            var waitForCometchat = setInterval(fixCometchat, 500);
            function fixCometchat() {
                var cometchat = document.getElementById('cometchat_base');
                if (cometchat !== null) {
                    var style = "width:auto;position:aboslute;right:0;background:none;";
                    cometchat.setAttribute('style', style);
                    clearInterval(waitForCometchat);
                }
            }
        }
    }
}

class PercentageFixer extends Module {
    constructor() {
        super('Percentage Fixer', '');
    }

    defineSettings() {
        return [['percFixEnabled', false, "Enable percentage fixer", "Temporary solution to eRepublik's battle stat inconsistencies"]];
    }

    run() {
        var self = this;
        battleEyeLive.events.on('battleConsoleLoaded', function () {
            //Getting domination info from erepublik's nbp stats page
            self.getNbpStats(function (data) {
                data = JSON.parse(data);

                //Domination values for the defending side
                var dom = data.division.domination;

                if (SERVER_DATA.division == 11) {
                    var divs = [11];
                } else {
                    var divs = [1, 2, 3, 4];
                }

                //Checking each division seperately
                for (var i in divs) {
                    var domination = dom[divs[i]];
                    if (domination == 50) {
                        continue;
                    }

                    //Total damage left
                    var aDamage = battleEyeLive.teamA.divisions.get('div' + divs[i]).damage;
                    //Total damage right
                    var bDamage = battleEyeLive.teamB.divisions.get('div' + divs[i]).damage;

                    var totalDamage = 0;
                    totalDamage += aDamage;
                    totalDamage += bDamage;

                    //Calculate BattleEye's damage percentage for the defending side
                    if (SERVER_DATA.leftBattleId == SERVER_DATA.defenderId) {
                        var perc = aDamage / totalDamage * 100;
                        var left = true;
                    } else {
                        var perc = bDamage / totalDamage * 100;
                        var left = false;
                    }

                    //If percentages are not the same
                    if (Math.round(perc) != Math.round(domination)) {
                        // log(perc, "be perc")
                        // log(domination, 'domination perc');
                        //
                        // log((perc/100)*totalDamage, 'be division damage');
                        // log((domination/100)*totalDamage, 'division damage');

                        //Difference between BattleEye's expected damage and actual damage
                        var diff = totalDamage * (perc / 100) - totalDamage * (domination / 100);
                        log(diff, 'difference');

                        if (diff > 0) {
                            //Adding missing damage to the defending side
                            if (left) {
                                battleEyeLive.teamA.divisions.get('div' + divs[i]).damage += Math.round(Math.abs(diff));
                            } else {
                                battleEyeLive.teamB.divisions.get('div' + divs[i]).damage += Math.round(Math.abs(diff));
                            }
                        } else {
                            //Adding missing damage to the attacking side
                            if (!left) {
                                battleEyeLive.teamB.divisions.get('div' + divs[i]).damage += Math.round(Math.abs(diff));
                            } else {
                                battleEyeLive.teamA.divisions.get('div' + divs[i]).damage += Math.round(Math.abs(diff));
                            }
                        }

                        log(`Div ${ divs[i] } percentages fixed`);
                    } else {
                        log(`Div ${ divs[i] } percentages are accurate`);
                    }
                }
            });
        });
    }

    getNbpStats(cb) {
        $j.get('https://www.erepublik.com/en/military/nbp-stats/' + SERVER_DATA.battleId + '/2', function (data) {
            if (typeof cb == 'function') {
                cb(data);
            }
        });
    }
}

class CountryStats {
    constructor() {
        this.countries = {};
    }

    handle(data) {
        var country = data.msg.permalink;
        if (!this.countries[country]) {
            this.countries[country] = {
                damage: 0,
                kills: 0
            };
        }

        this.countries[country].damage += data.msg.damage;
        this.countries[country].kills++;
    }

    handleBare(data) {
        var ob = {
            msg: {
                permalink: "",
                damage: 0
            }
        };

        ob.msg.damage = data.damage;
        ob.msg.permalink = data.permalink;

        this.handle(ob);
    }

    getAll() {
        var self = this;
        var sorted = {};

        var keysSorted = Object.keys(self.countries).sort(function (a, b) {
            return self.countries[b].damage - self.countries[a].damage;
        });

        for (var i in keysSorted) {
            var key = keysSorted[i];
            sorted[key] = self.countries[key];
        }
        return sorted;
    }
}

class Divisions {
    constructor() {
        var self = this;
        this.divisions = {};
    }

    create(id, division) {
        this.divisions[id] = new DivisionStats(division);
        return this.divisions[id];
    }

    get(id) {
        return this.divisions[id];
    }

    handle(data) {
        for (var i in this.divisions) {
            this.divisions[i].handle(data);
        }
    }

    updateDps(time) {
        for (var i in this.divisions) {
            this.divisions[i].updateDps(time);
        }
    }

    toObject() {
        var object = {};
        for (var i in this.divisions) {
            object[i] = this.divisions[i].toObject();
        }

        return object;
    }
}

class DivisionStats extends DpsHandler {
    constructor(division) {
        super(10);
        this.division = division;
        this.hits = 0;
        this.damage = 0;
        this.countries = new CountryStats();
    }

    handle(data) {
        if (data.division != this.division) {
            return;
        }

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    toObject() {
        return {
            'damage': this.damage,
            'id': this.id,
            'dps': this.dps,
            'hits': this.hits,
            'avgHit': Math.round(this.damage / this.hits) | 0,
            'countries': this.countries.getAll()
        };
    }
}

class EventHandler {
    constructor() {
        this.events = {};
    }

    emit(eventName, data) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(function (fn) {
                return fn(data);
            });
        }
    }

    on(eventName, closure) {
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(closure);
    }

    off(eventName, closure) {
        if (this.events[eventName]) {
            for (var i in this.events[eventName]) {
                var event = this.events[eventName][i];
                if (event == closure) {
                    this.events[eventName].splice(i, 1);
                }
            }
        }
    }
}

class HitHistory {
    constructor(rememberFor = 30000) {
        this.rememberFor = rememberFor;
        this.history = {};
    }

    add(hit) {
        var time = new Date().getTime();
        this.history[time] = hit;
        this.trimOld(time);
    }

    trimOld(time = new Date().getTime()) {
        for (var i in this.history) {
            if (time - i - this.rememberFor > 0) {
                delete this.history[i];
            }
        }
    }

    clear() {
        this.history = {};
    }

    getTotal() {
        this.trimOld();

        var total = 0;
        for (var i in this.history) {
            total += this.history[i];
        }
        return total;
    }
}

class Layout {
    constructor(style, headerData) {
        var self = this;
        self.headerData = headerData;

        var battleEye = document.createElement('div');
        battleEye.setAttribute('id', 'battle_eye_live');

        if (settings.moveToTop.value) {
            $j('#content').prepend(battleEye);
        } else {
            $j('#content').append(battleEye);
        }

        $j('#battleConsole').append('<div id="bel-minimonitor"></div>');

        style.load();
    }

    update(feedData) {
        ReactDOM.render(React.createElement(Template, { settings: settings, feedData: feedData, headerData: this.headerData }), document.getElementById('battle_eye_live'));

        ReactDOM.render(React.createElement(MiniMonitor, { settings: settings, feedData: feedData }), document.getElementById('bel-minimonitor'));
    }
}

class Stats extends DpsHandler {
    constructor(id) {
        super(10);

        this.countries = new CountryStats();
        this.id = id;
        this.damage = 0;
        this.hits = 0;
        this.constructDivisions();
        this.revolution = false;
        this.defender = false;
    }

    constructDivisions() {
        this.divisions = new Divisions();

        this.divisions.create('div1', 1);
        this.divisions.create('div2', 2);
        this.divisions.create('div3', 3);
        this.divisions.create('div4', 4);
        this.divisions.create('div11', 11);
    }

    isSide(side) {
        return this.id == side;
    }

    updateDps(timeData) {
        super.updateDps(timeData);
        this.divisions.updateDps(timeData);
    }

    handle(data) {
        if (!this.isSide(data.side)) {
            return;
        }

        this.divisions.handle(data);

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    toObject() {
        return {
            'damage': this.damage,
            'id': this.id,
            'dps': this.dps,
            'hits': this.hits,
            'avgHit': Math.round(this.damage / this.hits),
            'divisions': this.divisions.toObject(),
            'countries': this.countries.getAll(),
            'revolution': this.revolution
        };
    }
}

class Storage {
    constructor() {
        var self = this;
        if (!self.checkIfStorageAvailable()) {
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
        self.defaults = {};
    }

    set(id, value) {
        var self = this;
        localStorage.setItem(`${ self.prepend }${ id }`, value);
        // if(settings.enableLogging.value){
        console.log(`[BATTLEEYE] ${ self.prepend }${ id } = ${ value }`);
        // }
    }

    get(id) {
        var self = this;
        var val = localStorage.getItem(`${ self.prepend }${ id }`);

        switch (val) {
            case 'true':
                val = true;
                break;
            case 'false':
                val = false;
                break;
        }

        return val;
    }

    has(field) {
        var self = this;
        if (localStorage.getItem(`${ self.prepend }${ field }`)) {
            return true;
        }

        return false;
    }

    define(id, value, group, name, desc) {
        var self = this;

        self.defaults[id] = {
            id, name, desc, group, value
        };
    }

    loadSettings() {
        var self = this;

        for (var i in self.defaults) {
            var field = self.defaults[i];

            if (self.fields[i] === undefined) {
                self.fields[i] = {
                    id: field.id,
                    name: field.name,
                    desc: field.desc,
                    group: field.group
                };
            }

            if (!self.has(i)) {
                self.set(i, field.value);
            }
        }
    }

    loadDefaults() {
        var self = this;

        for (var i in self.defaults) {
            self.set(i, self.defaults[i].value);
        }
    }

    getAll() {
        var self = this;

        var object = {};

        for (var i in self.fields) {
            var f = self.fields[i];

            object[i] = { field: f, value: self.get(f.id) };
        }

        return object;
    }

    checkIfStorageAvailable() {
        return typeof Storage !== "undefined";
    }
}

class Stylesheet {
    constructor() {
        this.sheet = "";

        this.sheet += `
            @keyframes bel-pulse-w {
                0% {
                    background-color: #27ae60;
                }

                10% {
                    background-color: #2ecc71;
                }

                100% {
                    background-color: #27ae60;
                }
            }

            @keyframes bel-pulse-l {
                0% {
                    background-color: #e74c3c;
                }

                10% {
                    background-color: #c0392b;
                }

                100% {
                    background-color: #e74c3c;
                }
            }

            .bel-spinner {
              width: 50px;
              height: 20px;
              text-align: center;
              font-size: 10px;
              padding-top: 8px;
            }

            .bel-spinner > div {
              background-color: #2980b9;
              height: 100%;
              width: 6px;
              display: inline-block;

              -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
              animation: sk-stretchdelay 1.2s infinite ease-in-out;
            }

            .bel-spinner .rect2 {
              -webkit-animation-delay: -1.1s;
              animation-delay: -1.1s;
              background-color: #3498db;
            }

            .bel-spinner .rect3 {
              -webkit-animation-delay: -1.0s;
              animation-delay: -1.0s;
              background-color: #2980b9;
            }

            .bel-spinner .rect4 {
              -webkit-animation-delay: -0.9s;
              animation-delay: -0.9s;
              background-color: #3498db;
            }

            .bel-spinner .rect5 {
              -webkit-animation-delay: -0.8s;
              animation-delay: -0.8s;
              background-color: #2980b9;
            }

            @-webkit-keyframes sk-stretchdelay {
              0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
              20% { -webkit-transform: scaleY(1.0) }
            }

            @keyframes sk-stretchdelay {
              0%, 40%, 100% {
                transform: scaleY(0.4);
                -webkit-transform: scaleY(0.4);
              }  20% {
                transform: scaleY(1.0);
                -webkit-transform: scaleY(1.0);
              }
            }

            hr.bel{
                 border: 0; height: 0; border-top: 1px solid rgba(0, 0, 0, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }
        `;

        this.addCSSRule('.clearfix:after', `
            content: "";
            display: table;
            clear: both;
        `);

        // this.addCSSRule('.belFeedValue:after', `
        //     content: "";
        //     display: table;
        //     clear: both;
        // `);
        //
        // this.addCSSRule('.belFeedValue', `
        //     position: relative;
        // `);
        //
        // this.addCSSRule('.belFeedValue ul', `
        //     z-index: 2;
        //     position: relative;
        // `);

        this.addCSSRule('#bel-battle-history', `
            position: relative;
            display: block;
            height: 35px;
            width: 35px;
            float: left;
            text-indent: -9999px;
            margin-left: 4px;
            margin-top: 5px;
            border-radius: 4px;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.45);
        `);

        this.addCSSRule('#bel-battle-history:hover', `
            background-color: rgba(0, 0, 0, 0.8);
        `);

        this.addCSSRule('#bel-battle-history::after', `
            position: absolute;
            top: 5px;
            left: 5px;
            width: 35px;
            height: 35px;
            background-image: url("https://dl.dropboxusercontent.com/u/86379644/sprites.png");
            background-repeat: no-repeat;
            background-position: 0 0;
            content: " ";
            opacity: 0.6;
        `);

        this.addCSSRule('#bel-battle-history');

        //General
        //

        this.addCSSRule('#bel-minimonitor', `
            position: absolute;
            right: 0;
        `);

        this.addCSSRule('#bel-country-list', `
            max-height: 400px;
            overflow-y: scroll;
        `);

        this.addCSSRule('.bel-minimonitor', `
            position: absolute;
            width: 118px;
            background-color: rgba(52, 73, 94, 0.7);
            right: 0;
            color: #ecf0f1;
            top: 10px;
            padding: 2px;
        `);

        this.addCSSRule('.bel-div', `
            background-image: url("https://dl.dropboxusercontent.com/u/86379644/divs.png");
            background-repeat: no-repeat;
            height: 22px;
            width: 19px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 5px;
        `);

        this.addCSSRule('.bel-div1', `
            background-position: 0 0;
        `);

        this.addCSSRule('.bel-div2', `
            background-position: -38px 0;
        `);

        this.addCSSRule('.bel-div3', `
            background-position: -19px 0;
        `);

        this.addCSSRule('.bel-div4', `
            background-position: -76px 0;
        `);

        this.addCSSRule('.bel-div11', `
            background-position: -57px 0;
        `);

        this.addCSSRule('.bel-tabs', `
            margin: 5px 0;
        `);

        this.addCSSRule('.bel-tabs button', `
            border-radius: 0px;
        `);

        this.addCSSRule('.bel-tabs button:first-child', `
            border-radius: 4px 0 0 4px;
        `);

        this.addCSSRule('.bel-tabs button:last-child', `
            border-radius: 0 4px 4px 0;
        `);

        this.addCSSRule('.bel-country', `
            width: 28px;
            height: 25px;
            margin-bottom: -5px;
            margin-left: 5px;
            margin-right: 5px;
            display: inline-block;
        `);

        this.addCSSRule("#battle_eye_live", `
            width: 100%;
            position:relative;
            float:left;
            padding:10px;
            box-sizing: border-box;
            border-radius:0px 0px 20px 20px;
            background-color: #ffffff;
            color: #34495e;
            font-size:14px;
            font-family: "Lato",Helvetica,Arial,sans-serif;
            text-align: center;
            line-height: 1.7;
        `);

        this.addCSSRule('.color-silver', 'color: #bdc3c7');

        this.addCSSRule('.pull-left', 'float:left;');
        this.addCSSRule('.pull-right', 'float:right;');

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before', '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
        this.addCSSRule(".bel-value", `
            display: inline-block;
            line-height: 1.2;
            background-color: #ecf0f1;
            padding: 2px 10px;
            border-radius: 4px;
            margin: 0 2px 2px 2px;
        `);

        this.addCSSRule(".bel-value-hl-w", `
            color: #ffffff;
            animation: bel-pulse-w 3s infinite;
            background-color: #27ae60;
        `);

        this.addCSSRule(".bel-value-hl-l", `
            color: #ffffff;
            animation: bel-pulse-l 3s infinite;
            background-color: #e74c3c;
        `);

        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-version-outdated', 'background-color: #e74c3c;');
        this.addCSSRule('.bel-title', 'background-color: #ecf0f1;margin-bottom:2px;margin-top:5px;');
        this.addCSSRule('.bel-titles', `
            font-weight: 700;
        `);
        this.addCSSRule('.bel-text-tiny', 'font-size:10px;');
        this.addCSSRule('.bel-highlight-title', `
            background-color: #34495e;
            color: #fff;
        `);
        this.addCSSRule('.bel-highlight', `
            color: #34495e;
        `);
        //Grids
        this.addCSSRule('.bel-grid:after', 'content: "";display: table;clear: both;');
        this.addCSSRule("[class*='bel-col-']", 'float: left;min-height: 1px;');
        this.addCSSRule('.bel-col-1-1', 'width: 100%;');
        this.addCSSRule('.bel-col-1-2', 'width: 50%;');
        this.addCSSRule('.bel-col-1-4', 'width: 25%;');
        this.addCSSRule('.bel-col-1-3', 'width: 33.3333%;');
        this.addCSSRule('.bel-col-1-8', 'width: 12.5%;');
        //Lists
        this.addCSSRule('.list-unstyled', 'list-style: outside none none;padding-left: 0;');
        this.addCSSRule('.list-inline li', 'display: inline-block;');

        this.addCSSRule('.bel-closed', `
            z-index: 100;
            position: absolute;
            width: 100%;
            opacity: 0.95;
            top: 0;
            left: 0;
            background-color: #2c3e50;
            text-shadow: 0 0 2px #363636;
            color: #ffffff;
            font-size: 20px;
            padding: 14px;
            text-align: center;
            overflow: hidden;
            height: 100%;
            display: none;
        `);
        this.addCSSRule('.bel-closed p', `
            font-size: 12px;
        `);

        //Settings
        this.addCSSRule('.bel-settings', `
            z-index: 100;
            position: absolute;
            width: 100%;
            opacity: 0.95;
            top: 0;
            left: 0;
            background-color: #ffffff;
            padding: 14px;
            text-align: left;
            overflow-y: scroll;
            height: 100%;
        `);

        this.addCSSRule('.bel-settings-group', `
            background-color: #34495e;
            color: #ecf0f1;
            padding-left: 10px;
        `);

        this.addCSSRule('.bel-settings-container', `
            padding-left: 5px;
        `);

        this.addCSSRule('.bel-settings-field', `
            margin-right: 3px;
        `);

        this.addCSSRule('.bel-field-description', `
            font-size: 12px;
            color: #95a5a6;
        `);

        this.addCSSRule('.bel-checkbox', `
            padding: 5px 3px;
            border-bottom: 1px solid #ecf0f1;
        `);

        this.addCSSRule('.bel-hidden', `
            display: none;
        `);

        //Button
        this.addCSSRule('.bel-btn', `
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            background-image: none;
            border: none !important;
            cursor: pointer;
            font-size: 13px;
            font-weight: normal;
            margin-bottom: 0;
            text-align: center;
            border-radius: 4px;
            padding: 3px 8px;
            font-family: "Lato",Helvetica,Arial,sans-serif;
            transition: background-color 0.5s;
        `);

        this.addCSSRule('a.bel-btn', `
            padding: 4px 8px;
        `);

        this.addCSSRule('.bel-btn-default', `
            background-color: #1abc9c;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-default:hover', `
            background-color: #16a085;
        `);

        this.addCSSRule('.bel-btn-grey', `
            background-color: #ecf0f1;
            color: #34495e;
        `);

        this.addCSSRule('.bel-btn-grey:hover', `
            background-color: #CED3D6;
        `);

        this.addCSSRule('.bel-btn-danger', `
            background-color: #e74c3c;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-danger:hover', `
            background-color: #c0392b;
        `);

        this.addCSSRule('.bel-btn-inverse', `
            background-color: #2c3e50;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-inverse:hover', `
            background-color: #34495e;
        `);

        this.addCSSRule('.bel-btn-info', `
            background-color: #2980b9;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-info:hover', `
            background-color: #3498db;
        `);

        //Header menu
        this.addCSSRule('.bel-header-menu', 'margin-bottom: 10px;');
        this.addCSSRule('.bel-header-menu li', 'padding: 0 5px;');

        //Team colors
        this.addCSSRule('.bel-teama', 'background-color: #27ae60;');
        this.addCSSRule('.bel-teamb', 'background-color: #c0392b;');
        this.addCSSRule('.bel-teama-color', 'color: #27ae60;');
        this.addCSSRule('.bel-teamb-color', 'color: #c0392b;');

        //Progress bars
        // this.addCSSRule('.bel-progress', `
        //     position: absolute;
        //     height: 20px;
        //     width: 100%;
        //     left:0;
        //     bottom: 0;
        // `);
        this.addCSSRule('.bel-progress', `
            height: 4px;
            position: relative;
            background: #ebedef none repeat scroll 0 0;
            border-radius: 32px;
            box-shadow: none;
            margin-top: 2px;
            overflow: hidden;
        `);

        this.addCSSRule('.bel-progress-bar', `
            box-shadow: none;
            line-height: 12px;
            color: #fff;
            float: left;
            font-size: 12px;
            height: 100%;
            line-height: 20px;
            text-align: center;
            transition: width 0.6s ease 0s;
            width: 0;
        `);
        //
        this.addCSSRule('.bel-progress-center-marker', `
            border-right: 3px solid #ffffff;
            height: 10px;
            left: 50%;
            margin-left: -2px;
            opacity: 0.6;
            position: absolute;
        `);
        //Other
        this.addCSSRule('.bel-hr', `
            -moz-border-bottom-colors: none;
            -moz-border-left-colors: none;
            -moz-border-right-colors: none;
            -moz-border-top-colors: none;
            border-color: #eee -moz-use-text-color -moz-use-text-color;
            border-image: none;
            border-style: solid none none;
            border-width: 1px 0 0;
            margin-bottom: 20px;
        `);
    }

    addCSSRule(selector, rules) {
        this.sheet += selector + "{" + rules + "}";
    }

    load() {
        $j('head').append(`<style>${ this.sheet }</style>`);
    }
}

class Utils {
    uid() {
        return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
    }
}

var UTILS = new Utils();

function log(data, desc) {
    if (desc === undefined) {
        desc = '';
    }
    console.log("[BATTLEEYE] " + desc + ": " + data);
}

var settings = {};
var contributors = [];
var modules = null;
var storage = null;
var battleEyeLive = {
    closed: false,
    nbpStats: null,
    updateContributors: true,
    init: function () {
        var self = this;
        console.log('[BATTLEEYE] Initialisation');

        //Setting up the Storage class, that handles localStorage stuff
        storage = self.settingsStorage = new Storage();
        if (storage === false) {
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        //Defining default settings
        storage.define('showOtherDivs', true, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below.");
        storage.define('showDiv1', true, 'Structure', "Show DIV 1");
        storage.define('showDiv2', true, 'Structure', "Show DIV 2");
        storage.define('showDiv3', true, 'Structure', "Show DIV 3");
        storage.define('showDiv4', true, 'Structure', "Show DIV 4");
        storage.define('showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count");
        storage.define('showAverageDamage', false, 'Structure', "Show average damage dealt");
        storage.define('showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield");
        storage.define('showKills', false, 'Structure', "Show kills done by each division");
        storage.define('showDamagePerc', true, 'Structure', "Show Damage percentages");
        storage.define('moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh');

        storage.define('reduceLoad', false, 'Performance', "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance");
        storage.define('gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time.");

        storage.define('highlightDivision', true, 'Visual', "Highlight current division");
        storage.define('highlightValue', true, 'Visual', "Highlight winning side");

        storage.define('showDpsBar', true, 'Bars', "Show DPS bar");
        storage.define('showDamageBar', false, 'Bars', "Show Damage bar");
        storage.define('showDominationBar', true, 'Bars', "Show Domination bar");
        storage.define('largerBars', false, 'Bars', "Larger bars");

        storage.define('enableLogging', false, 'Other', "Enable logging to console");

        modules = new ModuleLoader(self.settingsStorage);
        modules.load(new AutoShooter());
        modules.load(new Other());
        // modules.load(new BattleHistory());
        // modules.load(new PercentageFixer());

        //Loading settings
        storage.loadSettings();
        settings = storage.getAll();
        //

        self.events = new EventHandler();

        //Defining Stats classes for both sides
        self.teamA = new Stats(SERVER_DATA.leftBattleId);
        self.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        self.teamB = new Stats(SERVER_DATA.rightBattleId);
        self.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        if (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId) {
            self.teamA.defender = true;
        } else {
            self.teamB.defender = true;
        }

        var revolCountry = null;
        if (SERVER_DATA.isCivilWar) {
            if (SERVER_DATA.invaderId == SERVER_DATA.leftBattleId) {
                self.teamA.revolution = true;
                self.teamAName = self.teamBName + " Revolution";
                revolCountry = self.teamBName;
            } else {
                self.teamB.revolution = true;
                self.teamBName = self.teamAName + " Revolution";
                revolCountry = self.teamAName;
            }
        }

        var resistanceBonusAttacker = $j('#pvp_header .domination span.resistance_influence_value.attacker em');
        var resistanceBonusDefender = $j('#pvp_header .domination span.resistance_influence_value.defender em');
        self.leftDetBonus = 1;
        self.rightDetBonus = 1;

        if (resistanceBonusAttacker.length > 0) {
            if (!self.teamA.defender) {
                self.leftDetBonus = parseFloat(resistanceBonusAttacker.html());
            } else {
                self.rightDetBonus = parseFloat(resistanceBonusAttacker.html());
            }
        }

        if (resistanceBonusDefender.length > 0) {
            if (self.teamA.defender) {
                self.leftDetBonus = parseFloat(resistanceBonusDefender.html());
            } else {
                self.rightDetBonus = parseFloat(resistanceBonusDefender.html());
            }
        }

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': revolCountry
        });

        //Rendering the layout
        self.layout.update(self.getTeamStats());

        //Overriding pomelo's disconnect to avoid interruptions by 3rd parties
        pomelo.disconnect = function () {};

        //Updates data from data.json
        self.checkForUpdates();

        //Loads stats from erepublik's battle console
        self.loadBattleStats();

        //Listens to setting changes
        $j('.bel-settings-field').on('change', function (event) {
            var input = event.target;
            var value;

            if (input.type == "checkbox") {
                value = input.checked;
            } else {
                value = input.value;
            }
            self.settingsStorage.set(input.name, value);
            settings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            $j("label[for=\"" + targetAtt + "\"]").notify("Saved", { position: "right middle", className: "success" });
        });

        $j('[data-tab="other"]').click(function () {
            self.nbpStats = null;
            self.updateNbpStats(function (data) {});
        });

        self.runTicker();
        self.handleEvents();
        modules.run();
    },
    updateNbpStats: function (cb) {
        var self = this;
        $j.get('https://www.erepublik.com/en/military/nbp-stats/85503/2', function (data) {
            data = JSON.parse(data);
            self.nbpStats = data;
            self.nbpUpdated = new Date();
            if (typeof cb == 'function') {
                cb(data);
            }
        });
    },
    //Loads stats from erepublik's battle console
    loadBattleStats: function () {
        var self = this;
        if (!settings.gatherBattleStats.value) {
            $j('#bel-loading').hide();
            return;
        }

        self.getBattleStats(function (leftDamage, rightDamage, leftKills, rightKills) {
            var divs = [1, 2, 3, 4, 11];

            for (var d in divs) {
                var div = divs[d];
                var leftDmg = 0;
                var rightDmg = 0;
                var leftKl = 0;
                var rightKl = 0;

                for (var i in leftDamage['div' + div]) {
                    var hit = leftDamage['div' + div][i];
                    var dmg = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                    leftDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    self.teamA.countries.handleBare(bareData);
                    self.teamA.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for (var i in rightDamage['div' + div]) {
                    var hit = rightDamage['div' + div][i];
                    var dmg = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                    rightDmg += dmg;

                    var bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    self.teamB.countries.handleBare(bareData);
                    self.teamB.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for (var i in leftKills['div' + div]) {
                    var hit = leftKills['div' + div][i];
                    leftKl += Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                }

                for (var i in rightKills['div' + div]) {
                    var hit = rightKills['div' + div][i];
                    rightKl += Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                }

                self.teamA.divisions.get('div' + div).damage += leftDmg;
                self.teamB.divisions.get('div' + div).damage += rightDmg;
                self.teamA.damage += leftDmg;
                self.teamB.damage += rightDmg;
                self.teamA.divisions.get('div' + div).hits += leftKl;
                self.teamB.divisions.get('div' + div).hits += rightKl;
                self.teamA.hits += leftKl;
                self.teamB.hits += rightKl;
            }

            $j('#bel-loading').hide();
        });
    },

    resetSettings: function () {
        storage.loadDefaults();
        settings = storage.getAll();
    },

    checkForUpdates: function () {
        var self = this;
        $j.get('https://dl.dropboxusercontent.com/u/86379644/data.json', function (data) {
            data = JSON.parse(data);
            contributors = data.contributors;
            self.displayContributors();
            var version = parseInt(data.version.replace(/\D/g, ""));
            var currentVersion = parseInt(GM_info.script.version.replace(/\D/g, ""));
            if (currentVersion != version) {
                document.querySelector('.bel-version').classList.add('bel-version-outdated');
                document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="' + data.updateUrl + '">Update</a>';
            }

            console.log('[BATTLEEYE] Data JSON received and processed');
        }).error(function (error) {
            console.error('[BATTLEEYE] Failed to download data.json');
        });
    },

    displayContributors: function () {
        $j('.bel-contributor').each(function () {
            $j(this).removeClass('bel-contributor').removeAttr('style').removeAttr('original-title');
        });

        for (var color in contributors) {
            var players = contributors[color];
            for (var j in players) {
                var cId = players[j];
                if (erepublik.citizen.citizenId == cId) {
                    $j('#battleConsole .left_player .player_name').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").tipsy();
                } else if ($j('li[data-citizen-id="' + cId + '"] .player_name a').length > 0) {
                    $j('li[data-citizen-id="' + cId + '"] .player_name a').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                }
            }
        }
    },

    getTeamStats: function () {
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleStats: function (callback) {
        var self = this;
        var attacker = SERVER_DATA.leftBattleId;
        var defender = SERVER_DATA.rightBattleId;

        var attackerData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            defenderData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            attackerKillData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            defenderKillData = { div1: [], div2: [], div3: [], div4: [], div11: [] };

        var request = function (div, pageLeft, pageRight, cb, type) {
            if (type === undefined) {
                type = 'damage';
            }

            $j.post('https://www.erepublik.com/en/military/battle-console', {
                _token: SERVER_DATA.csrfToken,
                action: 'battleStatistics',
                battleId: SERVER_DATA.battleId,
                division: div,
                leftPage: pageLeft,
                rightPage: pageRight,
                round: SERVER_DATA.zoneId,
                type: type,
                zoneId: parseInt(SERVER_DATA.zoneId, 10)
            }, function (data) {
                cb(data);
            });
        };

        var damageHandler = function (div, cb) {
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function (whileCb) {
                request(div, page, page, function (data) {
                    for (var i in data[attacker].fighterData) {
                        attackerData['div' + div].push(data[attacker].fighterData[i]);
                    }
                    for (var i in data[defender].fighterData) {
                        defenderData['div' + div].push(data[defender].fighterData[i]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);

                    if (settings.enableLogging.value) {
                        console.log('[BATTLEEYE] Finished damage page ' + page + "/" + maxPage + " div" + div);
                    }
                    page++;
                    whileCb();
                }, 'damage');
            }, function () {
                return page <= maxPage;
            }, function () {
                cb();
            });
        };

        var killsHandler = function (div, cb) {
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function (whileCb) {
                request(div, page, page, function (data) {

                    for (var i in data[attacker].fighterData) {
                        attackerKillData['div' + div].push(data[attacker].fighterData[i]);
                    }

                    for (var j in data[defender].fighterData) {
                        defenderKillData['div' + div].push(data[defender].fighterData[j]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    if (settings.enableLogging.value) {
                        console.log('[BATTLEEYE] Finished kill page ' + page + "/" + maxPage + " div" + div);
                    }
                    page++;

                    whileCb();
                }, 'kills');
            }, function () {
                return page <= maxPage;
            }, function () {
                cb();
            });
        };

        var divRange = SERVER_DATA.division == 11 ? [11] : [1, 2, 3, 4];

        async.each(divRange, damageHandler.bind(self), function () {
            async.each(divRange, killsHandler.bind(self), function () {
                callback(attackerData, defenderData, attackerKillData, defenderKillData);
                self.events.emit('battleConsoleLoaded', null);
            });
        });
    },

    runTicker: function () {
        var self = this;
        var second = 0;

        var ticker = function () {
            second++;
            var timeData = {
                'second': second,
                'time': new Date().getTime()
            };
            self.events.emit('tick', timeData);
        };

        self.interval = setInterval(ticker, 1000);
    },

    handleEvents: function () {
        var self = this;
        self.events.on('tick', function (timeData) {
            if (timeData.second % 3 === 0 && self.updateContributors) {
                self.updateContributors = false;
                self.displayContributors();
            }
            self.teamA.updateDps(timeData);
            self.teamB.updateDps(timeData);
            self.layout.update(self.getTeamStats());
        });
    },

    overridePomelo: function () {
        var self = this;

        var handler = function (data) {
            self.updateContributors = true;
            self.handle(data);
        };

        pomelo.on('onMessage', handler);
        pomelo.on('close', function (data) {
            console.log('[BATTLEEYE] Socket closed [' + data.reason + ']');
            self.closed = true;
            $j('#belClosed').show();
            clearTimeout(self.interval);
        });
    },
    handle: function (data) {
        var self = this;
        self.teamA.handle(data);
        self.teamB.handle(data);
        if (!settings.reduceLoad.value) {
            self.layout.update(self.getTeamStats());
        }
    }
};

battleEyeLive.init();
setTimeout(function () {
    battleEyeLive.overridePomelo();
}, 2000);