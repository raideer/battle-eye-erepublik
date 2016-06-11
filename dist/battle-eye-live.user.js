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
// @version     1.0.1-a
// @require     https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.5/handlebars.min.js
// @run-at      document-idle
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

        this.div1 = new DivisionStats(1);
        this.div2 = new DivisionStats(2);
        this.div3 = new DivisionStats(3);
        this.div4 = new DivisionStats(4);
    }

    _createClass(Divisions, [{
        key: 'handle',
        value: function handle(data) {
            this.div1.handle(data);
            this.div2.handle(data);
            this.div3.handle(data);
            this.div4.handle(data);
        }
    }, {
        key: 'updateDps',
        value: function updateDps(time) {
            this.div1.updateDps(time);
            this.div2.updateDps(time);
            this.div3.updateDps(time);
            this.div4.updateDps(time);
        }
    }, {
        key: 'toObject',
        value: function toObject() {
            return {
                'div1': this.div1.toObject(),
                'div2': this.div2.toObject(),
                'div3': this.div3.toObject(),
                'div4': this.div4.toObject()
            };
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
                'damage': this.damage.toLocaleString(),
                'id': this.id,
                'dps': this.dps.toLocaleString(),
                'avgHit': Math.round(this.damage / this.hits).toLocaleString()
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
    function Layout() {
        _classCallCheck(this, Layout);

        this.template = Handlebars.compile(this.createLayout());
        var el = document.createElement('div');
        el.setAttribute('id', 'battle_eye_live');
        el.style.position = "relative";
        el.style.float = "left";
        el.style.padding = "10px";
        el.style.width = "100%";
        document.getElementById('content').appendChild(el);
    }

    _createClass(Layout, [{
        key: 'update',
        value: function update(data) {
            if (data == null) {
                data = this.lastData;
            } else {
                this.lastData = data;
            }

            var html = this.template(data);
            document.getElementById('battle_eye_live').innerHTML = html;
        }
    }, {
        key: 'createLayout',
        value: function createLayout() {
            var l = '';
            l += '<table style="width: 100%;table-layout: fixed;">';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.damage}}</td>';
            l += '<td style="text-align: center;">Total damage</td>';
            l += '<td style="text-align: left;">{{right.damage}}</td>';
            l += '</tr>';
            l += '<tr style="color:#9f1212;">';
            l += '<td style="text-align: right;">{{left.dps}}</td>';
            l += '<td style="text-align: center;"><i>Damage Per Second</i> (DPS)</td>';
            l += '<td style="text-align: left;">{{right.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.avgHit}}</td>';
            l += '<td style="text-align: center;">Average hit</td>';
            l += '<td style="text-align: left;">{{right.avgHit}}</td>';
            l += '</tr>';
            l += '<tr></tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div4.damage}}</td>';
            l += '<td style="text-align: center;">Total D4 damage</td>';
            l += '<td style="text-align: left;">{{right.divisions.div4.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div3.damage}}</td>';
            l += '<td style="text-align: center;">Total D3 damage</td>';
            l += '<td style="text-align: left;">{{right.divisions.div3.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div2.damage}}</td>';
            l += '<td style="text-align: center;">Total D2 damage</td>';
            l += '<td style="text-align: left;">{{right.divisions.div2.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div1.damage}}</td>';
            l += '<td style="text-align: center;">Total D1 damage</td>';
            l += '<td style="text-align: left;">{{right.divisions.div1.damage}}</td>';
            l += '</tr>';
            l += '<tr style="color:#6a34d7;">';
            l += '<td style="text-align: right;">{{left.divisions.div4.dps}}</td>';
            l += '<td style="text-align: center;">D4 DPS</td>';
            l += '<td style="text-align: left;">{{right.divisions.div4.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div3.dps}}</td>';
            l += '<td style="text-align: center;">D3 DPS</td>';
            l += '<td style="text-align: left;">{{right.divisions.div3.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div2.dps}}</td>';
            l += '<td style="text-align: center;">D2 DPS</td>';
            l += '<td style="text-align: left;">{{right.divisions.div2.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
            l += '<td style="text-align: right;">{{left.divisions.div1.dps}}</td>';
            l += '<td style="text-align: center;">D1 DPS</td>';
            l += '<td style="text-align: left;">{{right.divisions.div1.dps}}</td>';
            l += '</tr>';
            l += '</table>';
            return l;
        }
    }]);

    return Layout;
}();

var Stats = function (_DpsHandler2) {
    _inherits(Stats, _DpsHandler2);

    function Stats(id) {
        _classCallCheck(this, Stats);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(Stats).call(this, 10));

        _this2.id = id;
        _this2.damage = 0;
        _this2.hits = 0;
        _this2.dps = 0;
        _this2.divisions = new Divisions();
        return _this2;
    }

    _createClass(Stats, [{
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
                'damage': this.damage.toLocaleString(),
                'id': this.id,
                'dps': this.dps.toLocaleString(),
                'avgHit': Math.round(this.damage / this.hits).toLocaleString(),
                'divisions': this.divisions.toObject()
            };
        }
    }]);

    return Stats;
}(DpsHandler);

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
        console.log('Battle Eye INIT');
        if (GM_info.scriptHandler == "Tampermonkey") {
            this.window = unsafeWindow;
        } else {
            this.window = window;
        }

        this.events = new EventHandler();
        this.teamA = new Stats(this.window.leftBattleId);
        this.teamB = new Stats(this.window.rightBattleId);
        this.overridePomelo();
        this.layout = new Layout();
        this.runTicker();

        this.handleEvents();
    },
    getTeamStats: function getTeamStats() {
        return {
            'left': this.teamA.toObject(),
            'right': this.teamB.toObject()
        };
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
        self.window.pomelo.on('onMessage', function (data) {
            if (self.window.currentPlayerDisplayRateValue !== "Maximum") {
                if (self.window.battleFX.checkPlayerDisplayRate(self.window.currentPlayerDisplayRateValue)) {
                    self.window.battleFX.populatePlayerData(data);
                };
            } else {
                self.window.battleFX.populatePlayerData(data);
            }

            self.handle(data);
        });
    },
    handle: function handle(data) {
        this.teamA.handle(data);
        this.teamB.handle(data);
        this.layout.update(this.getTeamStats());
    }
};

setTimeout(function () {
    battleEyeLive.init();
}, 1000);