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

    getSettingsButtonStyle(){
        return {
            marginTop: "-3px"
        };
    }

    render(){
        return (
            <div id="battle_eye_header">
                <ul className="list-unstyled list-inline text-left bel-header-menu" style={this.getHeaderListStyle()}>
                    <li id="bel-version">
                        <span className="bel-version">{this.props.data.version}</span> BATTLE EYE LIVE
                    </li>

                    <li className="pull-right">
                        <ul className="list-unstyled list-inline">
                            <li><a className="bel-btn bel-btn-inverse" target="_blank" href="http://www.erepublik.com/en/citizen/profile/8075739">Contact</a></li>
                            <li><button id="battle-eye-settings" onClick={this.props.openModal} className="bel-btn bel-btn-default">Settings</button></li>
                        </ul>
                    </li>
                </ul>

                <div className="bel-grid">
                    <div className="bel-col-1-2 text-left bel-teama-color" style={this.getTeamElementStyle()}>
                        {this.props.data.teamAName}
                    </div>
                    <div className="bel-col-1-2 text-right bel-teamb-color" style={this.getTeamElementStyle()}>
                        {this.props.data.teamBName}
                    </div>
                </div>
            </div>
        );
    }
}
