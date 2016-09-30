import SettingsField from './SettingsField';

export default class SettingsGroup extends React.Component{

    renderSettings(){
        var settings = this.props.settings;
        var components = [];

        for(var i in settings){
            var setting = settings[i];
            components.push(<SettingsField setting={setting}/>);
        }

        return components;
    }

    render(){
        return (
            <div className="bel-col-1-2">
                <h5 className="bel-settings-group">{this.props.name}</h5>
                <div className="bel-settings-container">
                    {this.renderSettings()}
                </div>
            </div>
        );
    }
}
