class Layout{
    constructor(){
        this.template = Handlebars.compile(this.createLayout());
        var el = document.createElement('div');
        el.setAttribute('id', 'battle_eye_live');
        el.style.position = "relative";
        el.style.float = "left";
        el.style.padding = "10px";
        el.style.width = "100%";
        document.getElementById('content').appendChild(el);
    }

    update(data){
        if(data == null){
            data = this.lastData;
        }else{
            this.lastData = data;
        }

        var html = this.template(data);
        document.getElementById('battle_eye_live').innerHTML = html;
    }

    createLayout(){
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


}
