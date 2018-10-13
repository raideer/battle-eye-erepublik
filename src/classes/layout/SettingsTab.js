import React from 'react';
import Setting from './Setting';
import BulmaButton from './BulmaButton';

export default class SettingsTab extends React.Component {
    constructor() {
        super();
        this.state = {};
        this.interval = null;
    }

    componentDidMount() {
        this.setState(window.BattleEyeStorage.items);
    }

    handleClick(setting, value) {
        this.setState({
            [setting]: value
        });

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
                        value={this.state.moveToTop}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show mini monitor on the battlefield"
                        name="showMiniMonitor"
                        value={this.state.showMiniMonitor}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show battle update progress bar"
                        name="showBattleProgressbar"
                        value={this.state.showBattleProgressbar}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Make BattleEye fixed height"
                        name="fixedHeight"
                        value={this.state.fixedHeight}
                        handleClick={this.handleClick.bind(this)}
                    />
                    {
                        this.state.fixedHeight ? <Setting
                            title="Height of the BattleEye window"
                            input={e => {
                                const height = parseInt(e.target.value) || 0;
                                this.setState({
                                    battleeyeHeight: height
                                });
                                clearInterval(this.interval);
                                this.interval = setTimeout(() => {
                                    BattleEyeStorage.set('battleeyeHeight', height);
                                }, 1000);
                            }}
                            inputType="px"
                            value={this.state.battleeyeHeight}
                            handleClick={this.handleClick.bind(this)}
                        /> : null
                    }
                    <BulmaButton
                        onClick={() => {
                            window.BattleEye.resetSettings();
                            this.setState(window.BattleEyeStorage.items);
                        }}
                        buttonStyle={{ margin: '5px 0' }}
                        text="Reset settings to defaults"
                        buttonClass="is-small is-warning~"
                    />
                </div>
                <div className="column">
                    <div className="section-title">Divisions tab</div>
                    <Setting
                        title="Show DIV 1"
                        name="showDiv1"
                        value={this.state.showDiv1}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV2"
                        name="showDiv2"
                        value={this.state.showDiv2}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV3"
                        name="showDiv3"
                        value={this.state.showDiv3}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show DIV4"
                        name="showDiv4"
                        value={this.state.showDiv4}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Highlight my division"
                        name="highlightDiv"
                        value={this.state.highlightDiv}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Show my division on top"
                        name="topDiv"
                        value={this.state.topDiv}
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
                        value={this.state.layoutUpdateRate}
                        handleClick={this.handleClick.bind(this)}
                    />
                    <Setting
                        title="Smooth transitions"
                        name="showTransitionAnimations"
                        value={this.state.showTransitionAnimations}
                        handleClick={this.handleClick.bind(this)}
                    />
                </div>
                <div className="column is-one-third">
                    <div className="section-title">Experimental features</div>
                    <Setting
                        title="Autoattacker"
                        name="showAutoattacker"
                        value={this.state.showAutoattacker}
                        handleClick={this.handleClick.bind(this)}
                    />
                </div>
            </div>
        );
    }
}
