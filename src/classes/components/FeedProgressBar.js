class FeedProgressBar extends React.Component{
    render(){
        var aPerc = 0, bPerc = 0;

        if(this.props.a+this.props.b !== 0){
            aPerc = Math.round((this.props.a * 10000 / (this.props.a+this.props.b)))/100;
            bPerc = Math.round((this.props.b * 10000 / (this.props.a+this.props.b)))/100;
        }

        var teamA = {
            width: aPerc + "%"
        };

        var teamB = {
            width: bPerc + "%"
        };

        var progressStyle = {};
        if(settings.largerBars.value){
            progressStyle.height = "8px";
        }

        return (
            <div className="bel-progress" style={progressStyle}>
                <div className="bel-progress-center-marker"></div>
                <div className="bel-progress-bar bel-teama" style={teamA}></div>
                <div className="bel-progress-bar bel-teamb" style={teamB}></div>
            </div>
        );
    }
}
