export default class MiniMonitor extends React.Component{

    getPerc(a, b){
        var ap = 0;
        if(a+b !== 0){
            ap = Math.round(a * 1000 / (a+b))/10;
        }

        return ap;
    }

    printDivisions(){
        var data = [];
        var left = this.props.feedData.left;
        var right = this.props.feedData.right;

        var divs = [];

        if(SERVER_DATA.division == 11){
            divs = [11];
        }else{
            divs = [1,2,3,4];
        }

        for(var i in divs){
            var div = divs[i];
            var leftDamage = left.divisions['div'+div].damage * window.leftDetBonus;
            var rightDamage = right.divisions['div'+div].damage * window.rightDetBonus;

            data.push(<div><div className={"bel-div bel-div"+div}></div> {this.getPerc(leftDamage, rightDamage)}% - {this.getPerc(rightDamage, leftDamage)}%</div>);
        }

        return data;
    }

    render(){
        if(!window.BattleEyeSettings.showMiniMonitor.value){
            return null;
        }

        return (
            <div className="bel-minimonitor">
                {this.printDivisions()}
            </div>
        );
    }
}
