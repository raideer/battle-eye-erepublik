class Header extends React.Component{
    getTeamElementStyle(){
        return {
            fontWeight: 700,
            fontSize: '1.3em'
        };
    }

    getHeaderListStyle(){
        return {
            paddingBottom: "6px",
            borderBottom: "1px solid #ecf0f1"
        };
    }

    getFlagStyle(c){
        return {
            backgroundImage: `url('/images/flags_png/L/${c}.png')`,
            backgroundPosition: "-4px -4px"
        };
    }

    render(){
        return (
            <div id="battle_eye_header">
                <ul className="list-unstyled list-inline text-left bel-header-menu" style={this.getHeaderListStyle()}>
                    <li id="bel-version">
                        <span className="bel-version">{this.props.data.version}</span> <a href="http://bit.ly/BattleEye" target="_blank">BATTLE EYE</a>
                    </li>

                    <li id="bel-loading">
                        <div className="bel-spinner">
                            <div className="rect1"></div>
                            <div className="rect2"></div>
                            <div className="rect3"></div>
                            <div className="rect4"></div>
                            <div className="rect5"></div>
                        </div>
                    </li>

                    <li className="pull-right">
                        <ul className="list-unstyled list-inline">
                            <li><a className="bel-btn bel-btn-inverse" target="_blank" href="http://bit.ly/BattleEye">Homepage</a></li>
                            <li><a className="bel-btn bel-btn-inverse" target="_blank" href="http://www.erepublik.com/en/citizen/profile/8075739">Contact/Donate</a></li>
                            <li><button id="battle-eye-settings" onClick={this.props.openModal} className="bel-btn bel-btn-default">Settings</button></li>
                        </ul>
                    </li>
                </ul>
                <If test={SERVER_DATA.isCivilWar}>
                    <div className="bel-grid">
                        <div className="bel-col-1-3 text-left bel-teama-color" style={this.getTeamElementStyle()}>
                            <div style={this.getFlagStyle(this.props.data.revolutionCountry)} className="bel-country"></div> {this.props.data.teamAName}
                        </div>
                        <div className="bel-col-1-3 text-center" style={this.getTeamElementStyle()}>
                            CIVIL WAR
                        </div>
                        <div className="bel-col-1-3 text-right bel-teamb-color" style={this.getTeamElementStyle()}>
                            <div style={this.getFlagStyle(this.props.data.revolutionCountry)} className="bel-country"></div> {this.props.data.teamBName}
                        </div>
                    </div>
                </If>
                <If test={!SERVER_DATA.isCivilWar}>
                    <div className="bel-grid">
                        <div className="bel-col-1-2 text-left bel-teama-color" style={this.getTeamElementStyle()}>
                            <div style={this.getFlagStyle(this.props.data.teamAName)} className="bel-country"></div> {this.props.data.teamAName}
                        </div>
                        <div className="bel-col-1-2 text-right bel-teamb-color" style={this.getTeamElementStyle()}>
                            {this.props.data.teamBName} <div style={this.getFlagStyle(this.props.data.teamBName)} className="bel-country"></div>
                        </div>
                    </div>
                </If>
            </div>
        );
    }
}
