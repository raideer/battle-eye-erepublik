'use strict';

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// ==UserScript==
// @name        Battle Eye Live
// @namespace   battle-eye-live
// @author      Industrials / Raideer
// @homepage    https://github.com/raideer
// @description LIVE battlefield statistics
// @include     http*://www.erepublik.com/*/military/battlefield-new/*
// @version     1.1.7-a
// @require     https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js
// @require     https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/modals.min.js
// @require     https://cdnjs.cloudflare.com/ajax/libs/async/2.0.1/async.min.js
// @resource    modals https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/modals.min.css
// @run-at      document-idle
// @grant       unsafeWindow
// @grant       GM_info
// @grant       GM_addStyle
// @grant       GM_getResourceText
// @grant       GM_xmlhttpRequest
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

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DivisionStats).call(this, 10));

        _this.division = division;
        _this.hits = 0;
        _this.damage = 0;
        return _this;
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
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            return {
                'damage': this.damage,
                'id': this.id,
                'dps': this.dps,
                'hits': this.hits,
                'avgHit': Math.round(this.damage / this.hits)
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
    function Layout(style, headerData, settings) {
        _classCallCheck(this, Layout);

        var self = this;
        self.settings = settings;

        Handlebars.registerHelper('percentage', function (a, b, options) {
            var aPerc = 0;
            var bPerc = 0;

            if (a + b !== 0) {
                aPerc = Math.round(a * 100 / (a + b) * 10) / 10;
                bPerc = Math.round(b * 100 / (a + b) * 10) / 10;
            }

            return options.fn({ a: aPerc, b: bPerc });
        });

        Handlebars.registerHelper('number', function (number) {
            return parseFloat(number).toLocaleString();
        });

        Handlebars.registerHelper('forEachDiv', function (left, right, options) {
            var divs = ['air', 'div1', 'div2', 'div3', 'div4'];
            var divInfo = [[11, 'Air'], [1, 'Division 1'], [2, 'Division 2'], [3, 'Division 3'], [4, 'Division 4']];

            var showAverage = self.settings.all.showAverageDamage.value;
            var showKills = self.settings.all.showKills.value;
            var showDpsBar = self.settings.all.showDpsBar.value;
            var showDamageBar = self.settings.all.showDamageBar.value;
            var hideOtherDivs = self.settings.all.hideOtherDivs.value;
            var highlightDivision = settings.all.highlightDivision.value;

            var str = '';
            for (var i in divs) {
                var div = divs[i];
                var highlight = false;

                if (hideOtherDivs) {
                    if (divInfo[i][0] != unsafeWindow.SERVER_DATA.division) {
                        continue;
                    }
                }

                if (highlightDivision) {
                    if (divInfo[i][0] == unsafeWindow.SERVER_DATA.division) {
                        highlight = true;
                    }
                }

                str += options.fn({ left: left.divisions[div],
                    right: right.divisions[div],
                    div: divInfo[i][1],
                    highlight: highlight,
                    showAverage: showAverage,
                    showKills: showKills,
                    showDpsBar: showDpsBar, showDamageBar: showDamageBar });
            }

            return str;
        });

        self.feedTemplate = Handlebars.compile(self.compileFeed());
        self.headerTemplate = Handlebars.compile(self.compileHeader());
        self.settingsTemplate = Handlebars.compile(self.createSettingsModal());

        var battleEye = document.createElement('div');
        battleEye.setAttribute('id', 'battle_eye_live');
        var header = document.createElement('div');
        header.setAttribute('id', 'battle_eye_header');
        var liveFeed = document.createElement('div');
        liveFeed.setAttribute('id', 'battle_eye_feed');

        battleEye.appendChild(header);
        battleEye.appendChild(liveFeed);
        document.getElementById('content').appendChild(battleEye);

        style.load();
        document.querySelector('#battle_eye_header').innerHTML = self.headerTemplate(headerData);
        document.querySelector('#battle_eye_live').innerHTML += self.settingsTemplate(settings);

        document.querySelector('#battle-eye-settings').addEventListener("click", function () {
            document.querySelector('#bel-settings-modal').classList.toggle('bel-hidden');
        });

        document.querySelector('#bel-close-modal').addEventListener("click", function () {
            document.querySelector('#bel-settings-modal').classList.add('bel-hidden');
        });
    }

    _createClass(Layout, [{
        key: 'update',
        value: function update(data) {
            var self = this;
            if (data === null) {
                data = this.lastData;
            } else {
                this.lastData = data;
            }

            var html = this.feedTemplate(data);
            document.getElementById('battle_eye_feed').innerHTML = html;
        }
    }, {
        key: 'createSettingsModal',
        value: function createSettingsModal() {
            return '\n            <div id="bel-settings-modal" class="bel-settings bel-hidden">\n                <div class="bel-grid">\n                    <button id="bel-close-modal" class="bel-btn bel-btn-default" style="margin-top: -3px;float:right;">Close</button>\n                </div>\n                <div class="bel-grid">\n                        {{#each all}}\n                            <div class="bel-checkbox bel-col-1-2" style="padding: 3px;">\n                                <input type="checkbox" class="bel-settings-field"\n                                {{#if value}}\n                                    checked\n                                {{/if}}\n                                id="{{field.field}}" name="{{field.field}}">\n                                <label for="{{field.field}}">\n                                    {{field.name}}\n                                </label>\n                                <div class="bel-field-description">\n                                    {{field.desc}}\n                                </div>\n                            </div>\n                        {{/each}}\n                </div>\n            </div>\n        ';
        }
    }, {
        key: 'compileHeader',
        value: function compileHeader() {
            var html = '\n            <ul class="list-unstyled list-inline text-left bel-header-menu" style="padding-bottom:6px; border-bottom: 1px solid #ecf0f1;">\n                <li>\n                    <span class="bel-version">{{version}}</span> BATTLE EYE LIVE\n                </li>\n\n                <li style="float:right;">\n                    <button id="battle-eye-settings" class="bel-btn bel-btn-default" style="margin-top: -3px;">Settings</button>\n                </li>\n            </ul>\n\n            <div class="bel-grid">\n                <div class="bel-col-1-2 text-left" style="color:#27ae60;font-weight:700;font-size:1.3em;">\n                    {{teamAName}}\n                </div>\n                <div class="bel-col-1-2 text-right" style="color:#c0392b;font-weight:700;font-size:1.3em;">\n                    {{teamBName}}\n                </div>\n            </div>\n        ';

            return html;
        }
    }, {
        key: 'compileFeed',
        value: function compileFeed() {
            var html = '\n            <div class="bel-grid">\n                {{#forEachDiv left right}}\n                    <div class="bel-col-1-1 text-center bel-title\n                    {{#if highlight}}\n                        bel-highlight-title\n                    {{/if}}\n                    ">\n                        {{div}}\n                    </div>\n                    <div class="bel-col-1-3 text-right">\n                        <ul class="list-unstyled">\n                            <li>\n                                {{#if showKills}}\n                                    <span class="bel-value">{{number left.hits}} kills</span>\n                                {{/if}}\n                                <span class="bel-value">{{number left.damage}}</span>\n                            </li>\n\n                            {{#if showAverage}}\n                                <li><span class="bel-value">{{number left.avgHit}}</span></li>\n                            {{/if}}\n\n                            <li><span class="bel-value">{{number left.dps}}</span></li>\n                        </ul>\n                    </div>\n                    <div class="bel-col-1-3 text-center">\n                        <ul class="list-unstyled\n                        {{#if highlight}}\n                            bel-highlight\n                        {{/if}}\n                        " style="font-weight:700;">\n                            <li>Total Damage</li>\n                            {{#if showAverage}}\n                                <li>Average Damage</li>\n                            {{/if}}\n                            <li>DPS</li>\n                        </ul>\n                    </div>\n                    <div class="bel-col-1-3 text-left">\n                        <ul class="list-unstyled">\n                            <li>\n                                <span class="bel-value">{{number right.damage}}</span>\n                                {{#if showKills}}\n                                    <span class="bel-value">{{number right.hits}} kills</span>\n                                {{/if}}\n                            </li>\n                            {{#if showAverage}}\n                                <li><span class="bel-value">{{number right.avgHit}}</span></li>\n                            {{/if}}\n                            <li><span class="bel-value">{{number right.dps}}</span></li>\n                        </ul>\n                    </div>\n                    <div class="bel-col-1-1">\n                        {{#if showDamageBar}}\n                            <div class="bel-progress">\n                                <div class="bel-progress-center-marker"></div>\n                                {{#percentage left.damage right.damage}}\n                                    <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>\n                                    <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>\n                                {{/percentage}}\n                            </div>\n                        {{/if}}\n                        {{#if showDpsBar}}\n                            <div class="bel-progress">\n                                <div class="bel-progress-center-marker"></div>\n                                {{#percentage left.dps right.dps}}\n                                    <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>\n                                    <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>\n                                {{/percentage}}\n\n                            </div>\n                        {{/if}}\n                    </div>\n                {{/forEachDiv}}\n            </div>\n        ';
            return html;
        }
    }]);

    return Layout;
}();

