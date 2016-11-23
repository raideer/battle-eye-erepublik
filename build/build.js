(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Utils = require('./classes/Utils');

var _Utils2 = _interopRequireDefault(_Utils);

var _Stats = require('./classes/Stats');

var _Stats2 = _interopRequireDefault(_Stats);

var _Layout = require('./classes/Layout');

var _Layout2 = _interopRequireDefault(_Layout);

var _Storage = require('./classes/Storage');

var _Storage2 = _interopRequireDefault(_Storage);

var _Stylesheet = require('./classes/Stylesheet');

var _Stylesheet2 = _interopRequireDefault(_Stylesheet);

var _EventHandler = require('./classes/EventHandler');

var _EventHandler2 = _interopRequireDefault(_EventHandler);

var _ModuleLoader = require('./classes/modules/ModuleLoader');

var _ModuleLoader2 = _interopRequireDefault(_ModuleLoader);

var _Other = require('./classes/modules/Other');

var _Other2 = _interopRequireDefault(_Other);

var _AutoShooter = require('./classes/modules/AutoShooter');

var _AutoShooter2 = _interopRequireDefault(_AutoShooter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BattleEye = function () {
    function BattleEye() {
        _classCallCheck(this, BattleEye);

        var self = this;
        window.BattleEye = this;
        window.storage = this.storage = new _Storage2.default();
        window.viewData = {
            connected: true
        };

        if (this.storage === false) {
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        this.defineDefaultSettings();

        var modules = new _ModuleLoader2.default(this.storage);
        modules.load(new _AutoShooter2.default());
        modules.load(new _Other2.default());

        this.storage.loadSettings();
        window.settings = this.storage.getAll();
        this.events = new _EventHandler2.default();

        this.teamA = new _Stats2.default(SERVER_DATA.leftBattleId);
        this.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        this.teamB = new _Stats2.default(SERVER_DATA.rightBattleId);
        this.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        this.teamA.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
        this.teamB.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

        this.revolutionCountry = null;
        if (SERVER_DATA.isCivilWar) {
            if (SERVER_DATA.invaderId == SERVER_DATA.leftBattleId) {
                this.teamA.revolution = true;
                this.teamAName = this.teamBName + ' Revolution';
                this.revolutionCountry = this.teamBName;
            } else {
                this.teamB.revolution = true;
                this.teamBName = this.teamAName + ' Revolution';
                this.revolutionCountry = this.teamBName;
            }
        }

        var resistanceBonusAttacker = $j('#pvp_header .domination span.resistance_influence_value.attacker em');
        var resistanceBonusDefender = $j('#pvp_header .domination span.resistance_influence_value.defender em');
        window.leftDetBonus = 1;
        window.rightDetBonus = 1;

        if (resistanceBonusAttacker.length > 0) {
            if (!this.teamA.defender) {
                window.leftDetBonus = parseFloat(resistanceBonusAttacker.html());
            } else {
                window.rightDetBonus = parseFloat(resistanceBonusAttacker.html());
            }
        } else if (resistanceBonusDefender.length > 0) {
            if (this.teamA.defender) {
                window.leftDetBonus = parseFloat(resistanceBonusDefender.html());
            } else {
                window.rightDetBonus = parseFloat(resistanceBonusDefender.html());
            }
        }

        self.forceDisconnect = pomelo.disconnect;
        pomelo.disconnect = function () {};

        this.events.on('layout.ready', function (layout) {
            layout.update(self.getTeamStats());
            self.checkForUpdates();
            self.getNbpStats(SERVER_DATA.battleId).then(function (data) {
                if (!data.zone_finished) {
                    self.loadBattleStats();
                } else {
                    $j('#bel-loading').hide();
                }
            });

            modules.run();
        });

        this.layout = new _Layout2.default({
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': this.revolutionCountry
        }, this);

        this.defineListeners();

        this.runTicker();

        this.handleEvents();

        console.log('Constructor end');
    }

    _createClass(BattleEye, [{
        key: 'defineListeners',
        value: function defineListeners() {
            var self = this;

            $j('.bel-settings-field').on('change', function (event) {
                var input = event.target;
                var value;

                if (input.type == "checkbox") {
                    value = input.checked;
                } else {
                    value = input.value;
                }
                self.storage.set(input.name, value);
                window.settings[input.name].value = value;

                var targetAtt = $j(this).attr('id');

                self.events.emit('log', 'Updated setting ' + input.name + ' to ' + value);

                $j("label[for=\"" + targetAtt + "\"]").notify("Saved", { position: "right middle", className: "success" });
            });
        }
    }, {
        key: 'sortByValue',
        value: function sortByValue(obj) {
            var sorted = {};
            var sortedKeys = Object.keys(obj).sort(function (a, b) {
                return obj[a] - obj[b];
            }).reverse();

            for (var i in sortedKeys) {
                sorted[sortedKeys[i]] = obj[sortedKeys[i]];
            }

            return sorted;
        }
    }, {
        key: 'defineDefaultSettings',
        value: function defineDefaultSettings() {
            var self = this;
            function define(settings) {
                for (var i in settings) {
                    self.storage.define.apply(self.storage, settings[i]);
                }
            }

            var settings = [['showOtherDivs', false, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below."], ['showDiv1', true, 'Structure', "Show DIV 1"], ['showDiv2', true, 'Structure', "Show DIV 2"], ['showDiv3', true, 'Structure', "Show DIV 3"], ['showDiv4', true, 'Structure', "Show DIV 4"], ['showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count"], ['showAverageDamage', false, 'Structure', "Show average damage dealt"], ['showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield"], ['showKills', false, 'Structure', "Show kills done by each division"], ['showDamagePerc', true, 'Structure', "Show Damage percentages"], ['moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh'], ['reduceLoad', false, 'Performance', "Render every second", "Stats will be refreshed every second instead of after every kill. This can improve performance"], ['gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time."], ['highlightDivision', true, 'Visual', "Highlight current division"], ['highlightValue', true, 'Visual', "Highlight winning side"], ['showDpsBar', true, 'Bars', "Show DPS bar"], ['showDamageBar', false, 'Bars', "Show Damage bar"], ['showDominationBar', true, 'Bars', "Show Domination bar"], ['largerBars', false, 'Bars', "Larger bars"], ['enableLogging', false, 'Other', "Enable logging to console"]];

            define(settings);
        }
    }, {
        key: 'getNbpStats',
        value: function getNbpStats(battleId, cb) {
            var self = this;
            return new Promise(function (resolve, reject) {
                $j.get('https://www.erepublik.com/en/military/nbp-stats/' + battleId, function (data) {
                    data = JSON.parse(data);
                    resolve(data);
                    if (typeof cb === 'function') {
                        cb(data);
                    }
                }).error(function (e) {
                    reject(e);
                });
            });
        }
    }, {
        key: 'processBattleStats',
        value: function processBattleStats(data, teamA, teamB) {
            return new Promise(function (resolve, reject) {
                var divs = [1, 2, 3, 4, 11];
                var hit, dmg, i, bareData, killValue;

                for (var d in divs) {
                    var div = divs[d];
                    var leftDmg = 0;
                    var rightDmg = 0;
                    var leftKl = 0;
                    var rightKl = 0;

                    for (i in data.leftDamage['div' + div]) {
                        hit = data.leftDamage['div' + div][i];
                        dmg = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                        leftDmg += dmg;

                        bareData = {
                            damage: dmg,
                            permalink: hit.country_permalink
                        };

                        teamA.countries.handleBare(bareData);
                        teamA.divisions.get('div' + div).countries.handleBare(bareData);
                    }

                    for (i in data.rightDamage['div' + div]) {
                        hit = data.rightDamage['div' + div][i];
                        dmg = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                        rightDmg += dmg;

                        bareData = {
                            damage: dmg,
                            permalink: hit.country_permalink
                        };

                        teamB.countries.handleBare(bareData);
                        teamB.divisions.get('div' + div).countries.handleBare(bareData);
                    }

                    for (i in data.leftKills['div' + div]) {
                        hit = data.leftKills['div' + div][i];
                        killValue = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                        leftKl += killValue;
                        teamA.countries.handleKills(hit.country_permalink, killValue);
                        teamA.divisions.get('div' + div).countries.handleKills(hit.country_permalink, killValue);
                    }

                    for (i in data.rightKills['div' + div]) {
                        hit = data.rightKills['div' + div][i];
                        killValue = Number.isInteger(hit.value) ? hit.value : Number(hit.value.replace(/[,\.]/g, ''));
                        rightKl += killValue;
                        teamB.countries.handleKills(hit.country_permalink, killValue);
                        teamB.divisions.get('div' + div).countries.handleKills(hit.country_permalink, killValue);
                    }

                    teamA.divisions.get('div' + div).damage += leftDmg;
                    teamB.divisions.get('div' + div).damage += rightDmg;
                    teamA.damage += leftDmg;
                    teamB.damage += rightDmg;
                    teamA.divisions.get('div' + div).hits += leftKl;
                    teamB.divisions.get('div' + div).hits += rightKl;
                    teamA.hits += leftKl;
                    teamB.hits += rightKl;
                }

                resolve();
            });
        }
    }, {
        key: 'loadBattleStats',
        value: function loadBattleStats() {
            var self = this;

            if (!window.settings.gatherBattleStats.value) {
                self.events.emit('log', 'Battle stat fetching canceled since the battle is over.');
                return $j('#bel-loading').hide();
            }

            self.getBattleStats().then(function (data) {
                self.events.emit('log', 'Battle stats fetched. Processing...');
                return self.processBattleStats(data, self.teamA, self.teamB);
            }).then(function () {
                self.events.emit('log', 'Battle stats loaded.');
                $j('#bel-loading').hide();
                self.layout.update(self.getTeamStats());
            });
        }
    }, {
        key: 'resetSettings',
        value: function resetSettings() {
            this.storage.loadDefaults();
            window.settings = this.storage.getAll();
        }
    }, {
        key: 'checkForUpdates',
        value: function checkForUpdates() {
            var self = this;
            return new Promise(function (resolve, reject) {
                $j.get('https://dl.dropboxusercontent.com/u/86379644/data.json', function (data) {
                    data = JSON.parse(data);
                    self.contributors = data.contributors;
                    self.displayContributors();

                    var version = parseInt(data.version.replace(/\D/g, ""));
                    var currentVersion = parseInt(GM_info.script.version.replace(/\D/g, ""));
                    if (currentVersion != version) {
                        document.querySelector('#bel-version .bel-alert').classList.add('bel-alert-danger');
                        document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="' + data.updateUrl + '">Update</a>';
                    }

                    console.log('[BATTLEEYE] Data JSON received and processed');
                    self.events.emit('log', 'Data.json synced');
                    resolve(data);
                }).error(function (error) {
                    console.error('[BATTLEEYE] Failed to download data.json');
                    reject(error);
                });
            });
        }
    }, {
        key: 'generateSummary',
        value: function generateSummary() {
            var self = this;
            var data = [];
            this.step = 1;
            self.events.emit('log', 'Generating summary...');
            var round = 1;
            function getStats(cb) {
                var divRange = [1, 2, 3, 4];
                if (round % 4 === 0) {
                    divRange = [11];
                }

                self.getBattleStats(round, divRange).then(function (stats) {
                    self.events.emit('summary.update', round);
                    data[round] = stats;
                    round++;
                    if (round <= SERVER_DATA.zoneId) {
                        getStats(cb);
                    } else {
                        cb();
                    }
                });
            }

            getStats(function () {
                // console.log(data);
                var left = new _Stats2.default(SERVER_DATA.leftBattleId);
                var right = new _Stats2.default(SERVER_DATA.rightBattleId);
                var rounds = [];

                left.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
                right.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

                async.eachOf(data, function (roundStats, key, cb) {
                    if (!roundStats) cb();
                    self.processBattleStats(roundStats, left, right).then(function () {
                        rounds[key] = {
                            left: new _Stats2.default(SERVER_DATA.leftBattleId),
                            right: new _Stats2.default(SERVER_DATA.rightBattleId)
                        };

                        rounds[key].left.defender = SERVER_DATA.defenderId == SERVER_DATA.leftBattleId;
                        rounds[key].right.defender = SERVER_DATA.defenderId != SERVER_DATA.leftBattleId;

                        self.processBattleStats(roundStats, rounds[key].left, rounds[key].right).then(function () {
                            self.events.emit('log', 'Processed round ' + (key + 1));
                            cb();
                        });
                    });
                }, function () {
                    for (var i in rounds) {
                        rounds[i].left = rounds[i].left.toObject();
                        rounds[i].right = rounds[i].right.toObject();
                    }

                    self.events.emit('summary.finished', [left.toObject(), right.toObject(), rounds, data]);
                    self.events.emit('log', 'Summary data fetching done');
                });
            });
        }
    }, {
        key: 'displayContributors',
        value: function displayContributors() {
            $j('.bel-contributor').each(function () {
                $j(this).removeClass('bel-contributor').removeAttr('style').removeAttr('original-title');
            });

            for (var color in this.contributors) {
                var players = this.contributors[color];
                for (var j in players) {
                    var cId = players[j];
                    if (erepublik.citizen.citizenId == cId) {
                        $j('#battleConsole .left_player .player_name').css({
                            textShadow: '0 0 10px ' + color,
                            color: '' + color
                        }).attr('original-title', "BattleEye contributor").tipsy();
                    } else if ($j('li[data-citizen-id="' + cId + '"] .player_name a').length > 0) {
                        $j('li[data-citizen-id="' + cId + '"] .player_name a').css({
                            textShadow: " 0 0 10px " + color,
                            color: color
                        }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                    }
                }
            }
        }
    }, {
        key: 'getTeamStats',
        value: function getTeamStats() {
            return {
                left: this.teamA.toObject(),
                right: this.teamB.toObject()
            };
        }
    }, {
        key: 'getBattleStats',
        value: function getBattleStats() {
            var round = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : SERVER_DATA.zoneId;
            var divRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var self = this;

            return new Promise(function (resolve, reject) {

                var attacker = SERVER_DATA.leftBattleId;
                var defender = SERVER_DATA.rightBattleId;

                var leftDamage = { div1: [], div2: [], div3: [], div4: [], div11: [] },
                    rightDamage = { div1: [], div2: [], div3: [], div4: [], div11: [] },
                    leftKills = { div1: [], div2: [], div3: [], div4: [], div11: [] },
                    rightKills = { div1: [], div2: [], div3: [], div4: [], div11: [] };

                var request = function request(div, pageLeft, pageRight, type) {
                    if (type === undefined) {
                        type = 'damage';
                    }

                    return new Promise(function (resolve, reject) {
                        $j.post('https://www.erepublik.com/en/military/battle-console', {
                            _token: SERVER_DATA.csrfToken,
                            action: 'battleStatistics',
                            battleId: SERVER_DATA.battleId,
                            division: div,
                            leftPage: pageLeft,
                            rightPage: pageRight,
                            round: round,
                            type: type,
                            zoneId: parseInt(round, 10)
                        }, function (data) {
                            resolve(data);
                        });
                    });
                };

                var damageHandler = function damageHandler(div, cb) {
                    var page = 1;
                    var maxPage = 1;
                    var i;

                    async.doWhilst(function (whileCb) {
                        request(div, page, page, 'damage').then(function (data) {
                            for (i in data[attacker].fighterData) {
                                leftDamage['div' + div].push(data[attacker].fighterData[i]);
                            }
                            for (i in data[defender].fighterData) {
                                rightDamage['div' + div].push(data[defender].fighterData[i]);
                            }

                            maxPage = Math.max(data[attacker].pages, data[defender].pages);

                            if (window.settings.enableLogging.value) {
                                console.log('[BATTLEEYE] Finished damage page ' + page + "/" + maxPage + " div" + div);
                                self.events.emit('log', 'Fetched damage ' + page + '/' + maxPage + ' for div' + div);
                            }

                            page++;
                            whileCb();
                        });
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
                        request(div, page, page, 'kills').then(function (data) {
                            for (var i in data[attacker].fighterData) {
                                leftKills['div' + div].push(data[attacker].fighterData[i]);
                            }

                            for (var j in data[defender].fighterData) {
                                rightKills['div' + div].push(data[defender].fighterData[j]);
                            }

                            maxPage = Math.max(data[attacker].pages, data[defender].pages);
                            if (window.settings.enableLogging.value) {
                                console.log('[BATTLEEYE] Finished kill page ' + page + "/" + maxPage + " div" + div);
                                self.events.emit('log', 'Fetched kills ' + page + '/' + maxPage + ' for div' + div);
                            }
                            page++;

                            whileCb();
                        });
                    }, function () {
                        return page <= maxPage;
                    }, function () {
                        cb();
                    });
                };

                if (divRange === null) {
                    divRange = SERVER_DATA.division == 11 ? [11] : [1, 2, 3, 4];
                }

                async.each(divRange, damageHandler.bind(self), function () {
                    async.each(divRange, killsHandler.bind(self), function () {
                        resolve({ leftDamage: leftDamage, rightDamage: rightDamage, leftKills: leftKills, rightKills: rightKills });
                    });
                });
            });
        }
    }, {
        key: 'runTicker',
        value: function runTicker() {
            var second = 0;
            var self = this;

            var ticker = function ticker() {
                second++;
                self.events.emit('tick', {
                    second: second,
                    time: new Date().getTime()
                });
            };

            this.interval = setInterval(ticker, 1000);
        }
    }, {
        key: 'handleEvents',
        value: function handleEvents() {
            var self = this;
            this.events.on('tick', function (timeData) {
                if (timeData.second % 3 === 0 && self.updateContributors) {
                    self.updateContributors = false;
                    self.displayContributors();
                }
                self.teamA.updateDps(timeData);
                self.teamB.updateDps(timeData);
                self.layout.update(self.getTeamStats());
            });
        }
    }, {
        key: 'overridePomelo',
        value: function overridePomelo() {
            var self = this;

            var handler = function handler(data) {
                self.updateContributors = true;
                self.handle(data);
            };

            pomelo.on('onMessage', handler);
            pomelo.on('close', function (data) {
                console.log('[BATTLEEYE] Socket closed [' + data.reason + ']');
                self.events.emit('log', 'Connection to the battlefield was closed.');
                window.viewData.connected = false;
                clearTimeout(self.interval);
                self.layout.update(self.getTeamStats());
            });
        }
    }, {
        key: 'handle',
        value: function handle(data) {
            var self = this;
            self.teamA.handle(data);
            self.teamB.handle(data);
            if (!settings.reduceLoad.value) {
                self.layout.update(self.getTeamStats());
            }
            window.viewData.connected = true;
        }
    }]);

    return BattleEye;
}();

module.exports = new BattleEye();

},{"./classes/EventHandler":6,"./classes/Layout":8,"./classes/Stats":9,"./classes/Storage":10,"./classes/Stylesheet":11,"./classes/Utils":12,"./classes/modules/AutoShooter":30,"./classes/modules/ModuleLoader":32,"./classes/modules/Other":33}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CountryStats = function () {
    function CountryStats() {
        _classCallCheck(this, CountryStats);

        this.countries = {};
    }

    _createClass(CountryStats, [{
        key: "handle",
        value: function handle(data) {
            var addKill = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var addDamage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var country = data.msg.permalink;
            if (!this.countries[country]) {
                this.countries[country] = {
                    damage: 0,
                    kills: 0
                };
            }

            if (addDamage) {
                this.countries[country].damage += data.msg.damage;
            }

            if (addKill) {
                this.countries[country].kills += 1;
            }
        }
    }, {
        key: "handleBare",
        value: function handleBare(data) {
            var ob = {
                msg: {
                    permalink: "",
                    damage: 0
                }
            };

            ob.msg.damage = data.damage;
            ob.msg.permalink = data.permalink;

            this.handle(ob, false);
        }
    }, {
        key: "handleKills",
        value: function handleKills(country, value) {
            if (!this.countries[country]) {
                this.countries[country] = {
                    damage: 0,
                    kills: 0
                };
            }

            this.countries[country].kills += value;
        }
    }, {
        key: "getAll",
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

exports.default = CountryStats;

},{}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DpsHandler2 = require('./DpsHandler');

var _DpsHandler3 = _interopRequireDefault(_DpsHandler2);

var _CountryStats = require('./CountryStats');

var _CountryStats2 = _interopRequireDefault(_CountryStats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DivisionStats = function (_DpsHandler) {
    _inherits(DivisionStats, _DpsHandler);

    function DivisionStats(division) {
        _classCallCheck(this, DivisionStats);

        var _this = _possibleConstructorReturn(this, (DivisionStats.__proto__ || Object.getPrototypeOf(DivisionStats)).call(this, 10));

        _this.division = division;
        _this.hits = 0;
        _this.damage = 0;
        _this.countries = new _CountryStats2.default();
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
                'countries': this.countries.getAll()
            };
        }
    }]);

    return DivisionStats;
}(_DpsHandler3.default);

exports.default = DivisionStats;

},{"./CountryStats":2,"./DpsHandler":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DivisionStats = require('./DivisionStats');

var _DivisionStats2 = _interopRequireDefault(_DivisionStats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Divisions = function () {
    function Divisions() {
        _classCallCheck(this, Divisions);

        var self = this;
        this.divisions = {};
    }

    _createClass(Divisions, [{
        key: 'create',
        value: function create(id, division) {
            this.divisions[id] = new _DivisionStats2.default(division);
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

exports.default = Divisions;

},{"./DivisionStats":3}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _HitHistory = require('./HitHistory');

var _HitHistory2 = _interopRequireDefault(_HitHistory);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DpsHandler = function () {
    function DpsHandler(rem) {
        _classCallCheck(this, DpsHandler);

        this.rememberDpsFor = rem;
        this.hitHistory = new _HitHistory2.default(rem * 1000);
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

exports.default = DpsHandler;

},{"./HitHistory":7}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EventHandler = function () {
    function EventHandler() {
        _classCallCheck(this, EventHandler);

        this.events = {};
    }

    _createClass(EventHandler, [{
        key: "emit",
        value: function emit(eventName, data) {
            if (this.events[eventName]) {
                this.events[eventName].forEach(function (fn) {
                    return fn(data);
                });
            }
        }
    }, {
        key: "on",
        value: function on(eventName, closure) {
            this.events[eventName] = this.events[eventName] || [];
            this.events[eventName].push(closure);
        }
    }, {
        key: "off",
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

exports.default = EventHandler;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HitHistory = function () {
    function HitHistory() {
        var rememberFor = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30000;

        _classCallCheck(this, HitHistory);

        this.rememberFor = rememberFor;
        this.history = {};
    }

    _createClass(HitHistory, [{
        key: "add",
        value: function add(hit) {
            var time = new Date().getTime();
            this.history[time] = hit;
            this.trimOld(time);
        }
    }, {
        key: "trimOld",
        value: function trimOld() {
            var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date().getTime();

            for (var i in this.history) {
                if (time - i - this.rememberFor > 0) {
                    delete this.history[i];
                }
            }
        }
    }, {
        key: "clear",
        value: function clear() {
            this.history = {};
        }
    }, {
        key: "getTotal",
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

exports.default = HitHistory;

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Stylesheet = require('./Stylesheet');

var _Stylesheet2 = _interopRequireDefault(_Stylesheet);

var _Template = require('./layout/Template');

var _Template2 = _interopRequireDefault(_Template);

var _MiniMonitor = require('./layout/MiniMonitor');

var _MiniMonitor2 = _interopRequireDefault(_MiniMonitor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Layout = function () {
    function Layout(headerData) {
        _classCallCheck(this, Layout);

        var self = this;
        self.headerData = headerData;
        self.canRender = true;

        var battleEye = document.createElement('div');
        battleEye.setAttribute('id', 'battle_eye_live');

        if (window.settings.moveToTop.value) {
            $j('#content').prepend(battleEye);
        } else {
            $j('#content').append(battleEye);
        }

        $j('#battleConsole').append('<div id="bel-minimonitor"></div>');

        _Stylesheet2.default.load();

        window.BattleEye.events.emit('layout.ready', this);
    }

    _createClass(Layout, [{
        key: 'update',
        value: function update(feedData) {
            if (!this.canRender) return;

            ReactDOM.render(React.createElement(_Template2.default, { settings: window.settings, viewData: window.viewData, feedData: feedData, headerData: this.headerData }), document.getElementById('battle_eye_live'));

            ReactDOM.render(React.createElement(_MiniMonitor2.default, { settings: window.settings, feedData: feedData }), document.getElementById('bel-minimonitor'));
        }
    }]);

    return Layout;
}();

exports.default = Layout;

},{"./Stylesheet":11,"./layout/MiniMonitor":16,"./layout/Template":17}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _DpsHandler2 = require('./DpsHandler');

var _DpsHandler3 = _interopRequireDefault(_DpsHandler2);

var _CountryStats = require('./CountryStats');

var _CountryStats2 = _interopRequireDefault(_CountryStats);

var _Divisions = require('./Divisions');

var _Divisions2 = _interopRequireDefault(_Divisions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Stats = function (_DpsHandler) {
    _inherits(Stats, _DpsHandler);

    function Stats(id) {
        _classCallCheck(this, Stats);

        var _this = _possibleConstructorReturn(this, (Stats.__proto__ || Object.getPrototypeOf(Stats)).call(this, 10));

        _this.countries = new _CountryStats2.default();
        _this.id = id;
        _this.damage = 0;
        _this.hits = 0;
        _this.constructDivisions();
        _this.revolution = false;
        _this.defender = false;
        return _this;
    }

    _createClass(Stats, [{
        key: 'constructDivisions',
        value: function constructDivisions() {
            this.divisions = new _Divisions2.default();

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
            _get(Stats.prototype.__proto__ || Object.getPrototypeOf(Stats.prototype), 'updateDps', this).call(this, timeData);
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
                'countries': this.countries.getAll(),
                'revolution': this.revolution
            };
        }
    }]);

    return Stats;
}(_DpsHandler3.default);

exports.default = Stats;

},{"./CountryStats":2,"./Divisions":4,"./DpsHandler":5}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

exports.default = Storage;

},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var StyleSheet = function () {
    function StyleSheet() {
        _classCallCheck(this, StyleSheet);

        this.sheet = "";

        this.sheet += '\n            @keyframes bel-pulse-w {\n                0% {\n                    background-color: #27ae60;\n                }\n\n                10% {\n                    background-color: #2ecc71;\n                }\n\n                100% {\n                    background-color: #27ae60;\n                }\n            }\n\n            @keyframes bel-pulse-l {\n                0% {\n                    background-color: #e74c3c;\n                }\n\n                10% {\n                    background-color: #c0392b;\n                }\n\n                100% {\n                    background-color: #e74c3c;\n                }\n            }\n\n            @keyframes connectionAlert{\n                49%{\n                    background-color: #34495e;\n                }\n                50%{\n                    background-color: #e74c3c;\n                }\n            }\n\n            .bel-disconnectedAlert{\n                animation: connectionAlert 1s infinite;\n            }\n\n            .bel-status-log{\n                padding: 2px;\n                text-align: right;\n                margin: 4px 0;\n                font-size: 0.8em;\n                color: #8c8c8c;\n                width: 100%;\n            }\n\n            .bel-spinner {\n              width: 50px;\n              height: 20px;\n              text-align: center;\n              font-size: 10px;\n              padding-top: 8px;\n            }\n\n            .bel-spinner > div {\n              background-color: #2980b9;\n              height: 100%;\n              width: 6px;\n              display: inline-block;\n\n              -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;\n              animation: sk-stretchdelay 1.2s infinite ease-in-out;\n            }\n\n            .bel-spinner .rect2 {\n              -webkit-animation-delay: -1.1s;\n              animation-delay: -1.1s;\n              background-color: #3498db;\n            }\n\n            .bel-spinner .rect3 {\n              -webkit-animation-delay: -1.0s;\n              animation-delay: -1.0s;\n              background-color: #2980b9;\n            }\n\n            .bel-spinner .rect4 {\n              -webkit-animation-delay: -0.9s;\n              animation-delay: -0.9s;\n              background-color: #3498db;\n            }\n\n            .bel-spinner .rect5 {\n              -webkit-animation-delay: -0.8s;\n              animation-delay: -0.8s;\n              background-color: #2980b9;\n            }\n\n            @-webkit-keyframes sk-stretchdelay {\n              0%, 40%, 100% { -webkit-transform: scaleY(0.4) }\n              20% { -webkit-transform: scaleY(1.0) }\n            }\n\n            @keyframes sk-stretchdelay {\n              0%, 40%, 100% {\n                transform: scaleY(0.4);\n                -webkit-transform: scaleY(0.4);\n              }  20% {\n                transform: scaleY(1.0);\n                -webkit-transform: scaleY(1.0);\n              }\n            }\n\n            hr.bel{\n                 border: 0; height: 0; border-top: 1px solid rgba(0, 0, 0, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.3);\n            }\n\n            .bel-stat-spacer{\n                padding-right: 2px;\n                padding-left: 2px;\n            }\n\n            .bel-color-emerald{\n                color: #2ecc71;\n            }\n\n            .bel-color-belize{\n                color: #2980b9;\n            }\n\n            .bel-color-amethyst{\n                color: #9b59b6;\n            }\n\n            .bel-spacer-sm{\n                display: inline-block;\n                width: 15px;\n            }\n        ';

        this.addCSSRule('.clearfix:after', '\n            content: "";\n            display: table;\n            clear: both;\n        ');

        this.addCSSRule('.bel-alert', '\n            background-color: #34495e;\n            color:#ecf0f1;\n            padding: 3px 8px;\n            border-radius:4px;\n            margin-right:4px;\n        ');

        this.addCSSRule('.bel-alert-danger', '\n            background-color: #e74c3c;\n        ');

        // this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        // this.addCSSRule('.bel-version-outdated', 'background-color: #e74c3c;');

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

        this.addCSSRule('#bel-battle-history', '\n            position: relative;\n            display: block;\n            height: 35px;\n            width: 35px;\n            float: left;\n            text-indent: -9999px;\n            margin-left: 4px;\n            margin-top: 5px;\n            border-radius: 4px;\n            overflow: hidden;\n            background-color: rgba(0, 0, 0, 0.45);\n        ');

        this.addCSSRule('#bel-battle-history:hover', '\n            background-color: rgba(0, 0, 0, 0.8);\n        ');

        this.addCSSRule('#bel-battle-history::after', '\n            position: absolute;\n            top: 5px;\n            left: 5px;\n            width: 35px;\n            height: 35px;\n            background-image: url("https://dl.dropboxusercontent.com/u/86379644/sprites.png");\n            background-repeat: no-repeat;\n            background-position: 0 0;\n            content: " ";\n            opacity: 0.6;\n        ');

        this.addCSSRule('#bel-battle-history');

        //General
        //

        this.addCSSRule('#bel-minimonitor', '\n            position: absolute;\n            right: 0;\n        ');

        this.addCSSRule('.bel-country-list', '\n            max-height: 400px;\n            overflow-y: scroll;\n        ');

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
        this.addCSSRule("[class*='bel-col-']", 'float: left;min-height: 1px;');
        this.addCSSRule('.bel-col-1-1', 'width: 100%;');
        this.addCSSRule('.bel-col-1-2', 'width: 50%;');
        this.addCSSRule('.bel-col-1-4', 'width: 25%;');
        this.addCSSRule('.bel-col-1-3', 'width: 33.3333%;');
        this.addCSSRule('.bel-col-1-8', 'width: 12.5%;');
        //Lists
        this.addCSSRule('.list-unstyled', 'list-style: outside none none;padding-left: 0;');
        this.addCSSRule('.list-inline li', 'display: inline-block;');

        this.addCSSRule('.bel-closed', '\n            z-index: 100;\n            position: absolute;\n            width: 100%;\n            opacity: 0.95;\n            top: 0;\n            left: 0;\n            background-color: #2c3e50;\n            text-shadow: 0 0 2px #363636;\n            color: #ffffff;\n            font-size: 20px;\n            padding: 14px;\n            text-align: center;\n            overflow: hidden;\n            height: 100%;\n            display: none;\n        ');
        this.addCSSRule('.bel-closed p', '\n            font-size: 12px;\n        ');

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
        // this.addCSSRule('.bel-progress', `
        //     position: absolute;
        //     height: 20px;
        //     width: 100%;
        //     left:0;
        //     bottom: 0;
        // `);
        this.addCSSRule('.bel-progress', '\n            height: 4px;\n            position: relative;\n            background: #ebedef none repeat scroll 0 0;\n            border-radius: 32px;\n            box-shadow: none;\n            margin-top: 2px;\n            overflow: hidden;\n        ');

        this.addCSSRule('.bel-progress-bar', '\n            box-shadow: none;\n            line-height: 12px;\n            color: #fff;\n            float: left;\n            font-size: 12px;\n            height: 100%;\n            line-height: 20px;\n            text-align: center;\n            transition: width 0.6s ease 0s;\n            width: 0;\n        ');
        //
        this.addCSSRule('.bel-progress-center-marker', '\n            border-right: 3px solid #ffffff;\n            height: 10px;\n            left: 50%;\n            margin-left: -2px;\n            opacity: 0.6;\n            position: absolute;\n        ');
        //Other
        this.addCSSRule('.bel-hr', '\n            -moz-border-bottom-colors: none;\n            -moz-border-left-colors: none;\n            -moz-border-right-colors: none;\n            -moz-border-top-colors: none;\n            border-color: #eee -moz-use-text-color -moz-use-text-color;\n            border-image: none;\n            border-style: solid none none;\n            border-width: 1px 0 0;\n            margin-bottom: 20px;\n        ');
    }

    _createClass(StyleSheet, [{
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

    return StyleSheet;
}();

exports.default = new StyleSheet();

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Utils = function () {
    function Utils() {
        _classCallCheck(this, Utils);
    }

    _createClass(Utils, [{
        key: "uid",
        value: function uid() {
            return ("0000" + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
        }
    }]);

    return Utils;
}();

exports.default = Utils;

},{}],13:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Footer = function (_React$Component) {
    _inherits(Footer, _React$Component);

    function Footer() {
        _classCallCheck(this, Footer);

        return _possibleConstructorReturn(this, (Footer.__proto__ || Object.getPrototypeOf(Footer)).apply(this, arguments));
    }

    _createClass(Footer, [{
        key: "render",
        value: function render() {
            return null;
        }
    }]);

    return Footer;
}(React.Component);

exports.default = Footer;

},{}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _If = require('./If');

var _If2 = _interopRequireDefault(_If);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_React$Component) {
    _inherits(Header, _React$Component);

    function Header() {
        _classCallCheck(this, Header);

        var _this = _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).call(this));

        var self = _this;

        _this.state = {
            log: null
        };

        _this.listenerRegistered = false;
        return _this;
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
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.attachTooltip();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachTooltip();
        }
    }, {
        key: 'attachTooltip',
        value: function attachTooltip() {
            $j('.bel-disconnectedAlert').attr('original-title', 'Not connected to the battlefield!').tipsy();
        }
    }, {
        key: 'render',
        value: function render() {
            var self = this;

            if (!this.listenerRegistered && window.BattleEye) {
                window.BattleEye.events.on('log', function (text) {
                    self.state.log = text;
                });

                this.listenerRegistered = true;
            }
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
                            { className: 'bel-alert' },
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
                        _If2.default,
                        { test: !window.viewData.connected },
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'span',
                                { className: 'bel-alert bel-disconnectedAlert' },
                                'Not connected!'
                            )
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
                    'div',
                    { className: 'bel-grid bel-status-log' },
                    this.state.log
                ),
                React.createElement(
                    _If2.default,
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
                    _If2.default,
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
    }]);

    return Header;
}(React.Component);

exports.default = Header;

},{"./If":15}],15:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var If = function (_React$Component) {
    _inherits(If, _React$Component);

    function If() {
        _classCallCheck(this, If);

        return _possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).apply(this, arguments));
    }

    _createClass(If, [{
        key: "render",
        value: function render() {
            if (this.props.test) {
                return React.createElement(
                    "span",
                    null,
                    this.props.children
                );
            }

            return null;
        }
    }]);

    return If;
}(React.Component);

exports.default = If;

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MiniMonitor = function (_React$Component) {
    _inherits(MiniMonitor, _React$Component);

    function MiniMonitor() {
        _classCallCheck(this, MiniMonitor);

        return _possibleConstructorReturn(this, (MiniMonitor.__proto__ || Object.getPrototypeOf(MiniMonitor)).apply(this, arguments));
    }

    _createClass(MiniMonitor, [{
        key: 'getPerc',
        value: function getPerc(a, b) {
            var ap = 0;
            if (a + b !== 0) {
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

            var divs = [];

            if (SERVER_DATA.division == 11) {
                divs = [11];
            } else {
                divs = [1, 2, 3, 4];
            }

            for (var i in divs) {
                var div = divs[i];
                var leftDamage = left.divisions['div' + div].damage * window.leftDetBonus;
                var rightDamage = right.divisions['div' + div].damage * window.rightDetBonus;

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

exports.default = MiniMonitor;

},{}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SettingsModal = require('./settings/SettingsModal');

var _SettingsModal2 = _interopRequireDefault(_SettingsModal);

var _TabSelector = require('./tabs/TabSelector');

var _TabSelector2 = _interopRequireDefault(_TabSelector);

var _Tabs = require('./tabs/Tabs');

var _Tabs2 = _interopRequireDefault(_Tabs);

var _Header = require('./Header');

var _Header2 = _interopRequireDefault(_Header);

var _Footer = require('./Footer');

var _Footer2 = _interopRequireDefault(_Footer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Template = function (_React$Component) {
    _inherits(Template, _React$Component);

    function Template() {
        _classCallCheck(this, Template);

        var _this = _possibleConstructorReturn(this, (Template.__proto__ || Object.getPrototypeOf(Template)).call(this));

        _this.state = {
            modalHidden: true,
            tab: 'div'
        };
        return _this;
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
        key: 'getTabButtons',
        value: function getTabButtons() {
            return [['div', 'Divisions'], ['overall', 'Total'], ['countries', 'Countries'], ['summary', 'Battle stats (beta)']];
        }
    }, {
        key: 'render',
        value: function render() {
            return React.createElement(
                'div',
                null,
                React.createElement(_SettingsModal2.default, { closeModal: this.closeModal.bind(this), hidden: this.state.modalHidden, settings: this.props.settings }),
                React.createElement(_Header2.default, { viewData: this.props.viewData, openModal: this.openModal.bind(this), data: this.props.headerData }),
                React.createElement(_TabSelector2.default, { changeTab: this.changeTab.bind(this), tab: this.state.tab, buttons: this.getTabButtons() }),
                React.createElement(_Tabs2.default, { data: this.props.feedData, settings: this.props.settings, tab: this.state.tab }),
                React.createElement(_Footer2.default, null)
            );
        }
    }]);

    return Template;
}(React.Component);

exports.default = Template;

},{"./Footer":13,"./Header":14,"./settings/SettingsModal":23,"./tabs/TabSelector":28,"./tabs/Tabs":29}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FloatValue = function (_React$Component) {
    _inherits(FloatValue, _React$Component);

    function FloatValue() {
        _classCallCheck(this, FloatValue);

        var _this = _possibleConstructorReturn(this, (FloatValue.__proto__ || Object.getPrototypeOf(FloatValue)).call(this));

        _this.props = {
            text: "",
            green: false
        };
        return _this;
    }

    _createClass(FloatValue, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "span",
                { className: "bel-value " + (this.props.a > this.props.b && this.props.highlight ? this.props.green == true ? "bel-value-hl-w" : "bel-value-hl-l" : "") },
                parseFloat(this.props.a).toLocaleString(),
                " ",
                this.props.text
            );
        }
    }]);

    return FloatValue;
}(React.Component);

exports.default = FloatValue;

},{}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProgressBar = function (_React$Component) {
    _inherits(ProgressBar, _React$Component);

    function ProgressBar() {
        _classCallCheck(this, ProgressBar);

        return _possibleConstructorReturn(this, (ProgressBar.__proto__ || Object.getPrototypeOf(ProgressBar)).apply(this, arguments));
    }

    _createClass(ProgressBar, [{
        key: "render",
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
                "div",
                { className: "bel-progress", style: progressStyle },
                React.createElement("div", { className: "bel-progress-center-marker" }),
                React.createElement("div", { className: "bel-progress-bar bel-teama", style: teamA }),
                React.createElement("div", { className: "bel-progress-bar bel-teamb", style: teamB })
            );
        }
    }]);

    return ProgressBar;
}(React.Component);

exports.default = ProgressBar;

},{}],20:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextValue = function (_React$Component) {
    _inherits(TextValue, _React$Component);

    function TextValue() {
        _classCallCheck(this, TextValue);

        var _this = _possibleConstructorReturn(this, (TextValue.__proto__ || Object.getPrototypeOf(TextValue)).call(this));

        _this.props = {
            text: "",
            green: false
        };
        return _this;
    }

    _createClass(TextValue, [{
        key: "render",
        value: function render() {
            return React.createElement(
                "span",
                { className: "bel-value" },
                this.props.a,
                " ",
                this.props.text
            );
        }
    }]);

    return TextValue;
}(React.Component);

exports.default = TextValue;

},{}],21:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SettingsField = function (_React$Component) {
    _inherits(SettingsField, _React$Component);

    function SettingsField() {
        _classCallCheck(this, SettingsField);

        return _possibleConstructorReturn(this, (SettingsField.__proto__ || Object.getPrototypeOf(SettingsField)).apply(this, arguments));
    }

    _createClass(SettingsField, [{
        key: "getInput",
        value: function getInput() {
            var setting = this.props.setting;
            // console.log(setting.value);
            if (typeof setting.value == "boolean") {
                return React.createElement(
                    "div",
                    null,
                    React.createElement("input", { type: "checkbox", defaultChecked: setting.value, className: "bel-settings-field", id: setting.field.id, name: setting.field.id }),
                    React.createElement(
                        "label",
                        { htmlFor: setting.field.id },
                        setting.field.name
                    )
                );
            } else {
                return React.createElement(
                    "div",
                    null,
                    React.createElement(
                        "label",
                        { htmlFor: setting.field.id },
                        setting.field.name
                    ),
                    React.createElement(
                        "div",
                        null,
                        React.createElement("input", { type: "text", defaultValue: setting.value, className: "bel-settings-field", id: setting.field.id, name: setting.field.id })
                    )
                );
            }
        }
    }, {
        key: "render",
        value: function render() {
            var setting = this.props.setting;
            return React.createElement(
                "div",
                { className: "bel-checkbox" },
                this.getInput(),
                React.createElement(
                    "div",
                    { className: "bel-field-description" },
                    setting.field.desc
                )
            );
        }
    }]);

    return SettingsField;
}(React.Component);

exports.default = SettingsField;

},{}],22:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SettingsField = require("./SettingsField");

