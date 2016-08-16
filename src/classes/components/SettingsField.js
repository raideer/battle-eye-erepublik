class SettingsField extends React.Component{
    getInput(){
        var setting = this.props.setting;
        // console.log(setting.value);
        if(typeof(setting.value) == "boolean"){
            return (
                <div>
                    <input type="checkbox" defaultChecked={setting.value} className="bel-settings-field" id={setting.field.id} name={setting.field.id} />
                    <label htmlFor={setting.field.id}>
                        {setting.field.name}
                    </label>
                </div>
            );
        }else{
            return (
                <div>
                    <label htmlFor={setting.field.id}>
                        {setting.field.name}
                    </label>
                    <div>
                        <input type="text" defaultValue={setting.value} className="bel-settings-field" id={setting.field.id} name={setting.field.id} />
                    </div>
                </div>
            );
        }
    }

    render(){
        var setting = this.props.setting;
        return (
            <div className="bel-checkbox">
                {this.getInput()}
                <div className="bel-field-description">
                    {setting.field.desc}
                </div>
            </div>
        );
    }
}
