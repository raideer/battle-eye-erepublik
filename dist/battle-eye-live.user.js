'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Industrials
// @homepage    https://docs.google.com/spreadsheets/d/1Ebqp5Hb8KmGvX6X0FXmALO30Fv-IyfJHUGPkjKey8tg
// @description LIVE battlefield statistics
// @include     http*://www.erepublik.com/*/military/battlefield-new/*
// @version     1.3.2
// @require     https://fb.me/react-15.2.1.min.js
// @require     https://fb.me/react-dom-15.2.1.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/async/2.0.1/async.min.js
// @require     https://dl.dropboxusercontent.com/u/86379644/notify.js
// @run-at      document-idle
// @grant       none
// @noframes
// ==/UserScript==

var DpsHandler = function () {
    function DpsHandler(rem) {
        _classCallCheck(this, DpsHandler);

        this.rememberDpsFor = rem;
        this.hitHistory = new HitHistory(rem * 1000);
        this.hitStreakSeconds = 0;
        this.lastHit = 0;
        this.dps = 0;
    }

    _createClass(DpsHandler, [{
        key: 'addHit',
        value: function addHit(damage) {
            this.lastHit = new Date().getTime();
            this.hitHistory.add(damage);
        }
    }, {
        key: 'updateDps',
        value: function updateDps(timeData) {
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
    }]);

    return DpsHandler;
}();

var Feed = function (_React$Component) {
    _inherits(Feed, _React$Component);

    function Feed() {
        _classCallCheck(this, Feed);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Feed).apply(this, arguments));
    }

    _createClass(Feed, [{
        key: 'printDivisions',
        value: function printDivisions() {
            if (!this.props.data) {
                return null;
            }

            var divs = [];

            if (SERVER_DATA.division == 11) {
                var divInfo = [[11, 'Air Division']];
            } else {
                var divInfo = [[1, 'Division 1'], [2, 'Division 2'], [3, 'Division 3'], [4, 'Division 4']];
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
    }, {
        key: 'printOverall',
        value: function printOverall() {
            var data = {};
            data.left = this.props.data.left;
            data.right = this.props.data.right;

            return React.createElement(FeedOverall, { data: data, settings: this.props.settings });
        }
    }, {
        key: 'printCountries',
        value: function printCountries() {
            var data = {};
            data.left = this.props.data.left;
            data.right = this.props.data.right;

            return React.createElement(FeedCountries, { data: data, settings: this.props.settings });
        }
    }, {
        key: 'getContent',
        value: function getContent() {
            if (this.props.tab == 'div') {
                return this.printDivisions();
            } else if (this.props.tab == 'overall') {
                return this.printOverall();
            } else if (this.props.tab == 'countries') {
                return this.printCountries();
            }
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'bel-grid' },
                this.getContent()
            );
        }
    }]);

    return Feed;
}(React.Component);

var FeedCountries = function (_React$Component2) {
    _inherits(FeedCountries, _React$Component2);

    function FeedCountries() {
        _classCallCheck(this, FeedCountries);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FeedCountries).apply(this, arguments));
    }

    _createClass(FeedCountries, [{
        key: 'getFlagStyle',
        value: function getFlagStyle(c) {
            return {
                backgroundImage: 'url(\'/images/flags_png/L/' + c + '.png\')',
                backgroundPosition: "-4px -4px"
            };
        }
    }, {
        key: 'getStats',
        value: function getStats(side) {
            var content = [];
            var countries = this.props.data[side].countries;
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
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
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
            );
        }
    }]);

    return FeedCountries;
}(React.Component);

var FeedDivision = function (_React$Component3) {
    _inherits(FeedDivision, _React$Component3);

    function FeedDivision() {
        _classCallCheck(this, FeedDivision);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FeedDivision).apply(this, arguments));
    }

    _createClass(FeedDivision, [{
        key: 'getPerc',
        value: function getPerc(a, b) {
            var ap = 0;
            if (a + b != 0) {
                ap = Math.round(a * 1000 / (a + b)) / 10;
            }

            return ap;
        }
    }, {
        key: 'render',
        value: function render() {
            var left = this.props.data.left;
            var right = this.props.data.right;
            var settings = this.props.settings;
            var highlightDivision = false;
            if (settings.highlightDivision.value && SERVER_DATA.division == this.props.div[0]) {
                highlightDivision = true;
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
                        { className: "list-unstyled bel-titles " + (highlightDivision ? "bel-highlight" : "") },
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
    }]);

    return FeedDivision;
}(React.Component);

var FeedOverall = function (_React$Component4) {
    _inherits(FeedOverall, _React$Component4);

    function FeedOverall() {
        _classCallCheck(this, FeedOverall);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FeedOverall).apply(this, arguments));
    }

    _createClass(FeedOverall, [{
        key: 'getPerc',
        value: function getPerc(a, b) {
            var ap = 0;
            if (a + b != 0) {
                ap = Math.round(a * 100 / (a + b));
            }

            return ap;
        }
    }, {
        key: 'render',
        value: function render() {
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
    }]);

    return FeedOverall;
}(React.Component);

var FeedProgressBar = function (_React$Component5) {
    _inherits(FeedProgressBar, _React$Component5);

    function FeedProgressBar() {
        _classCallCheck(this, FeedProgressBar);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(FeedProgressBar).apply(this, arguments));
    }

    _createClass(FeedProgressBar, [{
        key: 'render',
        value: function render() {
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
    }]);

    return FeedProgressBar;
}(React.Component);

