import React from 'react';
import Setting from './Setting';

export default class SettingsTab extends React.Component {
    handleClick(setting, value) {
        BattleEyeStorage.set(setting, value);

        if (setting == 'moveToTop' || setting == 'layoutUpdateRate') {
            BattleEye.reload();
        }
    }

    render() {
        return (
            <div className="columns battleeye__settings">
                <div className="column is-one-third">
                    <div className="section-title">General</div>
                    <Setting
                        title="Show BattleEye above battlefield"
                        name="moveToTop"
                        value={BattleEyeStorage.get('moveToTop')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show mini monitor on the battlefield"
                        name="showMiniMonitor"
                        value={BattleEyeStorage.get('showMiniMonitor')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show battle update progress bar"
                        name="showBattleProgressbar"
                        value={BattleEyeStorage.get('showBattleProgressbar')}
                        handleClick={this.handleClick.bind(this)}
                    />
                </div>
                <div className="column">
                    <div className="section-title">Divisions tab</div>
                    <Setting
                        title="Show DIV 1"
                        name="showDiv1"
                        value={BattleEyeStorage.get('showDiv1')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV2"
                        name="showDiv2"
                        value={BattleEyeStorage.get('showDiv2')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV3"
                        name="showDiv3"
                        value={BattleEyeStorage.get('showDiv3')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV4"
                        name="showDiv4"
                        value={BattleEyeStorage.get('showDiv4')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Highlight my division"
                        name="highlightDiv"
                        value={BattleEyeStorage.get('highlightDiv')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show my division on top"
                        name="topDiv"
                        value={BattleEyeStorage.get('topDiv')}
                        handleClick={this.handleClick.bind(this)}
                    />
                </div>
                <div className="column is-two-fifths">
                    <div className="section-title">Display and performance</div>
                    <Setting
                        title="Layout update rate"
                        name="layoutUpdateRate"
                        options={[
                            [1, 'every second'],
                            [2, 'every 2s'],
                            [4, 'every 4s']
                        ]}
                        value={BattleEyeStorage.get('layoutUpdateRate')}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Smooth transitions"
                        name="showTransitionAnimations"
                        value={BattleEyeStorage.get('showTransitionAnimations')}
                        handleClick={this.handleClick.bind(this)}
                    />
                </div>
            </div>
        );
    }
}
