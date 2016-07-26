class FeedProgressBar extends React.Component{
    render(){
        var aPerc, bPerc = 0;

        if(this.props.a+this.props.b !== 0){
            aPerc = Math.round((this.props.a * 100 / (this.props.a+this.props.b)));
            bPerc = Math.round((this.props.b * 100 / (this.props.a+this.props.b)));
        }

        var teamA = {
            width: aPerc + "%"
        };

        var teamB = {
            width: bPerc + "%"
        };

        return (
            <div className="bel-progress">
                <div className="bel-progress-center-marker"></div>
                <div className="bel-progress-bar bel-teama" style={teamA}></div>
                <div className="bel-progress-bar bel-teamb" style={teamB}></div>
            </div>
        );
    }
}