var _SettingsField2 = _interopRequireDefault(_SettingsField);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SettingsGroup = function (_React$Component) {
    _inherits(SettingsGroup, _React$Component);

    function SettingsGroup() {
        _classCallCheck(this, SettingsGroup);

        return _possibleConstructorReturn(this, (SettingsGroup.__proto__ || Object.getPrototypeOf(SettingsGroup)).apply(this, arguments));
    }

    _createClass(SettingsGroup, [{
        key: "renderSettings",
        value: function renderSettings() {
            var settings = this.props.settings;
            var components = [];

            for (var i in settings) {
                var setting = settings[i];
                components.push(React.createElement(_SettingsField2.default, { setting: setting }));
            }

            return components;
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "bel-col-1-2" },
                React.createElement(
                    "h5",
                    { className: "bel-settings-group" },
                    this.props.name
                ),
                React.createElement(
                    "div",
                    { className: "bel-settings-container" },
                    this.renderSettings()
                )
            );
        }
    }]);

    return SettingsGroup;
}(React.Component);

exports.default = SettingsGroup;

},{"./SettingsField":21}],23:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _SettingsGroup = require('./SettingsGroup');

var _SettingsGroup2 = _interopRequireDefault(_SettingsGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SettingsModal = function (_React$Component) {
    _inherits(SettingsModal, _React$Component);

    function SettingsModal() {
        _classCallCheck(this, SettingsModal);

        return _possibleConstructorReturn(this, (SettingsModal.__proto__ || Object.getPrototypeOf(SettingsModal)).apply(this, arguments));
    }

    _createClass(SettingsModal, [{
        key: 'renderGroups',
        value: function renderGroups() {
            var settings = this.props.settings;
            var components = [];
            var groups = {};
            var i;

            for (i in settings) {
                var setting = settings[i];

                if (groups[setting.field.group] === undefined) {
                    groups[setting.field.group] = [];
                }

                groups[setting.field.group].push(setting);
            }

            for (i in groups) {
                var group = groups[i];
                components.push(React.createElement(_SettingsGroup2.default, { name: i, settings: group }));
            }
            return components;
        }
    }, {
        key: 'resetSettings',
        value: function resetSettings() {
            window.BattleEye.resetSettings();
            $j('#bel-reset-settings').notify('Settings reset', 'info');
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            window.BattleEye.forceDisconnect();
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
                                { href: 'https://dl.dropboxusercontent.com/u/86379644/battle-eye-live.user.js', className: 'bel-btn bel-btn-inverse' },
                                'Update'
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(
                                'button',
                                { onClick: this.disconnect, className: 'bel-btn bel-btn-danger' },
                                'Disconnect'
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

exports.default = SettingsModal;

},{"./SettingsGroup":22}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _If = require('../If');

var _If2 = _interopRequireDefault(_If);

var _TabSelector = require('./TabSelector');

var _TabSelector2 = _interopRequireDefault(_TabSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CountriesTab = function (_React$Component) {
    _inherits(CountriesTab, _React$Component);

    function CountriesTab() {
        _classCallCheck(this, CountriesTab);

        var _this = _possibleConstructorReturn(this, (CountriesTab.__proto__ || Object.getPrototypeOf(CountriesTab)).call(this));

        _this.state = {
            tab: 'overall'
        };
        return _this;
    }

    _createClass(CountriesTab, [{
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
            var countries = [];

            // console.log(this.state.tab);
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
                        _If2.default,
                        { test: side == "right" },
                        React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side != "right" },
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-kills bel-value' },
                                c.kills.toLocaleString()
                            )
                        ),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-damage bel-value' },
                                c.damage.toLocaleString()
                            )
                        ),
                        React.createElement('span', { className: 'bel-spacer-sm' })
                    ),
                    React.createElement(
                        'b',
                        { className: 'bel-color-belize' },
                        i
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side == "left" },
                        React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side != "left" },
                        React.createElement('span', { className: 'bel-spacer-sm' }),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-damage bel-value' },
                                c.damage.toLocaleString()
                            )
                        ),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-kills bel-value' },
                                c.kills.toLocaleString()
                            )
                        )
                    ),
                    React.createElement('hr', { className: 'bel' })
                ));
            }

            return content;
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {
            this.attachTooltip();
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.attachTooltip();
        }
    }, {
        key: 'attachTooltip',
        value: function attachTooltip() {
            $j('.tooltip-kills').attr('original-title', 'Kills').tipsy();
            $j('.tooltip-damage').attr('original-title', 'Damage').tipsy();
        }
    }, {
        key: 'getTabButtons',
        value: function getTabButtons() {
            return [['overall', 'Round Total'], ['div1', 'DIV1'], ['div2', 'DIV2'], ['div3', 'DIV3'], ['div4', 'DIV4']];
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
            if (this.props.tab != 'countries' && this.props.tab != 'div1' && this.props.tab != 'div2' && this.props.tab != 'div3' && this.props.tab != 'div4') {
                return null;
            }

            return React.createElement(
                'div',
                null,
                React.createElement(_TabSelector2.default, { changeTab: this.changeTab.bind(this), tab: this.state.tab, buttons: this.getTabButtons() }),
                React.createElement(
                    'div',
                    { className: 'bel-country-list' },
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
    }]);

    return CountriesTab;
}(React.Component);