var Settings = function () {
    function Settings() {
        _classCallCheck(this, Settings);

        var self = this;
        if (!self.checkIfStorageAvailable()) {
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
    }

    _createClass(Settings, [{
        key: 'set',
        value: function set(field, value) {
            var self = this;
            localStorage.setItem('' + self.prepend + field, value);
            console.log('' + self.prepend + field + ' = ' + value);
        }
    }, {
        key: 'get',
        value: function get(field) {
            var self = this;
            var val = localStorage.getItem('' + self.prepend + field);

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
        value: function define(field, value, name, desc) {
            var self = this;

            if (self.fields[field] === undefined) {
                self.fields[field] = {
                    field: field, name: name, desc: desc
                };
            }

            if (!self.has(field)) {
                self.set(field, value);
            }
        }
    }, {
        key: 'getAll',
        value: function getAll() {
            var self = this;

            var object = {};

            for (var i in self.fields) {
                var f = self.fields[i];
                object[i] = { field: f, value: self.get(f.field) };
            }

            return object;
        }
    }, {
        key: 'checkIfStorageAvailable',
        value: function checkIfStorageAvailable() {
            return typeof Storage !== "undefined";
        }
    }]);

    return Settings;
}();

var Stats = function (_DpsHandler2) {
    _inherits(Stats, _DpsHandler2);

    function Stats(id) {
        _classCallCheck(this, Stats);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Stats).call(this, 10));

        _this2.id = id;
        _this2.damage = 0;
        _this2.hits = 0;
        _this2.constructDivisions();
        return _this2;
    }

    _createClass(Stats, [{
        key: 'constructDivisions',
        value: function constructDivisions() {
            this.divisions = new Divisions();

            this.divisions.create('div1', 1);
            this.divisions.create('div2', 2);
            this.divisions.create('div3', 3);
            this.divisions.create('div4', 4);
            this.divisions.create('air', 11);
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
                'divisions': this.divisions.toObject()
            };
        }
    }]);

    return Stats;
}(DpsHandler);

