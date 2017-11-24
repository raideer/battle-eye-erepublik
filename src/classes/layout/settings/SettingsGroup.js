import SettingsField from './SettingsField';
import React from 'react';

export default class SettingsGroup extends React.Component {
    renderSettings() {
        var settings = this.props.settings;
        var components = [];

        for (var i in settings) {
            components.push(<SettingsField key={i} setting={settings[i]} />);
        }

        return components;
    }

    render() {
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
