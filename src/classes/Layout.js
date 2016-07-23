class Layout{
    constructor(style, headerData, settings){
        var self = this;

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
            var divName = ['Air Force', 'Division 1','Division 2','Division 3','Division 4'];

            var str = '';
            for(var i in divs){
                var div = divs[i];
                str += options.fn({left: left.divisions[div], right: right.divisions[div], div: divName[i]});
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
        document.getElementById('battle_eye_header').innerHTML = self.headerTemplate(headerData);
        document.getElementById('container').innerHTML += self.settingsTemplate(settings);
        modals.init();
    }

    update(data){
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
            <div class="modal bel-modal" data-modal-window id="battle-eye-settings-modal">
                <a class="close" data-modal-close>x</a>
                <h3>Battle Eye settings</h3>
                {{#each all}}
                    <p>{{field}}</p>
                {{/each}}

                <button data-modal-close>Close</button>
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
                    <button data-modal="#battle-eye-settings-modal" id="battle-eye-settings" class="bel-btn bel-btn-default" style="margin-top: -3px;">Settings</button>
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
                    <div class="bel-col-1-1 text-center bel-title">
                        {{div}}
                    </div>
                    <div class="bel-col-1-3 text-right">
                        <ul class="list-unstyled">
                            <li>
                                <span class="bel-value">{{number left.hits}} kills</span>
                                <span class="bel-value">{{number left.damage}}</span>
                            </li>
                            <!-- <li><span class="bel-value">{{number left.avgHit}}</span></li> -->
                            <li><span class="bel-value">{{number left.dps}}</span></li>
                        </ul>
                    </div>
                    <div class="bel-col-1-3 text-center">
                        <ul class="list-unstyled" style="font-weight:700;">
                            <li>Total Damage</li>
                            <!-- <li>Average Damage</li> -->
                            <li>DPS</li>
                        </ul>
                    </div>
                    <div class="bel-col-1-3 text-left">
                        <ul class="list-unstyled">
                            <li>
                                <span class="bel-value">{{number right.damage}}</span>
                                <span class="bel-value">{{number right.hits}} kills</span>
                            </li>
                            <!-- <li><span class="bel-value">{{number right.avgHit}}</span></li> -->
                            <li><span class="bel-value">{{number right.dps}}</span></li>
                        </ul>
                    </div>
                    <div class="bel-col-1-1">
                        <!-- <div class="bel-progress">
                            <div class="bel-progress-center-marker"></div>
                            {{#percentage left.damage right.damage}}
                                <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                                <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                            {{/percentage}}
                        </div> -->
                        <div class="bel-progress">
                            <div class="bel-progress-center-marker"></div>
                            {{#percentage left.dps right.dps}}
                                <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                                <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                            {{/percentage}}
                        </div>
                    </div>
                {{/forEachDiv}}
            </div>
        `;
        return html;
    }


}