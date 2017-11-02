/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Module{
    constructor(name, description, autoload = true){
        var self = this;
        self.name = name;
        self.desc = description;
        self.autoload = autoload;
    }

    defineSettings(){
        return [];
    }

    run(settings){
        return null;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Module;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Storage{
    constructor(){
        var self = this;
        if(!self.checkIfStorageAvailable()){
            return false;
        }

        self.prepend = "battle_eye_";
        self.fields = {};
        self.defaults = {};
    }

    set(id, value){
        localStorage.setItem(`${this.prepend}${id}`, value);
    }

    get(id){
        var self = this;
        var val = localStorage.getItem(`${self.prepend}${id}`);

        switch(val){
            case 'true':
                val = true;
                break;
            case 'false':
                val = false;
                break;
        }

        return val;
    }

    has(field){
        var self = this;
        if(localStorage.getItem(`${self.prepend}${field}`)){
            return true;
        }

        return false;
    }

    define(id, value, group, name, desc){
        var self = this;

        self.defaults[id] = {
            id, name, desc, group, value
        }
    }

    loadSettings(){
        var self = this;

        for(var i in self.defaults){
            var field = self.defaults[i];

            if(self.fields[i] === undefined){
                self.fields[i] = {
                    id: field.id,
                    name: field.name,
                    desc: field.desc,
                    group: field.group
                };
            }

            if(!self.has(i)){
                self.set(i, field.value);
            }
        }
    }

    loadDefaults(){
        var self = this;

        for(var i in self.defaults){
            self.set(i, self.defaults[i].value);
        }
    }

    getAll(){
        var self = this;

        var object = {};

        for(var i in self.fields){
            var f = self.fields[i];

            object[i] = {field: f, value: self.get(f.id)};
        }

        return object;
    }

    checkIfStorageAvailable(){
        return (typeof(Storage) !== "undefined");
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Storage;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__HitHistory__ = __webpack_require__(7);


class DpsHandler{
    constructor(rem){
        this.rememberDpsFor = rem;
        this.hitHistory = new __WEBPACK_IMPORTED_MODULE_0__HitHistory__["a" /* default */](rem * 1000);
        this.hitStreakSeconds = 0;
        this.lastHit = 0;
        this.dps = 0;
    }

    addHit(damage){
        this.lastHit = window.BattleEye.second;
        this.hitHistory.add(damage);
    }

    updateDps(timeData){
        var recentDamage = this.hitHistory.getTotal();
        if(this.hitStreakSeconds < this.rememberDpsFor){
            this.hitStreakSeconds++;
        }

        this.dps = Math.round(recentDamage/this.hitStreakSeconds);
        if(timeData - this.lastHit >= 10){
            this.hitHistory.clear();
            this.hitStreakSeconds = 0;
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DpsHandler;



/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Utils__ = __webpack_require__(8);


class CountryStats{
    constructor(){
        this.countries = {};
    }

    handle(data, addKill = true, addDamage = true){
        var countrySlug = data.msg.permalink;

        if(!this.countries[countrySlug]){
            this.countries[countrySlug] = {
                damage: 0,
                kills: 0,
                name: __WEBPACK_IMPORTED_MODULE_0__Utils__["a" /* default */].prettifyCountryName(countrySlug)
            }
        }

        if(addDamage){
            this.countries[countrySlug].damage += data.msg.damage;
        }

        if(addKill){
            this.countries[countrySlug].kills += 1;
        }
    }

    handleBare(data){
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

    handleKills(country, value){
        if(!this.countries[country]){
            this.countries[country] = {
                damage: 0,
                kills: 0
            }
        }

        this.countries[country].kills += value;
    }

    getAll(){
        var self = this;
        var sorted = {};

        var keysSorted = Object.keys(self.countries).sort(function(a,b) {
            return self.countries[b].damage - self.countries[a].damage;
        });

        for(var i in keysSorted){
            var key = keysSorted[i];
            sorted[key] = self.countries[key];
        }
        return sorted;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = CountryStats;



/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_Storage__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__BattleEye__ = __webpack_require__(5);



function defineDefaultSettings(){
    var self = this;
    function define(settings){
        for(var i in settings){
            window.BattleEyeStorage.define.apply(window.BattleEyeStorage, settings[i]);
        }
    }

    var settings = [
        ['showOtherDivs', false, 'Structure', "Show other divisions", "You can select what divisions you want to see with the settings below."],
        ['showDiv1', true, 'Structure', "Show DIV 1"],
        ['showDiv2', true, 'Structure', "Show DIV 2"],
        ['showDiv3', true, 'Structure', "Show DIV 3"],
        ['showDiv4', true, 'Structure', "Show DIV 4"],
        ['showDomination', true, 'Structure', "Show domination", "Similar to damage, but takes domination bonus in count"],
        ['showAverageDamage', false, 'Structure', "Show average damage dealt"],
        ['showMiniMonitor', true, 'Structure', "Display a small division monitor on the battlefield"],
        ['showKills', false, 'Structure', "Show kills done by each division"],
        ['moveToTop', false, 'Structure', "Display BattleEye above the battlefield", '*Requires a page refresh'],
        ['gatherBattleStats', true, 'Performance', "Gather battle stats", "Displays total damage and kills since the beginning of the round. Disabling this will reduce the load time."],
        ['highlightDivision', true, 'Visual', "Highlight current division"],
        ['highlightValue', true, 'Visual', "Highlight winning side"],
        ['showDamageGraph', true, 'Structure', "Show damage pie charts", 'At the moment this feature is very unoptimized. May cause a preformance drop'],
        ['showDpsBar', true, 'Bars', "Show DPS bar"],
        ['showDamageBar', false, 'Bars', "Show Damage bar"],
        ['showDominationBar', true, 'Bars', "Show Domination bar"],
        ['largerBars', false, 'Bars', "Larger bars"],
        ['enableLogging', false, 'Other', "Enable logging to console"],
        ['enableBenchmarking', false, 'Other', "Enable performance logging to console"]
    ];

    define(settings);
}

window.BattleEyeStorage = new __WEBPACK_IMPORTED_MODULE_0__classes_Storage__["a" /* default */]();
defineDefaultSettings();
window.BattleEyeStorage.loadSettings();
window.BattleEyeSettings = window.BattleEyeStorage.getAll();

window.belLog = function(){
    [].unshift.call(arguments, '[BE]');
    if(window.BattleEyeSettings.enableLogging.value){
        console.log.apply(undefined, arguments);
    }
};

window.belTime = function(name){
    if(window.BattleEyeSettings.enableBenchmarking.value){
        console.time(name);
    }
};

window.belTimeEnd = function(name){
    if(window.BattleEyeSettings.enableBenchmarking.value){
        console.timeEnd(name);
    }
};

window.BattleEye = new __WEBPACK_IMPORTED_MODULE_1__BattleEye__["a" /* default */]();

setTimeout(function(){
    window.BattleEye.overridePomelo();
}, 2000);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__classes_Stats__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__classes_Layout__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__classes_Layout___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__classes_Layout__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__classes_Storage__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__classes_Stylesheet__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__classes_EventHandler__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__classes_modules_ModuleLoader__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__classes_modules_Other__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__classes_modules_PercentageFixer__ = __webpack_require__(16);










class BattleEye {
    constructor(){
        belTime('battleEyeConstructor');
        var self = this;
        window.BattleEye = this;
        window.viewData = {
            connected: true
        };

        this.second = 0;
        this.contributors = {};
        this.alerts = {};

        if(window.BattleEyeStorage === false){
            return console.error('LocalStorage is not available! Battle Eye initialisation canceled');
        }

        const modules = new __WEBPACK_IMPORTED_MODULE_5__classes_modules_ModuleLoader__["a" /* default */]();
              modules.load(new __WEBPACK_IMPORTED_MODULE_7__classes_modules_PercentageFixer__["a" /* default */]());
              modules.load(new __WEBPACK_IMPORTED_MODULE_6__classes_modules_Other__["a" /* default */]());

        window.BattleEyeStorage.loadSettings();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();

        this.events = new __WEBPACK_IMPORTED_MODULE_4__classes_EventHandler__["a" /* default */]();

        this.teamA = new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.leftBattleId);
        this.teamAName = SERVER_DATA.countries[SERVER_DATA.leftBattleId];
        this.teamB = new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.rightBattleId);
        this.teamBName = SERVER_DATA.countries[SERVER_DATA.rightBattleId];

        this.teamA.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
        this.teamB.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

        this.revolutionCountry = null;
        if(SERVER_DATA.isCivilWar){
            if(SERVER_DATA.invaderId == SERVER_DATA.leftBattleId){
                this.teamA.revolution = true;
                this.teamAName = `${this.teamBName} Revolution`;
                this.revolutionCountry = this.teamBName;
            }else{
                this.teamB.revolution = true;
                this.teamBName = `${this.teamAName} Revolution`;
                this.revolutionCountry = this.teamBName;
            }
        }

        pomelo.disconnect = () => {
            //tried to dc
            setTimeout(() => {
                window.viewData.connected = true;
            }, 2000);

            return;
        };

        this.events.on('layout.ready', (layout)=>{
            layout.update(self.getTeamStats());
            self.checkForUpdates();
            self.getNbpStats(SERVER_DATA.battleId).then((data)=>{
                if(!data.zone_finished){
                    self.loadBattleStats();
                }else{
                    $j('#bel-loading').hide();
                }
            });

            modules.run();
        });

        this.layout = new __WEBPACK_IMPORTED_MODULE_1__classes_Layout__["default"]({
            'teamAName': this.teamAName,
            'teamBName': this.teamBName,
            'version': GM_info.script.version,
            'revolutionCountry': this.revolutionCountry
        }, this);

        this.defineListeners();

        this.runTicker();

        this.handleEvents();
        belTimeEnd('battleEyeConstructor');
    }

    defineListeners(){
        var self = this;

        $j('.bel-settings-field').on('change', function(event) {
            var input = event.target;
            var value;

            if(input.type == "checkbox"){
                value = input.checked;
            }else{
                value = input.value;
            }

            window.BattleEyeStorage.set(input.name, value);
            window.BattleEyeSettings[input.name].value = value;

            var targetAtt = $j(this).attr('id');

            self.events.emit('log', `Updated setting ${input.name} to ${value}`);

            $j("label[for=\""+targetAtt+"\"]").notify("Saved", {position: "right middle", className: "success"});
        });
    }

    sortByValue(obj){
        var sorted = {};
        var sortedKeys = Object.keys(obj).sort((a,b) => {return obj[a]-obj[b];}).reverse();

        for(var i in sortedKeys){
        	sorted[sortedKeys[i]] = obj[sortedKeys[i]];
        }

        return sorted;
    }

    async getNbpStats(battleId) {
        const data = await $j.getJSON(`https://www.erepublik.com/en/military/nbp-stats/${battleId}`);
        return data;
    }

    exportStats(type, data){
        XlsxPopulate.fromBlankAsync()
        .then(workbook => {
            // Modify the workbook.
            var sheet = workbook.addSheet('Overall stats');
                sheet = this.statsToSheet(sheet, data);

            for (var i in data.rounds) {
                var round = data.rounds[i];

                var sheetName = `Round ${i} stats`;
                if (i%4 == 0){
                    sheetName += ' (AIR)';
                }

                var roundSheet = workbook.addSheet(sheetName);
                roundSheet = this.statsToSheet(roundSheet, round, i);
            }

            // Delete default sheet
            workbook.deleteSheet("Sheet1");

            workbook.outputAsync().then(blob => {
                if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                    // If IE, you must uses a different method.
                    window.navigator.msSaveOrOpenBlob(blob, `Battle${SERVER_DATA.battleId}_stats.xlsx`);
                } else {
                    var url = window.URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.href = url;
                    a.download = `Battle${SERVER_DATA.battleId}_stats.xlsx`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }
            });
        });
    }

    statsToSheet(sheet, stats, round) {
        var headingStyle = {
            fontSize: 20,
            verticalAlignment: 'center',
            horizontalAlignment: 'center'
        };

        sheet.range('A1:C1').merged(true).value(this.teamAName).style(headingStyle).style({'fontColor': '27ad60', 'bold': true});
        sheet.range('I1:K1').merged(true).value(this.teamBName).style(headingStyle).style({'fontColor': 'c1392b', 'bold': true});

        if (round%4 != 0){
            sheet.range('E1:G1').merged(true).value('Divisions').style(headingStyle).style({'fontColor': '27ad60', 'bold': true});
            sheet.range('M1:O1').merged(true).value('Divisions').style(headingStyle).style({'fontColor': 'c1392b', 'bold': true});
        }

        function setOverallStats(sheet, side, left = true){
            var titleRange = (left)?'A3:C3':'I3:K3';
            var valueRange = (left)?'A4:C4':'I4:K4';

            sheet.range(titleRange).value([
                ['Total damage', 'Total kills', 'Average damage']
            ]).style({bold: true, horizontalAlignment: 'center', fontColor: 'f7ad6f'});

            sheet.range(valueRange).value([
                [side.damage, side.hits, side.avgHit]
            ]).style({horizontalAlignment: 'center'});
        }

        setOverallStats(sheet, stats.left);
        setOverallStats(sheet, stats.right, false);

        sheet.range('B6:C6').value([['Damage', 'Kills']]).style({horizontalAlignment: 'center', fontColor: '68b5fc', bold: true});
        sheet.range('J6:K6').value([['Damage', 'Kills']]).style({horizontalAlignment: 'center', fontColor: '68b5fc', bold: true});

        function setCountryStats(sheet, side, left = true, air = false) {
            function range(row){
                if (air) {
                    return (left)?'A'+row+":C"+row:'E'+row+":G"+row;
                }

                return (left)?'A'+row+":C"+row:'I'+row+":K"+row;
            }

            function cell(a,b,i){
                return (left)?a + i:b + i;
            }

            var row = 7;
            for(var i in side.countries){
                var country = side.countries[i];

                sheet.range(range(row)).value([[country.name, country.damage, country.kills]]);

                if (air) {
                    sheet.cell(cell('A', 'E', row)).style({bold: true});
                } else {
                    sheet.cell(cell('A', 'I', row)).style({bold: true});
                }

                row++;
            }
        }

        function setDivisionStats(sheet, side, left = true) {
            function range(row){
                return (left)?'E'+row+":G"+row:'M'+row+":O"+row;
            }

            function cell(a,b,i){
                return (left)?a + i:b + i;
            }

            var row = 3;
            for (var i in side.divisions) {
                if (i == 'div11') continue;
                var div = side.divisions[i];

                sheet.range(range(row)).merged(true).value(i.toUpperCase()).style({verticalAlignment: 'center', horizontalAlignment: 'center', bold: true});
                row+=2;
                sheet.range(range(row)).value([['Total damage', 'Total kills', 'Average damage']]).style({horizontalAlignment: 'center', bold: true, fontColor: 'f7ad6f'});
                row+=1;
                sheet.range(range(row)).value([[div.damage, div.hits, div.avgHit]]).style({horizontalAlignment: 'center'});
                row+=2;

                sheet.range(range(row)).value([['','Damage','Kills']]).style({horizontalAlignment: 'center', fontColor: '68b5fc', bold: true});
                row+=1;

                for(var j in div.countries){
                    var country = div.countries[j];

                    sheet.range(range(row)).value([[country.name, country.damage, country.kills]]);
                    sheet.cell(cell('E', 'M', row)).style({bold: true});
                    row+=1;
                }
                row+=2;
            }
        }

        setCountryStats(sheet, stats.left, true);
        setCountryStats(sheet, stats.right, false);

        if (round%4 != 0){
            setDivisionStats(sheet, stats.left);
            setDivisionStats(sheet, stats.right, false);
        }

        sheet.row(1).height(30);

        for(var i = 1; i <= 16; i++){
            sheet.column(i).width(20);
        }

        // if air battle
        if (round % 4 == 0){
            var collapse = [5,6,7,8,13,14,16];
            for(var i in collapse){
                sheet.column(collapse[i]).width(1);
            }
        }

        return sheet;
    }

    processBattleStats(data, teamA, teamB){
        return new Promise((resolve, reject)=>{
            var divs = [1,2,3,4,11];
            var hit, dmg, i, bareData, killValue;

            if(!data){
                belLog('undefined data - returning');
                return resolve();
            }

            for(var d in divs){
                var div = divs[d];
                var leftDmg = 0;
                var rightDmg = 0;
                var leftKl = 0;
                var rightKl = 0;

                for(i in data.leftDamage['div' + div]){
                    hit = data.leftDamage['div' + div][i];
                    dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftDmg += dmg;

                    bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    teamA.countries.handleBare(bareData);
                    teamA.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(i in data.rightDamage['div' + div]){
                    hit = data.rightDamage['div' + div][i];
                    dmg = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    rightDmg += dmg;

                    bareData = {
                        damage: dmg,
                        permalink: hit.country_permalink
                    };

                    teamB.countries.handleBare(bareData);
                    teamB.divisions.get('div' + div).countries.handleBare(bareData);
                }

                for(i in data.leftKills['div' + div]){
                    hit = data.leftKills['div' + div][i];
                    killValue = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
                    leftKl += killValue;
                    teamA.countries.handleKills(hit.country_permalink, killValue);
                    teamA.divisions.get('div' + div).countries.handleKills(hit.country_permalink, killValue);
                }

                for(i in data.rightKills['div' + div]){
                    hit = data.rightKills['div' + div][i];
                    killValue = (Number.isInteger(hit.value))?hit.value:Number(hit.value.replace(/[,\.]/g,''));
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

    loadBattleStats(){
        var self = this;

        if(!window.BattleEyeSettings.gatherBattleStats.value){
            self.events.emit('log', 'Battle stat fetching canceled since the battle is over.');
            return $j('#bel-loading').hide();
        }

        self.getBattleStats().then((data)=>{
            self.events.emit('log', 'Battle stats fetched. Processing...');
            return self.processBattleStats(data, self.teamA, self.teamB);
        }).then(()=>{
            self.events.emit('log', 'Battle stats loaded.');
            self.events.emit('battlestats.loaded');
            $j('#bel-loading').hide();
            self.layout.update(self.getTeamStats());
        });
    }

    resetSettings(){
        window.BattleEyeStorage.loadDefaults();
        window.BattleEyeSettings = window.BattleEyeStorage.getAll();
    }

    checkForUpdates(){
        var self = this;
        return new Promise((resolve, reject)=>{
            $j.get('https://dl.dropbox.com/s/mz1p3g7pyiu69qx/data.json', function(data) {
                data = JSON.parse(data);
                self.contributors = data.contributors;
                self.alerts = data.alerts;
                self.displayContributors();

                var version = parseInt(data.version.replace(/\D/g,""));
                var currentVersion = parseInt(GM_info.script.version.replace(/\D/g,""));
                if(currentVersion != version){
                    document.querySelector('#bel-version .bel-alert').classList.add('bel-alert-danger');
                    document.querySelector('#bel-version').innerHTML += '<a class="bel-btn" href="'+data.updateUrl+'">Update</a>';
                }

                belLog('Data JSON received and processed');
                self.events.emit('log', 'Data.json synced');
                resolve(data);
            }).error(function(error){
                console.error('Failed to download data.json');
                reject(error);
            });
        });
    }

    generateSummary(){
        var self = this;
        var data = [];
        this.step = 1;
        self.events.emit('log', 'Generating summary...');
        var round = 1;
        function getStats(cb){
            var divRange = [1,2,3,4];
            if(round % 4 === 0){
                divRange = [11];
            }

            self.getBattleStats(round, divRange).then((stats)=>{
                self.events.emit('summary.update', round);
                data[round] = stats;
                round++;
                if(round <= SERVER_DATA.zoneId){
                    getStats(cb);
                }else{
                    cb();
                }
            });
        }

        getStats(()=>{
            // belLog(data);
            var left = new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.leftBattleId);
            var right = new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.rightBattleId);
            var rounds = [], round;

            left.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
            right.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

            async.eachOf(data, (roundStats, key, cb)=>{
                if(!roundStats) return cb();
                self.processBattleStats(roundStats, left, right).then(()=>{
                    rounds[key] = {
                        left: new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.leftBattleId),
                        right: new __WEBPACK_IMPORTED_MODULE_0__classes_Stats__["a" /* default */](SERVER_DATA.rightBattleId)
                    };

                    rounds[key].left.defender = (SERVER_DATA.defenderId == SERVER_DATA.leftBattleId);
                    rounds[key].right.defender = (SERVER_DATA.defenderId != SERVER_DATA.leftBattleId);

                    self.processBattleStats(roundStats, rounds[key].left, rounds[key].right).then(()=>{
                        self.events.emit('log', 'Processed round ' + (key+1));
                        cb();
                    });
                });
            }, ()=>{
                for(var i in rounds){
                    rounds[i].left = rounds[i].left.toObject();
                    rounds[i].right = rounds[i].right.toObject();
                }

                self.events.emit('summary.finished', [left.toObject(), right.toObject(), rounds, data]);
                self.events.emit('log', 'Summary data fetching done');
            });
        });
    }

    displayContributors(){
        $j('.bel-contributor').each(function() {
            $j(this).removeClass('bel-contributor')
                   .removeAttr('style')
                   .removeAttr('original-title');
        });

        for(var color in this.contributors){
            var players = this.contributors[color];
            for(var j in players){
                var cId = players[j];
                if(erepublik.citizen.citizenId == cId){
                    $j('#battleConsole .left_player .player_name').css({
                        textShadow: `0 0 10px ${color}`,
                        color: `${color}`
                    }).attr('original-title', "BattleEye contributor").tipsy();
                }else if($j('li[data-citizen-id="'+cId+'"] .player_name a').length > 0){
                    $j('li[data-citizen-id="'+cId+'"] .player_name a').css({
                        textShadow: " 0 0 10px " + color,
                        color: color
                    }).attr('original-title', "BattleEye contributor").addClass('bel-contributor').tipsy();
                }
            }
        }
    }

    getTeamStats(){
        return {
            left: this.teamA.toObject(),
            right: this.teamB.toObject()
        };
    }

    getBattleStats(round = SERVER_DATA.zoneId, divRange = null){
        var self = this;

        return new Promise((resolve, reject) => {

            var attacker = SERVER_DATA.leftBattleId;
            var defender = SERVER_DATA.rightBattleId;

            var leftDamage = {div1: [], div2: [], div3: [], div4: [], div11: []},
                rightDamage = {div1: [], div2: [], div3: [], div4: [], div11: []},
                leftKills = {div1: [], div2: [], div3: [], div4: [], div11: []},
                rightKills = {div1: [], div2: [], div3: [], div4: [], div11: []};

            var request = function(div,pageLeft,pageRight,type) {
                if(type === undefined){
                    type = 'damage';
                }

                return new Promise((resolve, reject) => {
                    $j.post('https://www.erepublik.com/en/military/battle-console',{
                        _token: SERVER_DATA.csrfToken,
                        action: 'battleStatistics',
                        battleId: SERVER_DATA.battleId,
                        division: div,
                        leftPage: pageLeft,
                        rightPage: pageRight,
                        round: round,
                        type: type,
                        zoneId: parseInt(round, 10)
                    }, function(data) {
                        resolve(data);
                    });
                });
            };

            var damageHandler = function(div, cb){
                var page = 1;
                var maxPage = 1;
                var i;

                async.doWhilst(function(whileCb){
                    request(div, page, page, 'damage').then((data) => {
                        for(i in data[attacker].fighterData){
                            leftDamage['div'+div].push(data[attacker].fighterData[i]);
                        }
                        for(i in data[defender].fighterData){
                            rightDamage['div'+div].push(data[defender].fighterData[i]);
                        }

                        maxPage = Math.max(data[attacker].pages, data[defender].pages);

                        if(window.BattleEyeSettings.enableLogging.value){
                            belLog('Finished damage page '+page+"/"+maxPage+" div"+div);
                            self.events.emit('log', `Fetched damage ${page}/${maxPage} for div${div}`);
                        }

                        page++;
                        whileCb();
                    });
                },function(){
                    return page <= maxPage;
                },function() {
                    cb();
                });
            };

            var killsHandler = function(div, cb){
                var page = 1;
                var maxPage = 1;

                async.doWhilst(function(whileCb){
                    request(div,page,page, 'kills').then((data) => {
                        for(var i in data[attacker].fighterData){
                            leftKills['div'+div].push(data[attacker].fighterData[i]);
                        }

                        for(var j in data[defender].fighterData){
                            rightKills['div'+div].push(data[defender].fighterData[j]);
                        }

                        maxPage = Math.max(data[attacker].pages, data[defender].pages);
                        if(window.BattleEyeSettings.enableLogging.value){
                            belLog('Finished kill page '+page+"/"+maxPage+" div"+div);
                            self.events.emit('log', `Fetched kills ${page}/${maxPage} for div${div}`);
                        }
                        page++;

                        whileCb();
                    });
                }, function(){
                    return page <= maxPage;
                }, function() {
                    cb();
                });
            };

            if(divRange === null){
                divRange = (SERVER_DATA.division == 11)?[11]:[1,2,3,4];
            }

            async.each(divRange, damageHandler.bind(self), function(){
                async.each(divRange, killsHandler.bind(self), function(){
                    resolve({leftDamage, rightDamage, leftKills, rightKills});
                });
            });
        });
    }

    runTicker(){
        var ticker = () => {
            this.second++;
            this.events.emit('tick', this.second);
        };

        this.interval = setInterval(ticker.bind(this), 1000);
    }

    handleEvents(){
        var handleTick = function(second){
            if(second % 3 === 0 && self.updateContributors){
                this.updateContributors = false;
                this.displayContributors();
            }
            this.teamA.updateDps(second);
            this.teamB.updateDps(second);
            this.layout.update(this.getTeamStats());
        };

        this.events.on('tick', handleTick.bind(this));
    }

    overridePomelo(){
        var messageHandler = data => {
            this.updateContributors = true;
            this.handle(data);
		};

        var closeHandler = data => {
            belLog('Socket closed ['+data.reason+']');
            window.viewData.connected = false;
            this.layout.update(this.getTeamStats());
        };

        pomelo.on('onMessage', messageHandler.bind(this));
        pomelo.on('close', closeHandler.bind(this));
    }

    handle(data){
        this.teamA.handle(data);
        this.teamB.handle(data);
        // this.layout.update(this.getTeamStats());
        window.viewData.connected = true;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = BattleEye;



/***/ }),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DpsHandler__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__CountryStats__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__Divisions__ = __webpack_require__(9);




class Stats extends __WEBPACK_IMPORTED_MODULE_0__DpsHandler__["a" /* default */]{
    constructor(id){
        super(10);

        this.countries = new __WEBPACK_IMPORTED_MODULE_1__CountryStats__["a" /* default */]();
        this.id = id;
        this.damage = 0;
        this.hits = 0;
        this.constructDivisions();
        this.revolution = false;
        this.defender = false;
    }

    constructDivisions(){
        this.divisions = new __WEBPACK_IMPORTED_MODULE_2__Divisions__["a" /* default */]();

        this.divisions.create('div1', 1);
        this.divisions.create('div2', 2);
        this.divisions.create('div3', 3);
        this.divisions.create('div4', 4);
        this.divisions.create('div11', 11);
    }

    isSide(side){
        return this.id == side;
    }

    updateDps(timeData){
        super.updateDps(timeData);
        this.divisions.updateDps(timeData);
    }

    handle(data){
        if(!this.isSide(data.side)){
            return;
        }

        this.divisions.handle(data);

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    toObject(){
        // console.log('dps', this.dps);
        return {
            'damage': this.damage,
            'id': this.id,
            'dps': this.dps,
            'hits': this.hits,
            'avgHit': Math.round(this.damage/this.hits),
            'divisions': this.divisions.toObject(),
            'countries': this.countries.getAll(),
            'revolution': this.revolution
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Stats;



/***/ }),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class HitHistory{
    constructor(rememberFor = 30000){
        this.rememberFor = rememberFor;
        this.history = {};
    }

    add(hit){
        var time = new Date().getTime();
        this.history[time] = hit;
        this.trimOld(time);
    }

    trimOld(time = new Date().getTime()){
        for(var i in this.history){
            if(time - i - this.rememberFor > 0){
                delete this.history[i];
            }
        }
    }

    clear(){
        this.history = {};
    }

    getTotal(){
        this.trimOld();

        var total = 0;
        for(var i in this.history){
            total += this.history[i];
        }
        return total;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = HitHistory;



/***/ }),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class Utils
{
    uid() {
        return ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    }

    prettifyCountryName(country) {
        var prettyName = country;
        if (prettyName === "Republic-of-Macedonia-FYROM") {
            prettyName = "Republic-of-Macedonia";
        }

        prettyName = prettyName.replace(/\-/g, ' ');

        return prettyName;
    }
}

/* harmony default export */ __webpack_exports__["a"] = (new Utils());


/***/ }),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DivisionStats__ = __webpack_require__(10);


class Divisions{
    constructor(){
        var self = this;
        this.divisions = {};
    }

    create(id, division){
        this.divisions[id] = new __WEBPACK_IMPORTED_MODULE_0__DivisionStats__["a" /* default */](division);
        return this.divisions[id];
    }

    get(id){
        return this.divisions[id];
    }

    handle(data){
        for(var i in this.divisions){
            this.divisions[i].handle(data);
        }
    }

    updateDps(time){
        for(var i in this.divisions){
            this.divisions[i].updateDps(time);
        }
    }

    toObject(){
        var object = {};
        for(var i in this.divisions){
            object[i] = this.divisions[i].toObject();
        }

        return object;
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Divisions;



/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__DpsHandler__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__CountryStats__ = __webpack_require__(3);



class DivisionStats extends __WEBPACK_IMPORTED_MODULE_0__DpsHandler__["a" /* default */]{
    constructor(division){
        super(10);
        this.division = division;
        this.hits = 0;
        this.damage = 0;
        this.countries = new __WEBPACK_IMPORTED_MODULE_1__CountryStats__["a" /* default */]();
    }

    handle(data){
        if(data.division != this.division){
            return;
        }

        this.addHit(data.msg.damage);
        this.hits++;
        this.damage += data.msg.damage;
        this.countries.handle(data);
    }

    toObject(){
        return {
            'damage': this.damage,
            'id': this.id,
            'dps': this.dps,
            'hits': this.hits,
            'avgHit': Math.round(this.damage/this.hits) | 0,
            'countries': this.countries.getAll()
        };
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = DivisionStats;



/***/ }),
/* 11 */
/***/ (function(module, exports) {

throw new Error("Module parse failed: Unexpected token (35:24)\nYou may need an appropriate loader to handle this file type.\n| \r\n|     update(feedData){\r\n|         ReactDOM.render(<Template settings={window.BattleEyeSettings} viewData={window.viewData} feedData={feedData} headerData={this.headerData} />, this.battleEye);\r\n|         ReactDOM.render(<MiniMonitor settings={window.BattleEyeSettings} feedData={feedData} />, this.miniMonitor);\r\n|     }\r");

/***/ }),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class StyleSheet{
    constructor(){
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

            @keyframes connectionAlert{
                49%{
                    background-color: #34495e;
                }
                50%{
                    background-color: #e74c3c;
                }
            }

            .bel-disconnectedAlert{
                animation: connectionAlert 1s infinite;
            }

            .bel-status-log{
                padding: 2px;
                text-align: right;
                margin: 4px 0;
                font-size: 0.8em;
                color: #8c8c8c;
                width: 100%;
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

            .bel-margin-r-10 {
                margin-right: 10px;
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

            .bel-stat-spacer{
                padding-right: 2px;
                padding-left: 2px;
            }

            .bel-color-emerald{
                color: #2ecc71;
            }

            .bel-color-belize{
                color: #2980b9;
            }

            .bel-color-amethyst{
                color: #9b59b6;
            }

            .bel-spacer-sm{
                display: inline-block;
                width: 15px;
            }

            .bel-chart-tooltip{
                background-color: #fff;
                padding: 5px;
                border-radius: 5px;
                border: 2px solid #e0e0e0;
            }
        `;

        this.addCSSRule('.clearfix:after', `
            content: "";
            display: table;
            clear: both;
        `);

        this.addCSSRule('.bel-alert', `
            background-color: #34495e;
            color:#ecf0f1;
            padding: 3px 8px;
            border-radius:4px;
            margin-right:4px;
        `);

        this.addCSSRule('.bel-alert-danger', `
            background-color: #e74c3c;
        `);


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
            background-image: url("https://dl.dropbox.com/s/atksgh3abnxh1qm/sprites.png");
            background-repeat: no-repeat;
            background-position: 0 0;
            content: " ";
            opacity: 0.6;
        `);

        this.addCSSRule('#bel-battle-history')

        //General
        //

        this.addCSSRule('#bel-minimonitor', `
            position: absolute;
            right: 0;
        `);

        this.addCSSRule('.bel-country-list', `
            max-height: 400px;
            overflow-y: scroll;
        `);

        this.addCSSRule('.bel-minimonitor', `
            position: absolute;
            width: 140px;
            background-color: rgba(52, 73, 94, 0.7);
            right: 0;
            color: #ecf0f1;
            top: 60px;
            padding: 2px;
        `);

        this.addCSSRule('.bel-div', `
            background-image: url("https://dl.dropbox.com/s/qitlbj5b0dokpk8/divs.png");
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

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before',
            '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
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

        this.addCSSRule('.bel-hidden',`
            display: none;
        `)

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

    load(){
        $j('head').append(`<style>${this.sheet}</style>`);
    }
}

/* unused harmony default export */ var _unused_webpack_default_export = (new StyleSheet());


/***/ }),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
class EventHandler{
    constructor(){
        this.events = {};
    }

    emit(eventName, data){
        if(this.events[eventName]){
            this.events[eventName].forEach(function(fn){
                return fn(data);
            });
        }
    }

    on(eventName, closure){
        this.events[eventName] = this.events[eventName] || [];
        this.events[eventName].push(closure);
    }

    off(eventName, closure){
        if(this.events[eventName]){
            for(var i in this.events[eventName]){
                var event = this.events[eventName][i];
                if(event == closure){
                    this.events[eventName].splice(i,1);
                }
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = EventHandler;



/***/ }),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Module__ = __webpack_require__(0);


class ModuleLoader{
    constructor(){
        this.modules = {};
    }

    load(module){
        if(module instanceof __WEBPACK_IMPORTED_MODULE_0__Module__["a" /* default */]){
            this.modules[module.name] = module;
            var settings = module.defineSettings();
            for(var i in settings){
                var s = settings[i];
                window.BattleEyeStorage.define(s[0], s[1], module.name, s[2], s[3]);
            }
        }
    }

    get(name){
        return this.modules[name];
    }

    run(){
        for(var i in this.modules){
            try{
                if(this.modules[i].autoload){
                    this.modules[i].run();
                }
            }catch(e){
                console.error(`Failed to run module ${i}!: ${e}`);
            }
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = ModuleLoader;



/***/ }),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Module__ = __webpack_require__(0);


class Other extends __WEBPACK_IMPORTED_MODULE_0__Module__["a" /* default */]{
    constructor(){
        super('Other', 'Other miscellaneous enhancements');
    }

    defineSettings(){
        return [
            ['otherFixCometchat', true, "Cometchat fix", "Removes the fading, clickblocking line from the bottom of the screen. (Requires a page refresh)"],
        ];
    }

    run(){
        if(window.BattleEyeSettings.otherFixCometchat.value){
            //Removing that annoying cometchat background
            var waitForCometchat = setInterval(fixCometchat, 500);
            var fixCometchat = function(){
                var cometchat = document.getElementById('cometchat_base');
                if(cometchat !== null){
                    var style = "width:auto;position:aboslute;right:0;background:none;";
                    cometchat.setAttribute('style', style);
                    clearInterval(waitForCometchat);
                }
            };
        }
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = Other;



/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__Module__ = __webpack_require__(0);


class PercentageFixer extends __WEBPACK_IMPORTED_MODULE_0__Module__["a" /* default */]{
    constructor(){
        super('Percentage Fixer', '');
    }

    defineSettings(){
        return [
            ['percFixEnabled', true, "Enable percentage fixer", "Temporary solution to eRepublik's battle stat inconsistencies"]
        ];
    }

    round(num, acc = 100000){
        return Math.round(num*acc)/acc;
    }

    dif(target, a, b){
        return Math.round(Math.abs(target - (a * 100 / (a + b)))*100000)/100000;
    }

    calculateFix(targetPerc, leftDamage, rightDamage){
        if(SERVER_DATA.mustInvert){
            targetPerc = 100 - targetPerc;
        }

        var simulatedLeftDmg = leftDamage;
        var totalFix = 0;
        var loops = 0;

        while(this.dif(targetPerc, simulatedLeftDmg, rightDamage) > 0.05){
            var leftPerc = simulatedLeftDmg * 100 / (simulatedLeftDmg + rightDamage);
            var fix = Math.round(simulatedLeftDmg * targetPerc / leftPerc - simulatedLeftDmg);
            simulatedLeftDmg+=fix;
            totalFix+=fix;
            loops++;
        }

        var originalDif = this.dif(targetPerc, leftDamage, rightDamage);
        var currentDif = this.dif(targetPerc, simulatedLeftDmg, rightDamage);

        belLog('Improved from', originalDif, 'to', currentDif, 'Loops:', loops);

        return Math.round(totalFix);
    }

    run(){
        var self = this;
        if(!window.BattleEyeSettings.percFixEnabled.value){
            return;
        }

        window.BattleEye.events.on('battlestats.loaded', ()=>{
            var left = window.BattleEye.teamA.toObject();
            var right = window.BattleEye.teamB.toObject();

            var divs, i, leftdmg, rightdmg;
            if(SERVER_DATA.division === 11){
                divs = [11];
            }else{
                divs = [1,2,3,4];
            }

            window.BattleEye.getNbpStats(SERVER_DATA.battleId).then((stats)=>{
                var currentInvader = stats.division.domination;
                var fix, currentDomination, logmsg, inaccuracy, loops;

                for(i in divs){
                    leftdmg = left.divisions['div' + divs[i]].damage;
                    rightdmg = right.divisions['div' + divs[i]].damage;

                    var targetPerc = currentInvader[divs[i]];
                    fix = self.calculateFix(targetPerc, leftdmg, rightdmg);

                    window.BattleEye.teamA.divisions.get('div' + divs[i]).damage += fix;
                    logmsg = `Added ${fix.toLocaleString()} damage to div${divs[i]}`;
                    belLog(logmsg);
                }
            });

        });
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = PercentageFixer;



/***/ })
/******/ ]);