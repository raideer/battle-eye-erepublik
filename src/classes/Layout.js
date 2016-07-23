class Layout{
    constructor(style, headerData, settings){
        var self = this;
        self.settings = settings;

        Handlebars.registerHelper('percentage', function(a, b, options) {
            var aPerc = 0;
            var bPerc = 0;

            if(a+b !== 0){
                aPerc = Math.round((a * 100 / (a+b))*10)/10;
                bPerc = Math.round((b * 100 / (a+b))*10)/10;
            }

            return options.fn({a: aPerc, b: bPerc});
        });

        Handlebars.registerHelper('number', function(number) {
          return parseFloat(number).toLocaleString();
        });

        Handlebars.registerHelper('forEachDiv', function(left, right, options) {
            var divs = ['air', 'div1', 'div2', 'div3', 'div4'];
            var divInfo = [[11,'Air'], [1,'Division 1'], [2,'Division 2'], [3,'Division 3'], [4,'Division 4']];

            var showAverage = self.settings.all.showAverageDamage.value;
            var showKills = self.settings.all.showKills.value;
            var showDpsBar = self.settings.all.showDpsBar.value;
            var showDamageBar = self.settings.all.showDamageBar.value;
            var hideOtherDivs = self.settings.all.hideOtherDivs.value;
            var highlightDivision = settings.all.highlightDivision.value;

            var str = '';
            for(var i in divs){
                var div = divs[i];
                var highlight = false;

                if(hideOtherDivs){
                    if(divInfo[i][0] != unsafeWindow.SERVER_DATA.division){
                        continue;
                    }
                }

                if(highlightDivision){
                    if(divInfo[i][0] == unsafeWindow.SERVER_DATA.division){
                        highlight = true;
                    }
                }


                str += options.fn({left: left.divisions[div],
                    right: right.divisions[div],
                    div: divInfo[i][1],
                    highlight: highlight,
                    showAverage: showAverage,
                    showKills: showKills,
                    showDpsBar, showDamageBar});
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

        document.querySelector('#battle-eye-settings').addEventListener("click", function() {
            document.querySelector('#bel-settings-modal').classList.toggle('bel-hidden');
        });

        document.querySelector('#bel-close-modal').addEventListener("click", function() {
            document.querySelector('#bel-settings-modal').classList.add('bel-hidden');
        });
    }

    update(data){
        var self = this;
        if(data === null){
            data = this.lastData;
        }else{
            this.lastData = data;
        }

        var html = this.feedTemplate(data);
        document.getElementById('battle_eye_feed').innerHTML = html;
    }

    createSettingsModal(){
        return `
            <div id="bel-settings-modal" class="bel-settings bel-hidden">
                <button id="bel-close-modal" class="bel-btn bel-btn-default" style="margin-top: -3px;float:right;">Close</button>
                <div class="bel-grid">
                    <div class="bel-col-1-2">
                        {{#each all}}
                            <div class="bel-checkbox">
                                <input type="checkbox" class="bel-settings-field"
                                {{#if value}}
                                    checked
                                {{/if}}
                                id="{{field.field}}" name="{{field.field}}">
                                <label for="{{field.field}}">
                                    {{field.name}}
                                </label>
                                <div class="bel-field-description">
                                    {{field.desc}}
                                </div>
                            </div>
                        {{/each}}
                    </div>
                </div>
            </div>
        `;
    }

    compileHeader(){
        var html = `
            <ul class="list-unstyled list-inline text-left bel-header-menu" style="padding-bottom:6px; border-bottom: 1px solid #ecf0f1;">
                <li>
                    <span class="bel-version">{{version}}</span> BATTLE EYE LIVE
                </li>

                <li style="float:right;">
                    <button id="battle-eye-settings" class="bel-btn bel-btn-default" style="margin-top: -3px;">Settings</button>
                </li>
            </ul>

            <div class="bel-grid">
                <div class="bel-col-1-2 text-left" style="color:#27ae60;font-weight:700;font-size:1.3em;">
                    {{teamAName}}
                </div>
                <div class="bel-col-1-2 text-right" style="color:#c0392b;font-weight:700;font-size:1.3em;">
                    {{teamBName}}
                </div>
            </div>
        `;

        return html;
    }

    compileFeed(){
        var html = `
            <div class="bel-grid">
                {{#forEachDiv left right}}
                    <div class="bel-col-1-1 text-center bel-title
                    {{#if highlight}}
                        bel-highlight-title
                    {{/if}}
                    ">
                        {{div}}
                    </div>
                    <div class="bel-col-1-3 text-right">
                        <ul class="list-unstyled">
                            <li>
                                {{#if showKills}}
                                    <span class="bel-value">{{number left.hits}} kills</span>
                                {{/if}}
                                <span class="bel-value">{{number left.damage}}</span>
                            </li>

                            {{#if showAverage}}
                                <li><span class="bel-value">{{number left.avgHit}}</span></li>
                            {{/if}}

                            <li><span class="bel-value">{{number left.dps}}</span></li>
                        </ul>
                    </div>
                    <div class="bel-col-1-3 text-center">
                        <ul class="list-unstyled
                        {{#if highlight}}
                            bel-highlight
                        {{/if}}
                        " style="font-weight:700;">
                            <li>Total Damage</li>
                            {{#if showAverage}}
                                <li>Average Damage</li>
                            {{/if}}
                            <li>DPS</li>
                        </ul>
                    </div>
                    <div class="bel-col-1-3 text-left">
                        <ul class="list-unstyled">
                            <li>
                                <span class="bel-value">{{number right.damage}}</span>
                                {{#if showKills}}
                                    <span class="bel-value">{{number right.hits}} kills</span>
                                {{/if}}
                            </li>
                            {{#if showAverage}}
                                <li><span class="bel-value">{{number right.avgHit}}</span></li>
                            {{/if}}
                            <li><span class="bel-value">{{number right.dps}}</span></li>
                        </ul>
                    </div>
                    <div class="bel-col-1-1">
                        {{#if showDamageBar}}
                            <div class="bel-progress">
                                <div class="bel-progress-center-marker"></div>
                                {{#percentage left.damage right.damage}}
                                    <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                                    <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                                {{/percentage}}
                            </div>
                        {{/if}}
                        {{#if showDpsBar}}
                            <div class="bel-progress">
                                <div class="bel-progress-center-marker"></div>
                                {{#percentage left.dps right.dps}}
                                    <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                                    <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                                {{/percentage}}

                            </div>
                        {{/if}}
                    </div>
                {{/forEachDiv}}
            </div>
        `;
        return html;
    }


}
