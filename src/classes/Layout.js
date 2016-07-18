class Layout{
    constructor(style){
        Handlebars.registerHelper('percentage', function(a, b, options) {
            var aPerc = 0;
            var bPerc = 0;
            if(a+b != 0){
                aPerc = Math.round((a * 100 / (a+b))*10)/10;
                bPerc = Math.round((b * 100 / (a+b))*10)/10;
            }

            return options.fn({a: aPerc, b: bPerc});
        });

        Handlebars.registerHelper('number', function(number) {
          return parseFloat(number).toLocaleString();
        });

        this.template = Handlebars.compile(this.createLayout());
        var el = document.createElement('div');
        el.setAttribute('id', 'battle_eye_live');
        document.getElementById('content').appendChild(el);
        style.load();
    }

    update(data){
        if(data == null){
            data = this.lastData;
        }else{
            this.lastData = data;
        }

        data.version = GM_info.script.version;

        var html = this.template(data);
        document.getElementById('battle_eye_live').innerHTML = html;
    }

    createLayout(){
        var l = `
            <div class="text-left"><span class="bel-version">{{version}}</span> BATTLE EYE LIVE</div>
            <div class="bel-grid">
                <div class="bel-col-1-2 text-left" style="color:#27ae60;font-weight:700;font-size:1.3em;">
                    {{teamAName}}
                </div>
                <div class="bel-col-1-2 text-right" style="color:#c0392b;font-weight:700;font-size:1.3em;">
                    {{teamBName}}
                </div>
                <div class="bel-col-1-1 text-center bel-title">
                    DIV 1
                </div>
                <div class="bel-col-1-3 text-right">
                    <ul class="list-unstyled">
                        <li>
                            <span class="bel-value">{{number left.divisions.div1.hits}} kills</span>
                            <span class="bel-value">{{number left.divisions.div1.damage}}</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number left.divisions.div1.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number left.divisions.div1.dps}}</span></li>
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
                            <span class="bel-value">{{number right.divisions.div1.damage}}</span>
                            <span class="bel-value">{{number right.divisions.div1.hits}} kills</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number left.divisions.div1.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number right.divisions.div1.dps}}</span></li>
                    </ul>
                </div>
                <div class="bel-col-1-1">
                    <!-- <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div1.damage right.divisions.div1.damage}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div> -->
                    <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div1.dps right.divisions.div1.dps}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div>
                </div>

                <div class="bel-col-1-1 text-center bel-title">
                    DIV 2
                </div>
                <div class="bel-col-1-3 text-right">
                    <ul class="list-unstyled">
                        <li>
                            <span class="bel-value">{{number left.divisions.div2.hits}} kills</span>
                            <span class="bel-value">{{number left.divisions.div2.damage}}</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number left.divisions.div2.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number left.divisions.div2.dps}}</span></li>
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
                            <span class="bel-value">{{number right.divisions.div2.damage}}</span>
                            <span class="bel-value">{{number right.divisions.div2.hits}} kills</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number right.divisions.div2.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number right.divisions.div2.dps}}</span></li>
                    </ul>
                </div>
                <div class="bel-col-1-1">
                    <!-- <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div2.damage right.divisions.div2.damage}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div> -->

                    <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div2.dps right.divisions.div2.dps}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div>
                </div>

                <div class="bel-col-1-1 text-center bel-title">
                    DIV 3
                </div>
                <div class="bel-col-1-3 text-right">
                    <ul class="list-unstyled">
                        <li>
                            <span class="bel-value">{{number left.divisions.div3.hits}} kills</span>
                            <span class="bel-value">{{number left.divisions.div3.damage}}</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number left.divisions.div3.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number left.divisions.div3.dps}}</span></li>
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
                            <span class="bel-value">{{number right.divisions.div3.damage}}</span>
                            <span class="bel-value">{{number right.divisions.div3.hits}} kills</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number right.divisions.div3.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number right.divisions.div3.dps}}</span></li>
                    </ul>
                </div>
                <div class="bel-col-1-1">
                    <!-- <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div3.damage right.divisions.div3.damage}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div> -->

                    <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div3.dps right.divisions.div3.dps}}
                            <div class="bel-progress-bar" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div>
                </div>

                <div class="bel-col-1-1 text-center bel-title">
                    DIV 4
                </div>
                <div class="bel-col-1-3 text-right">
                    <ul class="list-unstyled">
                        <li>
                            <span class="bel-value">{{number left.divisions.div4.hits}} kills</span>
                            <span class="bel-value">{{number left.divisions.div4.damage}}</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number left.divisions.div4.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number left.divisions.div4.dps}}</span></li>
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
                            <span class="bel-value">{{number right.divisions.div4.damage}}</span>
                            <span class="bel-value">{{number right.divisions.div4.hits}} kills</span>
                        </li>
                        <!-- <li><span class="bel-value">{{number right.divisions.div4.avgHit}}</span></li> -->
                        <li><span class="bel-value">{{number right.divisions.div4.dps}}</span></li>
                    </ul>
                </div>
                <div class="bel-col-1-1">
                    <!-- <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div4.damage right.divisions.div4.damage}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div> -->

                    <div class="bel-progress">
                        <div class="bel-progress-center-marker"></div>
                        {{#percentage left.divisions.div4.dps right.divisions.div4.dps}}
                            <div class="bel-progress-bar bel-teama" style="width: {{a}}%;"></div>
                            <div class="bel-progress-bar bel-teamb" style="width: {{b}}%;"></div>
                        {{/percentage}}
                    </div>
                </div>
            </div>
        `;
        // l += '<table id="bel-table">';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.damage}}</td>';
        //         l += '<td class="bel-title text-center">Total damage</td>';
        //         l += '<td class="bel-value text-left">{{right.damage}}</td>';
        //     l += '</tr>';
        //     l += '<tr style="color:#e74c3c;">';
        //         l += '<td class="bel-value text-right">{{left.dps}}</td>';
        //         l += '<td class="bel-title text-center"><i>Damage Per Second</i> (DPS)</td>';
        //         l += '<td class="bel-value text-left">{{right.dps}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.avgHit}}</td>';
        //         l += '<td class="bel-title text-center">Average hit</td>';
        //         l += '<td class="bel-value text-left">{{right.avgHit}}</td>';
        //     l += '</tr>';
        //     l += '<tr></tr>';
        //     l += '<tr style="color:#9b59b6;">';
        //         l += '<td class="bel-value text-right">{{left.divisions.div4.damage}}</td>';
        //         l += '<td class="bel-title text-center">Total D4 damage</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div4.damage}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div3.damage}}</td>';
        //         l += '<td class="bel-title text-center">Total D3 damage</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div3.damage}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div2.damage}}</td>';
        //         l += '<td class="bel-title text-center">Total D2 damage</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div2.damage}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div1.damage}}</td>';
        //         l += '<td class="bel-title text-center">Total D1 damage</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div1.damage}}</td>';
        //     l += '</tr>';
        //     l += '<tr style="color:#9e71f9;">';
        //         l += '<td class="bel-value text-right">{{left.divisions.div4.dps}}</td>';
        //         l += '<td class="bel-title text-center">D4 DPS</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div4.dps}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div3.dps}}</td>';
        //         l += '<td class="bel-title text-center">D3 DPS</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div3.dps}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div2.dps}}</td>';
        //         l += '<td class="bel-title text-center">D2 DPS</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div2.dps}}</td>';
        //     l += '</tr>';
        //     l += '<tr>';
        //         l += '<td class="bel-value text-right">{{left.divisions.div1.dps}}</td>';
        //         l += '<td class="bel-title text-center">D1 DPS</td>';
        //         l += '<td class="bel-value text-left">{{right.divisions.div1.dps}}</td>';
        //     l += '</tr>';
        // l += '</table>';
        // l += '<div style="text-align:left;color: #1abc9c;font-weight:bold;font-size:16px;">';
        // l += '<span class="bel-version">{{version}}</span> BATTLE EYE LIVE';
        // l += '</div>';
        return l;
    }


}
