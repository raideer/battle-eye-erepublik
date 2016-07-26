class SettingsField extends React.Component{
    render(){
        var setting = this.props.setting;
        return (
            <div className="bel-checkbox">
                <input type="checkbox" defaultChecked={setting.value} className="bel-settings-field" id={setting.field.id} name={setting.field.id} />
                <label htmlFor={setting.field.id}>
                    {setting.field.name} {setting.value}
                </label>
                <div className="bel-field-description">
                    {setting.field.desc}
                </div>
            </div>
        );
    }
}