exports.default = CountriesTab;

},{"../If":15,"./TabSelector":28}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FloatValue = require('../elements/FloatValue');

var _FloatValue2 = _interopRequireDefault(_FloatValue);

var _TextValue = require('../elements/TextValue');

var _TextValue2 = _interopRequireDefault(_TextValue);

var _ProgressBar = require('../elements/ProgressBar');

var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

var _If = require('../If');

var _If2 = _interopRequireDefault(_If);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DivisionTab = function (_React$Component) {
    _inherits(DivisionTab, _React$Component);

    function DivisionTab() {
        _classCallCheck(this, DivisionTab);

        return _possibleConstructorReturn(this, (DivisionTab.__proto__ || Object.getPrototypeOf(DivisionTab)).apply(this, arguments));
    }

    _createClass(DivisionTab, [{
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
            if (this.props.tab != 'div') {
                return null;
            }

            var left = this.props.data.left;
            var right = this.props.data.right;
            var settings = this.props.settings;
            var highlightDivision = false;
            if (settings.highlightDivision.value && SERVER_DATA.division == this.props.div[0]) {
                highlightDivision = true;
            }

            var leftDomination = left.damage * window.leftDetBonus;
            var rightDomination = right.damage * window.rightDetBonus;

            var leftDmgPerPercent = Math.round(parseFloat(left.damage) / parseFloat(this.getPerc(leftDomination, rightDomination)));
            var rightDmgPerPercent = Math.round(parseFloat(right.damage) / parseFloat(this.getPerc(rightDomination, leftDomination)));
            if (window.leftDetBonus == window.rightDetBonus) {
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
                            React.createElement(_TextValue2.default, { a: "1% = " + leftDmgPerPercent.toLocaleString() + " dmg" }),
                            React.createElement(_FloatValue2.default, { green: true, a: this.getPerc(leftDomination, rightDomination), b: this.getPerc(rightDomination, leftDomination), highlight: settings.highlightValue.value, text: "%" })
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-center' },
                            'Domination'
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-left' },
                            React.createElement(_FloatValue2.default, { b: this.getPerc(leftDomination, rightDomination), a: this.getPerc(rightDomination, leftDomination), highlight: settings.highlightValue.value, text: "%" }),
                            React.createElement(_TextValue2.default, { a: "1% = " + rightDmgPerPercent.toLocaleString() + " dmg" })
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
                                _If2.default,
                                { test: settings.showKills.value },
                                React.createElement(_FloatValue2.default, { green: true, a: left.hits, b: right.hits, highlight: settings.highlightValue.value, text: "kills" })
                            ),
                            React.createElement(
                                _If2.default,
                                { test: settings.showDamagePerc.value },
                                React.createElement(_FloatValue2.default, { green: true, a: this.getPerc(left.damage, right.damage), b: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                            ),
                            React.createElement(_FloatValue2.default, { green: true, a: left.damage, b: right.damage, highlight: settings.highlightValue.value })
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-center' },
                            'Total Damage'
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-left' },
                            React.createElement(_FloatValue2.default, { a: right.damage, b: left.damage, highlight: settings.highlightValue.value }),
                            React.createElement(
                                _If2.default,
                                { test: settings.showDamagePerc.value },
                                React.createElement(_FloatValue2.default, { b: this.getPerc(left.damage, right.damage), a: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                            ),
                            React.createElement(
                                _If2.default,
                                { test: settings.showKills.value },
                                React.createElement(_FloatValue2.default, { a: right.hits, b: left.hits, text: "kills", highlight: settings.highlightValue.value })
                            )
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'belFeedValue' },
                    React.createElement(
                        _If2.default,
                        { test: settings.showAverageDamage.value },
                        React.createElement(
                            'ul',
                            { className: 'list-unstyled' },
                            React.createElement(
                                'li',
                                { className: 'bel-col-1-3 text-right' },
                                React.createElement(_FloatValue2.default, { green: true, a: left.avgHit, b: right.avgHit, highlight: settings.highlightValue.value })
                            ),
                            React.createElement(
                                'li',
                                { className: 'bel-col-1-3 text-center' },
                                'Average damage'
                            ),
                            React.createElement(
                                'li',
                                { className: 'bel-col-1-3 text-left' },
                                React.createElement(_FloatValue2.default, { a: right.avgHit, b: left.avgHit, highlight: settings.highlightValue.value })
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
                            React.createElement(_FloatValue2.default, { green: true, a: left.dps, b: right.dps, highlight: settings.highlightValue.value })
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-center' },
                            'DPS'
                        ),
                        React.createElement(
                            'li',
                            { className: 'bel-col-1-3 text-left' },
                            React.createElement(_FloatValue2.default, { a: right.dps, b: left.dps, highlight: settings.highlightValue.value })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'bel-col-1-1' },
                    React.createElement(
                        _If2.default,
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
                        React.createElement(_ProgressBar2.default, { a: leftDomination, b: rightDomination })
                    ),
                    React.createElement(
                        _If2.default,
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
                        React.createElement(_ProgressBar2.default, { a: left.damage, b: right.damage })
                    ),
                    React.createElement(
                        _If2.default,
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
                        React.createElement(_ProgressBar2.default, { a: left.dps, b: right.dps })
                    )
                )
            );
        }
    }]);

    return DivisionTab;
}(React.Component);

exports.default = DivisionTab;

},{"../If":15,"../elements/FloatValue":18,"../elements/ProgressBar":19,"../elements/TextValue":20}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _FloatValue = require('../elements/FloatValue');

var _FloatValue2 = _interopRequireDefault(_FloatValue);

var _If = require('../If');

var _If2 = _interopRequireDefault(_If);

var _ProgressBar = require('../elements/ProgressBar');

var _ProgressBar2 = _interopRequireDefault(_ProgressBar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var OverallTab = function (_React$Component) {
    _inherits(OverallTab, _React$Component);

    function OverallTab() {
        _classCallCheck(this, OverallTab);

        return _possibleConstructorReturn(this, (OverallTab.__proto__ || Object.getPrototypeOf(OverallTab)).apply(this, arguments));
    }

    _createClass(OverallTab, [{
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

            if (this.props.tab != 'overall') {
                return null;
            }

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
                                _If2.default,
                                { test: settings.showKills.value },
                                React.createElement(_FloatValue2.default, { green: true, a: left.hits, b: right.hits, highlight: settings.highlightValue.value, text: "kills" })
                            ),
                            React.createElement(
                                _If2.default,
                                { test: settings.showDamagePerc.value },
                                React.createElement(_FloatValue2.default, { green: true, a: this.getPerc(left.damage, right.damage), b: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                            ),
                            React.createElement(_FloatValue2.default, { green: true, a: left.damage, b: right.damage, highlight: settings.highlightValue.value })
                        ),
                        React.createElement(
                            _If2.default,
                            { test: settings.showAverageDamage.value },
                            React.createElement(
                                'li',
                                null,
                                React.createElement(_FloatValue2.default, { green: true, a: left.avgHit, b: right.avgHit, highlight: settings.highlightValue.value })
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(_FloatValue2.default, { green: true, a: left.dps, b: right.dps, highlight: settings.highlightValue.value })
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
                            _If2.default,
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
                            React.createElement(_FloatValue2.default, { a: right.damage, b: left.damage, highlight: settings.highlightValue.value }),
                            React.createElement(
                                _If2.default,
                                { test: settings.showDamagePerc.value },
                                React.createElement(_FloatValue2.default, { b: this.getPerc(left.damage, right.damage), a: this.getPerc(right.damage, left.damage), highlight: settings.highlightValue.value, text: "%" })
                            ),
                            React.createElement(
                                _If2.default,
                                { test: settings.showKills.value },
                                React.createElement(_FloatValue2.default, { a: right.hits, b: left.hits, text: "kills", highlight: settings.highlightValue.value })
                            )
                        ),
                        React.createElement(
                            _If2.default,
                            { test: settings.showAverageDamage.value },
                            React.createElement(
                                'li',
                                null,
                                React.createElement(_FloatValue2.default, { a: right.avgHit, b: left.avgHit, highlight: settings.highlightValue.value })
                            )
                        ),
                        React.createElement(
                            'li',
                            null,
                            React.createElement(_FloatValue2.default, { a: right.dps, b: left.dps, highlight: settings.highlightValue.value })
                        )
                    )
                ),
                React.createElement(
                    'div',
                    { className: 'bel-col-1-1' },
                    React.createElement(
                        _If2.default,
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
                        React.createElement(_ProgressBar2.default, { a: left.damage, b: right.damage })
                    ),
                    React.createElement(
                        _If2.default,
                        { test: settings.showDpsBar.value },
                        React.createElement(_ProgressBar2.default, { a: left.dps, b: right.dps }),
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

    return OverallTab;
}(React.Component);

exports.default = OverallTab;

},{"../If":15,"../elements/FloatValue":18,"../elements/ProgressBar":19}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _If = require('../If');

var _If2 = _interopRequireDefault(_If);

var _TabSelector = require('./TabSelector');

var _TabSelector2 = _interopRequireDefault(_TabSelector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SummaryTab = function (_React$Component) {
    _inherits(SummaryTab, _React$Component);

    function SummaryTab() {
        _classCallCheck(this, SummaryTab);

        var _this = _possibleConstructorReturn(this, (SummaryTab.__proto__ || Object.getPrototypeOf(SummaryTab)).call(this));

        _this.state = {
            step: 0,
            progress: {
                current: 0,
                max: SERVER_DATA.zoneId + 1,
                status: "Fetching data"
            },
            tab: 'overall',
            division: 'overall'
        };

        _this.data = {
            left: null,
            right: null,
            data: null
        };

        return _this;
    }

    _createClass(SummaryTab, [{
        key: 'renderIndex',
        value: function renderIndex() {
            return React.createElement(
                'div',
                null,
                React.createElement(
                    'button',
                    { onClick: this.generateSummary.bind(this), className: 'bel-btn bel-btn-info' },
                    'Generate summary'
                )
            );
        }
    }, {
        key: 'renderProgress',
        value: function renderProgress() {
            var style = {
                width: Math.round(this.state.progress.current / this.state.progress.max * 100) + "%"
            };

            return React.createElement(
                'div',
                null,
                React.createElement(
                    'h4',
                    null,
                    this.state.progress.status
                ),
                React.createElement(
                    'div',
                    { className: 'bel-progress' },
                    React.createElement('div', { className: 'bel-progress-bar bel-teama', style: style })
                )
            );
        }
    }, {
        key: 'generateSummary',
        value: function generateSummary() {
            var _this2 = this;

            var self = this;
            self.state.step = 1;
            window.BattleEye.generateSummary();

            window.BattleEye.events.on('summary.update', function (step) {
                self.state.progress.status = 'Fetched round ' + step;
                self.state.progress.current = step;
            });

            window.BattleEye.events.on('summary.finished', function (_ref) {
                var _ref2 = _slicedToArray(_ref, 3);

                var left = _ref2[0];
                var right = _ref2[1];
                var rounds = _ref2[2];

                self.state.progress.status = 'Data fetching done. Organizing data';

                self.data.left = left;
                self.data.right = right;
                self.data.rounds = rounds;

                _this2.state.step = 2;
            });
        }
    }, {
        key: 'getStats',
        value: function getStats(side) {
            var content = [];
            var countries = [];

            // console.log(this.state.tab);

            if (this.state.tab.startsWith('round')) {
                var round = parseInt(this.state.tab.replace(/^\D+/g, ''));
                if (this.state.division.startsWith('div')) {
                    countries = this.data.rounds[round][side].divisions[this.state.division].countries;
                } else {
                    countries = this.data.rounds[round][side].countries;
                }
            } else {
                if (this.state.division.startsWith('div')) {
                    countries = this.data[side].divisions[this.state.division].countries;
                } else {
                    countries = this.data[side].countries;
                }
                // countries = this.data[side].divisions[this.state.tab].countries;
            }

            for (var i in countries) {
                var c = countries[i];

                content.push(React.createElement(
                    'div',
                    null,
                    React.createElement(
                        _If2.default,
                        { test: side == "right" },
                        React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side != "right" },
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-kills bel-value' },
                                c.kills.toLocaleString()
                            )
                        ),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-damage bel-value' },
                                c.damage.toLocaleString()
                            )
                        ),
                        React.createElement('span', { className: 'bel-spacer-sm' })
                    ),
                    React.createElement(
                        'b',
                        { className: 'bel-color-belize' },
                        i
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side == "left" },
                        React.createElement('div', { style: this.getFlagStyle(i), className: 'bel-country' })
                    ),
                    React.createElement(
                        _If2.default,
                        { test: side != "left" },
                        React.createElement('span', { className: 'bel-spacer-sm' }),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-damage bel-value' },
                                c.damage.toLocaleString()
                            )
                        ),
                        React.createElement(
                            'span',
                            { className: 'bel-stat-spacer' },
                            React.createElement(
                                'span',
                                { className: 'tooltip-kills bel-value' },
                                c.kills.toLocaleString()
                            )
                        )
                    ),
                    React.createElement('hr', { className: 'bel' })
                ));
            }

            return content;
        }
    }, {
        key: 'getRoundButtons',
        value: function getRoundButtons() {
            var tabs = [['overall', 'Battle Total']];

            for (var i = 1; i < SERVER_DATA.zoneId; i++) {
                tabs.push(['round' + i, 'Round ' + i]);
            }

            return tabs;
        }
    }, {
        key: 'getDivisionButtons',
        value: function getDivisionButtons() {
            var tabs = [['overall', 'Battle Total'], ['div1', 'DIV1'], ['div2', 'DIV2'], ['div3', 'DIV3'], ['div4', 'DIV4']];

            return tabs;
        }
    }, {
        key: 'changeRound',
        value: function changeRound(tab) {
            this.setState({
                tab: tab
            });
        }
    }, {
        key: 'changeDivision',
        value: function changeDivision(tab) {
            this.setState({
                division: tab
            });
        }
    }, {
        key: 'renderSummary',
        value: function renderSummary() {
            return React.createElement(
                'div',
                null,
                React.createElement(_TabSelector2.default, { changeTab: this.changeRound.bind(this), tab: this.state.tab, buttons: this.getRoundButtons() }),
                React.createElement(_TabSelector2.default, { changeTab: this.changeDivision.bind(this), tab: this.state.division, buttons: this.getDivisionButtons() }),
                React.createElement(
                    'div',
                    { className: 'bel-country-list' },
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
            if (this.props.tab != 'summary') {
                return null;
            }

            switch (this.state.step) {
                case 0:
                    return this.renderIndex();
                case 1:
                    return this.renderProgress();
                case 2:
                    return this.renderSummary();
                default:
                    return null;
            }
        }
    }]);

    return SummaryTab;
}(React.Component);