var FeedValue = function (_React$Component6) {
    _inherits(FeedValue, _React$Component6);

    function FeedValue() {
        _classCallCheck(this, FeedValue);

        var _this6 = _possibleConstructorReturn(this, Object.getPrototypeOf(FeedValue).call(this));

        _this6.props = {
            text: "",
            green: false
        };
        return _this6;
    }

    _createClass(FeedValue, [{
        key: 'render',
        value: function render() {
            return React.createElement(
                'span',
                { className: "bel-value " + (this.props.a > this.props.b && this.props.highlight ? this.props.green == true ? "bel-value-hl-w" : "bel-value-hl-l" : "") },
                parseFloat(this.props.a).toLocaleString(),
                ' ',
                this.props.text
            );
        }
    }]);

    return FeedValue;
}(React.Component);

var Footer = function (_React$Component7) {
    _inherits(Footer, _React$Component7);

    function Footer() {
        _classCallCheck(this, Footer);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Footer).apply(this, arguments));
    }

    _createClass(Footer, [{
        key: 'render',
        value: function render() {
            return null;
        }
    }]);

    return Footer;
}(React.Component);

var Header = function (_React$Component8) {
    _inherits(Header, _React$Component8);

    function Header() {
        _classCallCheck(this, Header);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Header).apply(this, arguments));
    }

    _createClass(Header, [{
        key: 'getTeamElementStyle',
        value: function getTeamElementStyle() {
            return {
                fontWeight: 700,
                fontSize: '1.3em'
            };
        }
    }, {
        key: 'getHeaderListStyle',
        value: function getHeaderListStyle() {
            return {
                paddingBottom: "6px",
                borderBottom: "1px solid #ecf0f1"
            };
        }
    }, {
        key: 'getFlagStyle',
        value: function getFlagStyle(c) {
            return {
                backgroundImage: 'url(\'/images/flags_png/L/' + c + '.png\')',
                backgroundPosition: "-4px -4px"
            };
        }
    }, {
        key: 'render',
        value: function render() {
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
            );
        }
    }]);

    return Header;
}(React.Component);

var If = function (_React$Component9) {
    _inherits(If, _React$Component9);

    function If() {
        _classCallCheck(this, If);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(If).apply(this, arguments));
    }

    _createClass(If, [{
        key: 'render',
        value: function render() {
            if (this.props.test) {
                return React.createElement(
                    'span',
                    null,
                    this.props.children
                );
            }

            return null;
        }
    }]);

    return If;
}(React.Component);

var MiniMonitor = function (_React$Component10) {
    _inherits(MiniMonitor, _React$Component10);

    function MiniMonitor() {
        _classCallCheck(this, MiniMonitor);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MiniMonitor).apply(this, arguments));
    }

    _createClass(MiniMonitor, [{
        key: 'getPerc',
        value: function getPerc(a, b) {
            var ap = 0;
            if (a + b != 0) {
                ap = Math.round(a * 1000 / (a + b)) / 10;
            }

            return ap;
        }
    }, {
        key: 'printDivisions',
        value: function printDivisions() {
            var data = [];
            var left = this.props.feedData.left;
            var right = this.props.feedData.right;
            if (SERVER_DATA.division == 11) {
                var divs = [11];
            } else {
                var divs = [1, 2, 3, 4];
            }

            for (var i in divs) {
                var div = divs[i];
                data.push(React.createElement(
                    'div',
                    null,
                    React.createElement('div', { className: "bel-div bel-div" + div }),
                    ' ',
                    this.getPerc(left.divisions['div' + div].damage, right.divisions['div' + div].damage),
                    '% - ',
                    this.getPerc(right.divisions['div' + div].damage, left.divisions['div' + div].damage),
                    '%'
                ));
            }

            return data;
        }
    }, {
        key: 'render',
        value: function render() {
            if (!settings.showMiniMonitor.value) {
                return null;
            }

            return React.createElement(
                'div',
                { className: 'bel-minimonitor' },
                this.printDivisions()
            );
        }
    }]);

    return MiniMonitor;
}(React.Component);

var SettingsField = function (_React$Component11) {
    _inherits(SettingsField, _React$Component11);

    function SettingsField() {
        _classCallCheck(this, SettingsField);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SettingsField).apply(this, arguments));
    }

    _createClass(SettingsField, [{
        key: 'getInput',
        value: function getInput() {
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
    }, {
        key: 'render',
        value: function render() {
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
    }]);

    return SettingsField;
}(React.Component);

var SettingsGroup = function (_React$Component12) {
    _inherits(SettingsGroup, _React$Component12);

    function SettingsGroup() {
        _classCallCheck(this, SettingsGroup);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SettingsGroup).apply(this, arguments));
    }

    _createClass(SettingsGroup, [{
        key: 'renderSettings',
        value: function renderSettings() {
            var settings = this.props.settings;
            var components = [];

            for (var i in settings) {
                var setting = settings[i];
                components.push(React.createElement(SettingsField, { setting: setting }));
            }

            return components;
        }
    }, {
        key: 'render',
        value: function render() {
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
    }]);

    return SettingsGroup;
}(React.Component);

