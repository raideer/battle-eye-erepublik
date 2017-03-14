import SettingsGroup from './SettingsGroup';
import React from 'react';

export default class SettingsModal extends React.Component{
    renderGroups(){
        var settings = window.BattleEyeSettings;
        var components = [];
        var groups = {};
        var i;

        for(i in settings){
            var setting = settings[i];

            if(groups[setting.field.group] === undefined){
                groups[setting.field.group] = [];
            }

            groups[setting.field.group].push(setting);

        }

        for(i in groups){
            components.push(<SettingsGroup key={i} name={i} settings={groups[i]} />);
        }

        return components;
    }

    resetSettings(){
        window.BattleEye.resetSettings();
        $j('#bel-reset-settings').notify('Settings reset', 'info');
    }

    disconnect(){
        window.BattleEye.forceDisconnect();
    }

    render(){
        return (
            <div id="bel-settings-modal" className={"bel-settings " + (this.props.hidden?"bel-hidden":"")}>
                <div className="clearfix">
                    <ul className="list-unstyled list-inline pull-right bel-header-menu">
                        <li><a id="bel-reset-settings" onClick={this.resetSettings} href="javascript:void(0);" className="bel-btn bel-btn-inverse bel-btn-alert-success">Reset to defaults</a></li>
                        <li><a href="https://dl.dropboxusercontent.com/u/86379644/battle-eye-live.user.js" className="bel-btn bel-btn-inverse">Update</a></li>
                        <li><button onClick={this.disconnect} className="bel-btn bel-btn-danger">Disconnect</button></li>
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