exports.default = SummaryTab;

},{"../If":15,"./TabSelector":28}],28:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TabSelector = function (_React$Component) {
    _inherits(TabSelector, _React$Component);

    function TabSelector() {
        _classCallCheck(this, TabSelector);

        return _possibleConstructorReturn(this, (TabSelector.__proto__ || Object.getPrototypeOf(TabSelector)).apply(this, arguments));
    }

    _createClass(TabSelector, [{
        key: "getButtons",
        value: function getButtons() {
            var buttons = [];

            for (var i in this.props.buttons) {
                var a = this.props.buttons[i];
                buttons.push(React.createElement(
                    "button",
                    { "data-tab": a[0], onClick: this.props.changeTab.bind(this, a[0]), className: this.getStyle(a[0]) },
                    a[1]
                ));
            }

            return buttons;
        }
    }, {
        key: "getStyle",
        value: function getStyle(tab) {
            if (this.props.tab == tab) {
                return "bel-btn bel-btn-default";
            }

            return "bel-btn bel-btn-grey";
        }
    }, {
        key: "render",
        value: function render() {
            return React.createElement(
                "div",
                { className: "bel-tabs" },
                this.getButtons()
            );
        }
    }]);

    return TabSelector;
}(React.Component);

exports.default = TabSelector;

},{}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _DivisionTab = require('./DivisionTab');

