class SettingsModal extends React.Component{
    renderGroups(){
        var settings = this.props.settings;
        var components = [];
        var groups = {};

        for(var i in settings){
            var setting = settings[i];

            if(groups[setting.field.group] == undefined){
                groups[setting.field.group] = [];
            }

            groups[setting.field.group].push(setting);

        }

        for(var i in groups){
            var group = groups[i];
            components.push(<SettingsGroup name={i} settings={group}/>);
        }
        return components;
    }

    resetSettings(){
        battleEyeLive.resetSettings();
        this.forceUpdate();
        alert('Settings reset');
    }

    render(){
        return (
            <div id="bel-settings-modal" className={"bel-settings " + (this.props.hidden?"bel-hidden":"")}>
                <div className="clearfix">
                    <ul className="list-unstyled list-inline pull-right bel-header-menu">
                        <li><a onClick={this.resetSettings} href="javascript:void(0);" className="bel-btn bel-btn-inverse bel-btn-alert-success">Reset to defaults</a></li>
                        <li><a href="https://googledrive.com/host/0B3BZg10JinisM29sa05qV0NyMmM/battle-eye-live.user.js" className="bel-btn bel-btn-inverse">Update</a></li>
                        <li><button id="bel-close-modal" onClick={this.props.closeModal} className="bel-btn bel-btn-danger">Close</button></li>
                    </ul>
                </div>
                <div className="bel-grid">
                    {this.renderGroups()}
                </div>
            </div>
        );
    }
}