var SettingsModal = function (_React$Component13) {
    _inherits(SettingsModal, _React$Component13);

    function SettingsModal() {
        _classCallCheck(this, SettingsModal);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(SettingsModal).apply(this, arguments));
    }

    _createClass(SettingsModal, [{
        key: 'renderGroups',
        value: function renderGroups() {
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
    }, {
        key: 'resetSettings',
        value: function resetSettings() {
            battleEyeLive.resetSettings();
            $j('#bel-reset-settings').notify('Settings reset', 'info');
        }
    }, {
        key: 'render',
        value: function render() {
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
                                { href: 'https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/battle-eye-live.user.js', className: 'bel-btn bel-btn-inverse' },
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
    }]);

    return SettingsModal;
}(React.Component);

var TabSelector = function (_React$Component14) {
    _inherits(TabSelector, _React$Component14);

    function TabSelector() {
        _classCallCheck(this, TabSelector);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(TabSelector).apply(this, arguments));
    }

    _createClass(TabSelector, [{
        key: 'getStyle',
        value: function getStyle(tab) {
            if (this.props.tab == tab) {
                return "bel-btn bel-btn-default";
            }

            return "bel-btn bel-btn-grey";
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                { className: 'bel-tabs' },
                React.createElement(
                    'button',
                    { onClick: this.props.changeTab.bind(this, 'div'), className: this.getStyle('div') },
                    'Divisions'
                ),
                React.createElement(
                    'button',
                    { onClick: this.props.changeTab.bind(this, 'overall'), className: this.getStyle('overall') },
                    'Total'
                ),
                React.createElement(
                    'button',
                    { onClick: this.props.changeTab.bind(this, 'countries'), className: this.getStyle('countries') },
                    'Countries'
                )
            );
        }
    }]);

    return TabSelector;
}(React.Component);

var Template = function (_React$Component15) {
    _inherits(Template, _React$Component15);

    function Template() {
        _classCallCheck(this, Template);

        var _this15 = _possibleConstructorReturn(this, Object.getPrototypeOf(Template).call(this));

        _this15.state = {
            modalHidden: true,
            tab: 'div'
        };
        return _this15;
    }

    _createClass(Template, [{
        key: 'openModal',
        value: function openModal() {
            this.setState({
                'modalHidden': false
            });
        }
    }, {
        key: 'closeModal',
        value: function closeModal() {
            this.setState({
                'modalHidden': true
            });
        }
    }, {
        key: 'changeTab',
        value: function changeTab(tab) {
            this.setState({
                'tab': tab
            });
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(SettingsModal, { closeModal: this.closeModal.bind(this), hidden: this.state.modalHidden, settings: this.props.settings }),
                React.createElement(Header, { openModal: this.openModal.bind(this), data: this.props.headerData }),
                React.createElement(TabSelector, { changeTab: this.changeTab.bind(this), tab: this.state.tab }),
                React.createElement(Feed, { data: this.props.feedData, settings: this.props.settings, tab: this.state.tab }),
                React.createElement(Footer, null)
            );
        }
    }]);

    return Template;
}(React.Component);

var Module = function () {
    function Module(name, description) {
        _classCallCheck(this, Module);

        var self = this;
        self.name = name;
        self.desc = description;
    }

    _createClass(Module, [{
        key: 'defineSettings',
        value: function defineSettings() {
            return [];
        }
    }, {
        key: 'run',
        value: function run(settings) {
            return null;
        }
    }]);

    return Module;
}();

var AutoShooter = function (_Module) {
    _inherits(AutoShooter, _Module);

    function AutoShooter() {
        _classCallCheck(this, AutoShooter);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(AutoShooter).call(this, 'AutoShooter', 'Automatically shoots, when the FIGHT button is held'));
    }

    /**
     * Defining settings for autoshooter
     */


    _createClass(AutoShooter, [{
        key: 'defineSettings',
        value: function defineSettings() {
            return [['autoShooterEnabled', false, "Enable AutoShooter", "Automatically shoots, when the FIGHT button is held"], ['autoShooterStart', false, "Start AutoShooter immediately after the button is pressed.", "Otherwise, AutoShooter will start after the shot delay"], ['autoShooterEnter', true, "Shoot while holding ENTER"], ['autoShooterSpace', true, "Shoot while holding SPACE"], ['autoShooterDelay', 1500, "Delay between shots (in ms)"]];
        }
    }, {
        key: 'run',
        value: function run() {
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
            var handle = function handle() {
                //Checking if enabled
                if (!settings.autoShooterEnabled.value) {
                    return;
                }

                //Posts fight request
                var action = function action() {
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
    }]);

    return AutoShooter;
}(Module);

var ModuleLoader = function () {
    function ModuleLoader(storage) {
        _classCallCheck(this, ModuleLoader);

        this.modules = {};
        this.storage = storage;
    }

    _createClass(ModuleLoader, [{
        key: 'load',
        value: function load(module) {
            if (module instanceof Module) {
                this.modules[module.name] = module;
                var settings = module.defineSettings();
                for (var i in settings) {
                    var s = settings[i];
                    this.storage.define(s[0], s[1], module.name, s[2], s[3]);
                }
            }
        }
    }, {
        key: 'get',
        value: function get(name) {
            return this.modules[name];
        }
    }, {
        key: 'run',
        value: function run() {
            for (var i in this.modules) {
                try {
                    this.modules[i].run();
                } catch (e) {
                    console.error('Failed to run module ' + i + '!: ' + e);
                }
            }
        }
    }]);

    return ModuleLoader;
}();

var Other = function (_Module2) {
    _inherits(Other, _Module2);

    function Other() {
        _classCallCheck(this, Other);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Other).call(this, 'Other', 'Other miscellaneous enhancements'));
    }

    _createClass(Other, [{
        key: 'defineSettings',
        value: function defineSettings() {
            return [['otherFixCometchat', true, "Cometchat fix", "Removes the fading, clickblocking line from the bottom of the screen. (Requires a page refresh)"]];
        }
    }, {
        key: 'run',
        value: function run() {
            if (settings.otherFixCometchat.value) {
                var fixCometchat = function fixCometchat() {
                    var cometchat = document.getElementById('cometchat_base');
                    if (cometchat !== null) {
                        var style = "width:auto;position:aboslute;right:0;background:none;";
                        cometchat.setAttribute('style', style);
                        clearInterval(waitForCometchat);
                    }
                };

                //Removing that annoying cometchat background
                var waitForCometchat = setInterval(fixCometchat, 500);
            }
        }
    }]);

    return Other;
}(Module);

