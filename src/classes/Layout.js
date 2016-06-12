class Layout{
    constructor(){
        this.template = Handlebars.compile(this.createLayout());
        var el = document.createElement('div');
        el.setAttribute('id', 'battle_eye_live');
        var style = "width: 100%;position:relative;float:left;padding:10px;box-sizing: border-box;";
        style += "border-radius:0px 0px 20px 20px;background-image: url(\"http://i.imgur.com/XvYhBpp.png\");background-color: rgb(48, 48, 48);";
        style += "color: #ffffff;text-shadow:0 1px 1px rgba(0, 0, 0, 0.4);";
        style += "background-image: ";
        el.setAttribute('style', style);
        document.getElementById('content').appendChild(el);
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
        l += '<table style="width: 100%;table-layout: fixed;">';
            l += '<tr>';
                l += '<td style="text-align: right;">{{left.damage}}</td>';
                l += '<td style="text-align: center;">Total damage</td>';
                l += '<td style="text-align: left;">{{right.damage}}</td>';
            l += '</tr>';
            l += '<tr style="color:#cb1d1d;">';
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
            l += '<tr style="color:#9e71f9;">';
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
            l += '<tr style="color:#9e71f9;">';
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
        l += '<div style="text-align:left;color: rgb(4, 255, 14);font-weight:bold;">';
        l += 'Battle Eye LIVE {{version}}';
        l += '</div>';
        return l;
    }


}