var _DivisionTab2 = _interopRequireDefault(_DivisionTab);

var _CountriesTab = require('./CountriesTab');

var _CountriesTab2 = _interopRequireDefault(_CountriesTab);

var _OverallTab = require('./OverallTab');

var _OverallTab2 = _interopRequireDefault(_OverallTab);

var _SummaryTab = require('./SummaryTab');

var _SummaryTab2 = _interopRequireDefault(_SummaryTab);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Tabs = function (_React$Component) {
    _inherits(Tabs, _React$Component);

    function Tabs() {
        _classCallCheck(this, Tabs);

        return _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).apply(this, arguments));
    }

    _createClass(Tabs, [{
        key: 'renderDivisions',
        value: function renderDivisions() {
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

                divs.push(React.createElement(_DivisionTab2.default, { tab: this.props.tab, data: divData, div: info, settings: this.props.settings }));
            }

            return divs;
        }
    }, {
        key: 'renderOverall',
        value: function renderOverall() {
            var data = {};
            data.left = this.props.data.left;
            data.right = this.props.data.right;

            return React.createElement(_OverallTab2.default, { tab: this.props.tab, data: data, settings: this.props.settings });
        }
    }, {
        key: 'renderCountries',
        value: function renderCountries() {
            var data = {};
            data.left = this.props.data.left;
            data.right = this.props.data.right;

            return React.createElement(_CountriesTab2.default, { tab: this.props.tab, data: data, settings: this.props.settings });
        }
    }, {
        key: 'renderSummary',
        value: function renderSummary() {
            return React.createElement(_SummaryTab2.default, { tab: this.props.tab });
        }
    }, {
        key: 'getContent',
        value: function getContent() {
            return React.createElement(
                'div',
                null,
                this.renderDivisions(),
                this.renderOverall(),
                this.renderCountries(),
                this.renderSummary()
            );
            // if(this.props.tab == 'div'){
            //     return this.renderDivisions();
            // }else if(this.props.tab == 'overall'){
            //     return this.renderOverall();
            // }else if(this.props.tab == 'countries'){
            //     return this.renderCountries();
            // }else if(this.props.tab == 'summary'){
            //     return this.renderSummary();
            // }
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

    return Tabs;
}(React.Component);

exports.default = Tabs;

},{"./CountriesTab":24,"./DivisionTab":25,"./OverallTab":26,"./SummaryTab":27}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Module2 = require('./Module');

var _Module3 = _interopRequireDefault(_Module2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AutoShooter = function (_Module) {
    _inherits(AutoShooter, _Module);

    function AutoShooter() {
        _classCallCheck(this, AutoShooter);

        return _possibleConstructorReturn(this, (AutoShooter.__proto__ || Object.getPrototypeOf(AutoShooter)).call(this, 'AutoShooter', 'Automatically shoots, when the FIGHT button is held'));
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
}(_Module3.default);

exports.default = AutoShooter;

},{"./Module":31}],31:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function () {
    function Module(name, description) {
        var autoload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

        _classCallCheck(this, Module);

        var self = this;
        self.name = name;
        self.desc = description;
        self.autoload = autoload;
    }

    _createClass(Module, [{
        key: "defineSettings",
        value: function defineSettings() {
            return [];
        }
    }, {
        key: "run",
        value: function run(settings) {
            return null;
        }
    }]);

    return Module;
}();

exports.default = Module;

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Module = require('./Module');

var _Module2 = _interopRequireDefault(_Module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModuleLoader = function () {
    function ModuleLoader() {
        _classCallCheck(this, ModuleLoader);

        this.modules = {};
    }

    _createClass(ModuleLoader, [{
        key: 'load',
        value: function load(module) {
            if (module instanceof _Module2.default) {
                this.modules[module.name] = module;
                var settings = module.defineSettings();
                for (var i in settings) {
                    var s = settings[i];
                    window.storage.define(s[0], s[1], module.name, s[2], s[3]);
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
                    if (this.modules[i].autoload) {
                        this.modules[i].run();
                    }
                } catch (e) {
                    console.error('Failed to run module ' + i + '!: ' + e);
                }
            }
        }
    }]);

    return ModuleLoader;
}();

exports.default = ModuleLoader;

},{"./Module":31}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Module2 = require('./Module');

var _Module3 = _interopRequireDefault(_Module2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Other = function (_Module) {
    _inherits(Other, _Module);

    function Other() {
        _classCallCheck(this, Other);

        return _possibleConstructorReturn(this, (Other.__proto__ || Object.getPrototypeOf(Other)).call(this, 'Other', 'Other miscellaneous enhancements'));
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
}(_Module3.default);

exports.default = Other;

},{"./Module":31}],34:[function(require,module,exports){
'use strict';

window.BattleEye = require('./BattleEye');

setTimeout(function () {
    window.BattleEye.overridePomelo();
}, 2000);

},{"./BattleEye":1}]},{},[34])


//# sourceMappingURL=build.js.map