var CountryStats = function () {
    function CountryStats() {
        _classCallCheck(this, CountryStats);

        this.countries = {};
    }

    _createClass(CountryStats, [{
        key: 'handle',
        value: function handle(data) {
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
    }, {
        key: 'handleBare',
        value: function handleBare(data) {
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
    }, {
        key: 'getAll',
        value: function getAll() {
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
    }]);

    return CountryStats;
}();

var Divisions = function () {
    function Divisions() {
        _classCallCheck(this, Divisions);

        var self = this;
        this.divisions = {};
    }

    _createClass(Divisions, [{
        key: 'create',
        value: function create(id, division) {
            this.divisions[id] = new DivisionStats(division);
            return this.divisions[id];
        }
    }, {
        key: 'get',
        value: function get(id) {
            return this.divisions[id];
        }
    }, {
        key: 'handle',
        value: function handle(data) {
            for (var i in this.divisions) {
                this.divisions[i].handle(data);
            }
        }
    }, {
        key: 'updateDps',
        value: function updateDps(time) {
            for (var i in this.divisions) {
                this.divisions[i].updateDps(time);
            }
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            var object = {};
            for (var i in this.divisions) {
                object[i] = this.divisions[i].toObject();
            }

            return object;
        }
    }]);

    return Divisions;
}();

var DivisionStats = function (_DpsHandler) {
    _inherits(DivisionStats, _DpsHandler);

    function DivisionStats(division) {
        _classCallCheck(this, DivisionStats);

        var _this18 = _possibleConstructorReturn(this, Object.getPrototypeOf(DivisionStats).call(this, 10));

        _this18.division = division;
        _this18.hits = 0;
        _this18.damage = 0;
        _this18.countries = new CountryStats();
        return _this18;
    }

    _createClass(DivisionStats, [{
        key: 'handle',
        value: function handle(data) {
            if (data.division != this.division) {
                return;
            }

            this.addHit(data.msg.damage);
            this.hits++;
            this.damage += data.msg.damage;
            this.countries.handle(data);
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            return {
                'damage': this.damage,
                'id': this.id,
                'dps': this.dps,
                'hits': this.hits,
                'avgHit': Math.round(this.damage / this.hits) | 0,
                'countries': this.countries.countries
            };
        }
    }]);

    return DivisionStats;
}(DpsHandler);

var EventHandler = function () {
    function EventHandler() {
        _classCallCheck(this, EventHandler);

        this.events = {};
    }

    _createClass(EventHandler, [{
        key: 'emit',
        value: function emit(eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].forEach(function (fn) {
                    return fn(data);
                });
            }
        }
    }, {
        key: 'on',
        value: function on(eventName, closure) {
            this.events[eventName] = this.events[eventName] || [];
            this.events[eventName].push(closure);
        }
    }, {
        key: 'off',
        value: function off(eventName, closure) {
            if (this.events[eventName]) {
                for (var i in this.events[eventName]) {
                    var event = this.events[eventName][i];
                    if (event == closure) {
                        this.events[eventName].splice(i, 1);
                    }
                }
            }
        }
    }]);

    return EventHandler;
}();

var HitHistory = function () {
    function HitHistory() {
        var rememberFor = arguments.length <= 0 || arguments[0] === undefined ? 30000 : arguments[0];

        _classCallCheck(this, HitHistory);

        this.rememberFor = rememberFor;
        this.history = {};
    }

    _createClass(HitHistory, [{
        key: 'add',
        value: function add(hit) {
            var time = new Date().getTime();
            this.history[time] = hit;
            this.trimOld(time);
        }
    }, {
        key: 'trimOld',
        value: function trimOld() {
            var time = arguments.length <= 0 || arguments[0] === undefined ? new Date().getTime() : arguments[0];

            for (var i in this.history) {
                if (time - i - this.rememberFor > 0) {
                    delete this.history[i];
                }
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            this.history = {};
        }
    }, {
        key: 'getTotal',
        value: function getTotal() {
            this.trimOld();

            var total = 0;
            for (var i in this.history) {
                total += this.history[i];
            }
            return total;
        }
    }]);

    return HitHistory;
}();

var Layout = function () {
    function Layout(style, headerData) {
        _classCallCheck(this, Layout);

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

    _createClass(Layout, [{
        key: 'update',
        value: function update(feedData) {
            ReactDOM.render(React.createElement(Template, { settings: settings, feedData: feedData, headerData: this.headerData }), document.getElementById('battle_eye_live'));

            ReactDOM.render(React.createElement(MiniMonitor, { settings: settings, feedData: feedData }), document.getElementById('bel-minimonitor'));
        }
    }]);

    return Layout;
}();

var Stats = function (_DpsHandler2) {
    _inherits(Stats, _DpsHandler2);

    function Stats(id) {
        _classCallCheck(this, Stats);

        var _this19 = _possibleConstructorReturn(this, Object.getPrototypeOf(Stats).call(this, 10));

        _this19.countries = new CountryStats();
        _this19.id = id;
        _this19.damage = 0;
        _this19.hits = 0;
        _this19.constructDivisions();
        return _this19;
    }

    _createClass(Stats, [{
        key: 'constructDivisions',
        value: function constructDivisions() {
            this.divisions = new Divisions();

            this.divisions.create('div1', 1);
            this.divisions.create('div2', 2);
            this.divisions.create('div3', 3);
            this.divisions.create('div4', 4);
            this.divisions.create('div11', 11);
        }
    }, {
        key: 'isSide',
        value: function isSide(side) {
            return this.id == side;
        }
    }, {
        key: 'updateDps',
        value: function updateDps(timeData) {
            _get(Object.getPrototypeOf(Stats.prototype), 'updateDps', this).call(this, timeData);
            this.divisions.updateDps(timeData);
        }
    }, {
        key: 'handle',
        value: function handle(data) {
            if (!this.isSide(data.side)) {
                return;
            }

            this.divisions.handle(data);

            this.addHit(data.msg.damage);
            this.hits++;
            this.damage += data.msg.damage;
            this.countries.handle(data);
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            return {
                'damage': this.damage,
                'id': this.id,
                'dps': this.dps,
                'hits': this.hits,
                'avgHit': Math.round(this.damage / this.hits),
                'divisions': this.divisions.toObject(),
                'countries': this.countries.getAll()
            };
        }
    }]);

    return Stats;
}(DpsHandler);

var Storage = function () {
    function Storage() {
        _classCallCheck(this, Storage);

        var self = this;
        if (!self.checkIfStorageAvailable()) {
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
        self.defaults = {};
    }

    _createClass(Storage, [{
        key: 'set',
        value: function set(id, value) {
            var self = this;
            localStorage.setItem('' + self.prepend + id, value);
            // if(settings.enableLogging.value){
            console.log('[BATTLEEYE] ' + self.prepend + id + ' = ' + value);
            // }
        }
    }, {
        key: 'get',
        value: function get(id) {
            var self = this;
            var val = localStorage.getItem('' + self.prepend + id);

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
    }, {
        key: 'has',
        value: function has(field) {
            var self = this;
            if (localStorage.getItem('' + self.prepend + field)) {
                return true;
            }

            return false;
        }
    }, {
        key: 'define',
        value: function define(id, value, group, name, desc) {
            var self = this;

            self.defaults[id] = {
                id: id, name: name, desc: desc, group: group, value: value
            };
        }
    }, {
        key: 'loadSettings',
        value: function loadSettings() {
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
    }, {
        key: 'loadDefaults',
        value: function loadDefaults() {
            var self = this;

            for (var i in self.defaults) {
                self.set(i, self.defaults[i].value);
            }
        }
    }, {
        key: 'getAll',
        value: function getAll() {
            var self = this;

            var object = {};

            for (var i in self.fields) {
                var f = self.fields[i];

                object[i] = { field: f, value: self.get(f.id) };
            }

            return object;
        }
    }, {
        key: 'checkIfStorageAvailable',
        value: function checkIfStorageAvailable() {
            return typeof Storage !== "undefined";
        }
    }]);

    return Storage;
}();

var Stylesheet = function () {
    function Stylesheet() {
        _classCallCheck(this, Stylesheet);

        this.sheet = "";

        this.sheet += '\n            @keyframes bel-pulse-w {\n                0% {\n                    background-color: #27ae60;\n                }\n\n                10% {\n                    background-color: #2ecc71;\n                }\n\n                100% {\n                    background-color: #27ae60;\n                }\n            }\n\n            @keyframes bel-pulse-l {\n                0% {\n                    background-color: #e74c3c;\n                }\n\n                10% {\n                    background-color: #c0392b;\n                }\n\n                100% {\n                    background-color: #e74c3c;\n                }\n            }\n\n            .bel-spinner {\n              width: 50px;\n              height: 20px;\n              text-align: center;\n              font-size: 10px;\n              padding-top: 8px;\n            }\n\n            .bel-spinner > div {\n              background-color: #2980b9;\n              height: 100%;\n              width: 6px;\n              display: inline-block;\n\n              -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;\n              animation: sk-stretchdelay 1.2s infinite ease-in-out;\n            }\n\n            .bel-spinner .rect2 {\n              -webkit-animation-delay: -1.1s;\n              animation-delay: -1.1s;\n              background-color: #3498db;\n            }\n\n            .bel-spinner .rect3 {\n              -webkit-animation-delay: -1.0s;\n              animation-delay: -1.0s;\n              background-color: #2980b9;\n            }\n\n            .bel-spinner .rect4 {\n              -webkit-animation-delay: -0.9s;\n              animation-delay: -0.9s;\n              background-color: #3498db;\n            }\n\n            .bel-spinner .rect5 {\n              -webkit-animation-delay: -0.8s;\n              animation-delay: -0.8s;\n              background-color: #2980b9;\n            }\n\n            @-webkit-keyframes sk-stretchdelay {\n              0%, 40%, 100% { -webkit-transform: scaleY(0.4) }\n              20% { -webkit-transform: scaleY(1.0) }\n            }\n\n            @keyframes sk-stretchdelay {\n              0%, 40%, 100% {\n                transform: scaleY(0.4);\n                -webkit-transform: scaleY(0.4);\n              }  20% {\n                transform: scaleY(1.0);\n                -webkit-transform: scaleY(1.0);\n              }\n            }\n\n            hr.bel{\n                 border: 0; height: 0; border-top: 1px solid rgba(0, 0, 0, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.3);\n            }\n        ';

        this.addCSSRule('.clearfix:after', '\n            content: "";\n            display: table;\n            clear: both;\n        ');

        //General
        //

        this.addCSSRule('#bel-minimonitor', '\n            position: absolute;\n            right: 0;\n        ');

        this.addCSSRule('#bel-country-list', '\n            max-height: 400px;\n            overflow-y: scroll;\n        ');

        this.addCSSRule('.bel-minimonitor', '\n            position: absolute;\n            width: 118px;\n            background-color: rgba(52, 73, 94, 0.7);\n            right: 0;\n            color: #ecf0f1;\n            top: 10px;\n            padding: 2px;\n        ');

        this.addCSSRule('.bel-div', '\n            background-image: url("https://dl.dropboxusercontent.com/u/86379644/divs.png");\n            background-repeat: no-repeat;\n            height: 22px;\n            width: 19px;\n            display: inline-block;\n            vertical-align: middle;\n            margin-right: 5px;\n        ');

        this.addCSSRule('.bel-div1', '\n            background-position: 0 0;\n        ');

        this.addCSSRule('.bel-div2', '\n            background-position: -38px 0;\n        ');

        this.addCSSRule('.bel-div3', '\n            background-position: -19px 0;\n        ');

        this.addCSSRule('.bel-div4', '\n            background-position: -76px 0;\n        ');

        this.addCSSRule('.bel-div11', '\n            background-position: -57px 0;\n        ');

        this.addCSSRule('.bel-tabs', '\n            margin: 5px 0;\n        ');

        this.addCSSRule('.bel-tabs button', '\n            border-radius: 0px;\n        ');

        this.addCSSRule('.bel-tabs button:first-child', '\n            border-radius: 4px 0 0 4px;\n        ');

        this.addCSSRule('.bel-tabs button:last-child', '\n            border-radius: 0 4px 4px 0;\n        ');

        this.addCSSRule('.bel-country', '\n            width: 28px;\n            height: 25px;\n            margin-bottom: -5px;\n            margin-left: 5px;\n            margin-right: 5px;\n            display: inline-block;\n        ');

        this.addCSSRule("#battle_eye_live", '\n            width: 100%;\n            position:relative;\n            float:left;\n            padding:10px;\n            box-sizing: border-box;\n            border-radius:0px 0px 20px 20px;\n            background-color: #ffffff;\n            color: #34495e;\n            font-size:14px;\n            font-family: "Lato",Helvetica,Arial,sans-serif;\n            text-align: center;\n            line-height: 1.7;\n        ');

        this.addCSSRule('.color-silver', 'color: #bdc3c7');

        this.addCSSRule('.pull-left', 'float:left;');
        this.addCSSRule('.pull-right', 'float:right;');

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before', '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
        this.addCSSRule(".bel-value", '\n            display: inline-block;\n            line-height: 1.2;\n            background-color: #ecf0f1;\n            padding: 2px 10px;\n            border-radius: 4px;\n            margin: 0 2px 2px 2px;\n        ');

        this.addCSSRule(".bel-value-hl-w", '\n            color: #ffffff;\n            animation: bel-pulse-w 3s infinite;\n            background-color: #27ae60;\n        ');

        this.addCSSRule(".bel-value-hl-l", '\n            color: #ffffff;\n            animation: bel-pulse-l 3s infinite;\n            background-color: #e74c3c;\n        ');

        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-version-outdated', 'background-color: #e74c3c;');
        this.addCSSRule('.bel-title', 'background-color: #ecf0f1;margin-bottom:2px;margin-top:5px;');
        this.addCSSRule('.bel-titles', '\n            font-weight: 700;\n        ');
        this.addCSSRule('.bel-text-tiny', 'font-size:10px;');
        this.addCSSRule('.bel-highlight-title', '\n            background-color: #34495e;\n            color: #fff;\n        ');
        this.addCSSRule('.bel-highlight', '\n            color: #34495e;\n        ');
        //Grids
        this.addCSSRule('.bel-grid:after', 'content: "";display: table;clear: both;');
        this.addCSSRule("[class*='bel-col-']", 'float: left;');
        this.addCSSRule('.bel-col-1-1', 'width: 100%;');
        this.addCSSRule('.bel-col-1-2', 'width: 50%;');
        this.addCSSRule('.bel-col-1-4', 'width: 25%;');
        this.addCSSRule('.bel-col-1-3', 'width: 33.3333%;');
        this.addCSSRule('.bel-col-1-8', 'width: 12.5%;');
        //Lists
        this.addCSSRule('.list-unstyled', 'list-style: outside none none;padding-left: 0;');
        this.addCSSRule('.list-inline li', 'display: inline-block;');

        //Settings
        this.addCSSRule('.bel-settings', '\n            z-index: 100;\n            position: absolute;\n            width: 100%;\n            opacity: 0.95;\n            top: 0;\n            left: 0;\n            background-color: #ffffff;\n            padding: 14px;\n            text-align: left;\n            overflow-y: scroll;\n            height: 100%;\n        ');

        this.addCSSRule('.bel-settings-group', '\n            background-color: #34495e;\n            color: #ecf0f1;\n            padding-left: 10px;\n        ');

        this.addCSSRule('.bel-settings-container', '\n            padding-left: 5px;\n        ');

        this.addCSSRule('.bel-settings-field', '\n            margin-right: 3px;\n        ');

        this.addCSSRule('.bel-field-description', '\n            font-size: 12px;\n            color: #95a5a6;\n        ');

        this.addCSSRule('.bel-checkbox', '\n            padding: 5px 3px;\n            border-bottom: 1px solid #ecf0f1;\n        ');

        this.addCSSRule('.bel-hidden', '\n            display: none;\n        ');

        //Button
        this.addCSSRule('.bel-btn', '\n            -webkit-user-select: none;\n            -moz-user-select: none;\n            -ms-user-select: none;\n            user-select: none;\n            background-image: none;\n            border: none !important;\n            cursor: pointer;\n            font-size: 13px;\n            font-weight: normal;\n            margin-bottom: 0;\n            text-align: center;\n            border-radius: 4px;\n            padding: 3px 8px;\n            font-family: "Lato",Helvetica,Arial,sans-serif;\n            transition: background-color 0.5s;\n        ');

        this.addCSSRule('a.bel-btn', '\n            padding: 4px 8px;\n        ');

        this.addCSSRule('.bel-btn-default', '\n            background-color: #1abc9c;\n            color: #ffffff;\n        ');

        this.addCSSRule('.bel-btn-default:hover', '\n            background-color: #16a085;\n        ');

        this.addCSSRule('.bel-btn-grey', '\n            background-color: #ecf0f1;\n            color: #34495e;\n        ');

        this.addCSSRule('.bel-btn-grey:hover', '\n            background-color: #CED3D6;\n        ');

        this.addCSSRule('.bel-btn-danger', '\n            background-color: #e74c3c;\n            color: #ffffff;\n        ');

        this.addCSSRule('.bel-btn-danger:hover', '\n            background-color: #c0392b;\n        ');

        this.addCSSRule('.bel-btn-inverse', '\n            background-color: #2c3e50;\n            color: #ffffff;\n        ');

        this.addCSSRule('.bel-btn-inverse:hover', '\n            background-color: #34495e;\n        ');

        this.addCSSRule('.bel-btn-info', '\n            background-color: #2980b9;\n            color: #ffffff;\n        ');

        this.addCSSRule('.bel-btn-info:hover', '\n            background-color: #3498db;\n        ');

        //Header menu
        this.addCSSRule('.bel-header-menu', 'margin-bottom: 10px;');
        this.addCSSRule('.bel-header-menu li', 'padding: 0 5px;');

        //Team colors
        this.addCSSRule('.bel-teama', 'background-color: #27ae60;');
        this.addCSSRule('.bel-teamb', 'background-color: #c0392b;');
        this.addCSSRule('.bel-teama-color', 'color: #27ae60;');
        this.addCSSRule('.bel-teamb-color', 'color: #c0392b;');

        //Progress bars
        this.addCSSRule('.bel-progress', '\n            height: 4px;\n            position: relative;\n            background: #ebedef none repeat scroll 0 0;\n            border-radius: 32px;\n            box-shadow: none;\n            margin-top: 2px;\n            overflow: hidden;\n        ');

        this.addCSSRule('.bel-progress-bar', '\n            box-shadow: none;\n            line-height: 12px;\n            color: #fff;\n            float: left;\n            font-size: 12px;\n            height: 100%;\n            line-height: 20px;\n            text-align: center;\n            transition: width 0.6s ease 0s;\n            width: 0;\n        ');

        this.addCSSRule('.bel-progress-center-marker', '\n            border-right: 3px solid #ffffff;\n            height: 10px;\n            left: 50%;\n            margin-left: -2px;\n            opacity: 0.6;\n            position: absolute;\n        ');
        //Other
        this.addCSSRule('.bel-hr', '\n            -moz-border-bottom-colors: none;\n            -moz-border-left-colors: none;\n            -moz-border-right-colors: none;\n            -moz-border-top-colors: none;\n            border-color: #eee -moz-use-text-color -moz-use-text-color;\n            border-image: none;\n            border-style: solid none none;\n            border-width: 1px 0 0;\n            margin-bottom: 20px;\n        ');
    }

    _createClass(Stylesheet, [{
        key: 'addCSSRule',
        value: function addCSSRule(selector, rules) {
            this.sheet += selector + "{" + rules + "}";
        }
    }, {
        key: 'load',
        value: function load() {
            $j('head').append('<style>' + this.sheet + '</style>');
        }
    }]);

    return Stylesheet;
}();

var Utils = function () {
    function Utils() {
        _classCallCheck(this, Utils);
    }

    _createClass(Utils, [{
        key: 'uid',
        value: function uid() {
            return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        }
    }]);

    return Utils;
}();

var UTILS = new Utils();

var settings = {};
var contributors = [];
var modules = null;
var storage = null;
var battleEyeLive = {
    init: function init() {
        var self = this;
        console.log('[BATTLEEYE] Initialisation');

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
        storage.define('showDamageBar', true, 'Bars', "Show Damage bar");
        storage.define('largerBars', false, 'Bars', "Larger bars");

        storage.define('enableLogging', false, 'Other', "Enable logging to console");

        modules = new ModuleLoader(self.settingsStorage);
        modules.load(new AutoShooter());
        modules.load(new Other());

        //Loading settings
        storage.loadSettings();
        settings = storage.getAll();
        //

        self.events = new EventHandler();
        self.teamA = new Stats(SERVER_DATA.leftBattleId);
        self.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        self.teamB = new Stats(SERVER_DATA.rightBattleId);
        self.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version
        });

        self.layout.update(self.getTeamStats());

        pomelo.disconnect = function () {};

        self.checkForUpdates();

        self.loadBattleStats();

        $j('.bel-settings-field').on('change', function (event) {
            var input = event.target;

            if (input.type == "checkbox") {
                var value = input.checked;
            } else {
                var value = input.value;
            }
            self.settingsStorage.set(input.name, value);
            settings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            $j("label[for=\"" + targetAtt + "\"]").notify("Saved", { position: "right middle", className: "success" });
        });

        self.runTicker();
        self.handleEvents();
        modules.run();
    },

    loadBattleStats: function loadBattleStats() {
        var self = this;
        if (settings.gatherBattleStats.value) {
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
                        var dmg = Number(hit.value.replace(/[,\.]/g, ''));
                        leftDmg += dmg;

                        self.teamA.countries.handleBare({
                            damage: dmg,
                            permalink: hit.country_permalink
                        });
                    }

                    for (var i in rightDamage['div' + div]) {
                        var hit = rightDamage['div' + div][i];
                        var dmg = Number(hit.value.replace(/[,\.]/g, ''));
                        rightDmg += dmg;

                        self.teamB.countries.handleBare({
                            damage: dmg,
                            permalink: hit.country_permalink
                        });
                    }

                    for (var i in leftKills['div' + div]) {
                        var hit = leftKills['div' + div][i];
                        leftKl += Number(hit.value.replace(/[,\.]/g, ''));
                    }

                    for (var i in rightKills['div' + div]) {
                        var hit = rightKills['div' + div][i];
                        rightKl += Number(hit.value.replace(/[,\.]/g, ''));
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
        }
    },

    resetSettings: function resetSettings() {
        storage.loadDefaults();
        settings = storage.getAll();
    },

    checkForUpdates: function checkForUpdates() {
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
        });
    },

    displayContributors: function displayContributors() {
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
                } else if ($j('li[data-citizen-id="' + cId + '"] .player_name').length > 0) {
                    $j('li[data-citizen-id="' + cId + '"] .player_name').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                }
            }
        }
    },

    getTeamStats: function getTeamStats() {
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleStats: function getBattleStats(callback) {
        var self = this;
        var attacker = SERVER_DATA.leftBattleId;
        var defender = SERVER_DATA.rightBattleId;

        var attackerData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            defenderData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            attackerKillData = { div1: [], div2: [], div3: [], div4: [], div11: [] },
            defenderKillData = { div1: [], div2: [], div3: [], div4: [], div11: [] };

        var request = function request(div, pageLeft, pageRight, cb, type) {
            if (type == undefined) {
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
                zoneId: 1
            }, function (data) {
                cb(data);
            });
        };

        var damageHandler = function damageHandler(div, cb) {
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
                        console.log('[BATTLEEYE] Finished damage page ' + page + "/" + maxPage);
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

        var killsHandler = function killsHandler(div, cb) {
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function (whileCb) {
                request(div, page, page, function (data) {

                    for (var i in data[attacker].fighterData) {
                        attackerKillData['div' + div].push(data[attacker].fighterData[i]);
                    }

                    for (var i in data[defender].fighterData) {
                        defenderKillData['div' + div].push(data[defender].fighterData[i]);
                    }

                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    if (settings.enableLogging.value) {
                        console.log('[BATTLEEYE] Finished kill page ' + page + "/" + maxPage);
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
            });
        });
    },

    runTicker: function runTicker() {
        var self = this;
        var second = 0;

        var ticker = function ticker() {
            second++;
            var timeData = {
                'second': second,
                'time': new Date().getTime()
            };
            self.events.emit('tick', timeData);
        };

        self.interval = setInterval(ticker, 1000);
    },

    handleEvents: function handleEvents() {
        var self = this;
        self.events.on('tick', function (timeData) {
            self.teamA.updateDps(timeData);
            self.teamB.updateDps(timeData);
            self.layout.update(self.getTeamStats());
        });
    },

    overridePomelo: function overridePomelo() {
        var self = this;

        var handler = function handler(data) {
            if (currentPlayerDisplayRateValue !== "Maximum") {
                if (battleFX.checkPlayerDisplayRate(currentPlayerDisplayRateValue)) {
                    battleFX.populatePlayerData(data);
                }
            } else {
                battleFX.populatePlayerData(data);
            }

            self.displayContributors();
            self.handle(data);
        };

        pomelo.on('onMessage', handler);
    },
    handle: function handle(data) {
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