var Stylesheet = function () {
    function Stylesheet() {
        _classCallCheck(this, Stylesheet);

        this.sheet = "";

        //General
        this.addCSSRule("#battle_eye_live", '\n            width: 100%;\n            position:relative;\n            float:left;\n            padding:10px;\n            box-sizing: border-box;\n            border-radius:0px 0px 20px 20px;\n            background-color: #ffffff;\n            color: #34495e;\n            font-size:14px;\n            font-family: "Lato",\n            Helvetica,Arial,sans-serif;\n            text-align: center;\n            line-height: 1.7;\n        ');

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before', '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
        this.addCSSRule(".bel-value", "background-color: #ecf0f1;padding: 2px 10px;border-radius: 4px;margin: 0 2px;");
        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-title', 'background-color: #ecf0f1;margin-bottom:2px;margin-top:5px;');
        this.addCSSRule('.bel-highlight-title', '\n            background-color: #9b59b6;\n            color: #fff;\n        ');
        this.addCSSRule('.bel-highlight', '\n            color: #8e44ad;\n        ');
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
        this.addCSSRule('.bel-settings', '\n            z-index: 100;\n            position: absolute;\n            width: 100%;\n            height: 100%;\n            opacity: 0.95;\n            top: 0;\n            left: 0;\n            background-color: #ffffff;\n            padding: 14px;\n            text-align: left;\n            overflow-y: scroll;\n        ');

        this.addCSSRule('.bel-field-description', '\n            font-size: 12px;\n            color: #95a5a6;\n        ');

        this.addCSSRule('.bel-checkbox', '\n            padding-bottom: 5px;\n            padding-top: 5px;\n            border-bottom: 1px solid #ecf0f1;\n        ');

        this.addCSSRule('.bel-hidden', '\n            display: none;\n        ');

        //Button
        this.addCSSRule('.bel-btn', '\n            -moz-user-select: none;\n            background-image: none;\n            border: medium none;\n            cursor: pointer;\n            font-size: 14px;\n            font-weight: normal;\n            margin-bottom: 0;\n            text-align: center;\n            border-radius: 4px;\n            font-size: 12px;\n            padding: 3px 8px;\n        ');

        this.addCSSRule('.bel-btn-default', '\n            background-color: #1abc9c;\n            color: #ffffff;\n        ');

        this.addCSSRule('.bel-btn-default:hover', '\n            background-color: #16a085;\n            color: #ffffff;\n        ');

        //Header menu
        this.addCSSRule('.bel-header-menu', 'margin-bottom: 10px;');
        this.addCSSRule('.bel-header-menu li', 'padding: 0 5px;');
        //Progress bars
        this.addCSSRule('.bel-progress', '\n            height: 4px;\n            position: relative;\n            background: #ebedef none repeat scroll 0 0;\n            border-radius: 32px;\n            box-shadow: none;\n            margin-top: 2px;\n            overflow: hidden;\n        ');

        this.addCSSRule('.bel-teama', 'background-color: #27ae60;');
        this.addCSSRule('.bel-teamb', 'background-color: #c0392b;');

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
            GM_addStyle(GM_getResourceText('modals'));
            GM_addStyle(this.sheet);
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

var battleEyeLive = {
    init: function init() {
        var self = this;
        console.log('Battle Eye INIT');
        self.window = unsafeWindow;

        var storage = self.settingsStorage = new Settings();
        if (storage === false) {
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        storage.define('hideOtherDivs', false, "Hide other divisions");
        storage.define('reduceLoad', false, "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance");
        storage.define('highlightDivision', true, "Highlight current division");
        storage.define('showAverageDamage', false, "Show average damage dealt");
        storage.define('showKills', true, "Show kills done by each division");
        storage.define('showDpsBar', true, "Show DPS bar");
        storage.define('showDamageBar', false, "Show Damage bar");

        self.settings = storage.getAll();

        self.events = new EventHandler();
        self.teamA = new Stats(self.window.SERVER_DATA.leftBattleId);
        self.teamAName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.leftBattleId];
        self.teamB = new Stats(self.window.SERVER_DATA.rightBattleId);
        self.teamBName = this.window.SERVER_DATA.countries[self.window.SERVER_DATA.rightBattleId];

        self.getBattleDamageStats(function (left, right) {
            for (var div = 1; div < 4; div++) {
                var leftDmg = 0;
                var rightDmg = 0;

                for (var i in left['div' + div]) {
                    var hit = left['div' + div][i];
                    leftDmg += Number(hit.value.replace(/[,\.]/g, ''));
                }

                for (var i in right['div' + div]) {
                    var hit = right['div' + div][i];
                    rightDmg += Number(hit.value.replace(/[,\.]/g, ''));
                }

                console.log(leftDmg);
                console.log(self.teamA.divisions.get('div' + div));

                self.teamA.divisions.get('div' + div).damage += leftDmg;
                self.teamB.divisions.get('div' + div).damage += rightDmg;
            }
        });

        self.overridePomelo();

        self.layout = new Layout(new Stylesheet(), {
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version
        }, { 'all': self.settings });

        [].forEach.call(document.querySelectorAll('.bel-settings-field'), function (div) {
            div.addEventListener('change', function (event) {
                var input = event.target;
                var value = input.checked;
                self.settingsStorage.set(input.name, input.checked);
                self.settings[input.name].value = input.checked;
            });
        });

        self.runTicker();
        self.handleEvents();
    },

    getTeamStats: function getTeamStats() {
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
    },

    getBattleDamageStats: function getBattleDamageStats(callback) {
        var self = this;
        var token = document.querySelector('input[name="_token"]').value;
        var battleId = self.window.SERVER_DATA.battleId;
        var division = self.window.SERVER_DATA.division;
        var attacker = self.window.SERVER_DATA.leftBattleId;
        var defender = self.window.SERVER_DATA.rightBattleId;
        var round = Number(document.querySelector('#round_number').innerHTML.match(/\d/)[0]);

        var attackerData = {
            div1: [], div2: [], div3: [], div4: []
        };
        var defenderData = {
            div1: [], div2: [], div3: [], div4: []
        };

        var request = function request(div, pageLeft, pageRight, cb) {
            GM_xmlhttpRequest({
                method: "POST",
                url: "http://www.erepublik.com/en/military/battle-console",
                data: '_token=' + token + '&action=battleStatistics&battleId=' + battleId + '&division=' + div + '&leftPage=' + pageLeft + '&rightPage=' + pageRight + '&round=' + round + '&type=damage&zoneId=1',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                onload: function onload(response) {
                    var data = JSON.parse(response.responseText);
                    console.log(data);
                    cb(data);
                }
            });
        };

        var handler = function handler(div, cb) {
            var page = 1;
            var maxPage = 1;

            async.doWhilst(function (whileCb) {
                request(div, page, page, function (data) {
                    console.log(page);
                    saveFighterData(data, div);
                    maxPage = Math.max(data[attacker].pages, data[defender].pages);
                    page++;

                    whileCb();
                });
            }, function () {
                return page < maxPage;
            }, function () {
                // console.log('do while ended')
                cb();
            });
        };

        var saveFighterData = function saveFighterData(data, div) {
            // console.log('saving data');
            for (var i in data[attacker].fighterData) {
                attackerData['div' + div].push(data[attacker].fighterData[i]);
            }

            for (var i in data[defender].fighterData) {
                defenderData['div' + div].push(data[defender].fighterData[i]);
            }
        };

        async.each([1, 2, 3, 4], handler.bind(self), function () {
            if (typeof callback == 'function') {
                callback(attackerData, defenderData);
            }
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
            if (self.window.currentPlayerDisplayRateValue !== "Maximum") {
                if (self.window.battleFX.checkPlayerDisplayRate(self.window.currentPlayerDisplayRateValue)) {
                    self.window.battleFX.populatePlayerData(data);
                }
            } else {
                self.window.battleFX.populatePlayerData(data);
            }

            self.handle(data);
        };

        self.window.pomelo.on('onMessage', exportFunction(handler, unsafeWindow));
    },
    handle: function handle(data) {
        var self = this;

        // console.log(data);

        self.teamA.handle(data);
        self.teamB.handle(data);
        if (!self.settings.reduceLoad.value) {
            self.layout.update(self.getTeamStats());
        }
    }
};

setTimeout(function () {
    battleEyeLive.init();
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
}, 2000);