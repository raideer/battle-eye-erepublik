class MiniMonitor extends React.Component{

    getPerc(a, b){
        var ap = 0;
        if(a+b != 0){
            ap = Math.round(a * 1000 / (a+b))/10;
        }

        return ap;
    }

    printDivisions(){
        var data = [];
        var left = this.props.feedData.left;
        var right = this.props.feedData.right;
        if(SERVER_DATA.division == 11){
            var divs = [11];
        }else{
            var divs = [1,2,3,4];
        }

        for(var i in divs){
            var div = divs[i];
            data.push(<div><div className={"bel-div bel-div"+div}></div> {this.getPerc(left.divisions['div'+div].damage, right.divisions['div'+div].damage)}% - {this.getPerc(right.divisions['div'+div].damage, left.divisions['div'+div].damage)}%</div>);
        }

        return data;
    }

    render(){
        if(!settings.showMiniMonitor.value){
            return null;
        }
        
        return (
            <div className="bel-minimonitor">
                {this.printDivisions()}
            </div>
        );
    }
}
