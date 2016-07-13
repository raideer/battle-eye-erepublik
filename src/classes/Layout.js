class Layout{
    constructor(style){
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
        var l = '';
        l += '<table id="bel-table">';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.damage}}</td>';
                l += '<td class="bel-title text-center">Total damage</td>';
                l += '<td class="bel-value text-left">{{right.damage}}</td>';
            l += '</tr>';
            l += '<tr style="color:#e74c3c;">';
                l += '<td class="bel-value text-right">{{left.dps}}</td>';
                l += '<td class="bel-title text-center"><i>Damage Per Second</i> (DPS)</td>';
                l += '<td class="bel-value text-left">{{right.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.avgHit}}</td>';
                l += '<td class="bel-title text-center">Average hit</td>';
                l += '<td class="bel-value text-left">{{right.avgHit}}</td>';
            l += '</tr>';
            l += '<tr></tr>';
            l += '<tr style="color:#9b59b6;">';
                l += '<td class="bel-value text-right">{{left.divisions.div4.damage}}</td>';
                l += '<td class="bel-title text-center">Total D4 damage</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div4.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div3.damage}}</td>';
                l += '<td class="bel-title text-center">Total D3 damage</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div3.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div2.damage}}</td>';
                l += '<td class="bel-title text-center">Total D2 damage</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div2.damage}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div1.damage}}</td>';
                l += '<td class="bel-title text-center">Total D1 damage</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div1.damage}}</td>';
            l += '</tr>';
            l += '<tr style="color:#9e71f9;">';
                l += '<td class="bel-value text-right">{{left.divisions.div4.dps}}</td>';
                l += '<td class="bel-title text-center">D4 DPS</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div4.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div3.dps}}</td>';
                l += '<td class="bel-title text-center">D3 DPS</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div3.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div2.dps}}</td>';
                l += '<td class="bel-title text-center">D2 DPS</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div2.dps}}</td>';
            l += '</tr>';
            l += '<tr>';
                l += '<td class="bel-value text-right">{{left.divisions.div1.dps}}</td>';
                l += '<td class="bel-title text-center">D1 DPS</td>';
                l += '<td class="bel-value text-left">{{right.divisions.div1.dps}}</td>';
            l += '</tr>';
        l += '</table>';
        l += '<div style="text-align:left;color: #1abc9c;font-weight:bold;font-size:16px;">';
        l += '<span class="bel-version">{{version}}</span> BATTLE EYE LIVE';
        l += '</div>';
        return l;
    }


}
