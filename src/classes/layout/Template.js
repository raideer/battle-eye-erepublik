import React from 'react';
import $ from 'jQuery';

import DivisionsTab from './DivisionsTab';
import ChartsTab from './ChartsTab';
import TabButton from './TabButton';
import ExportTab from './ExportTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';
import FirstKillsTab from './FirstKillsTab';
import AutoAttackerTab from './AutoAttackerTab';

export default class Template extends React.Component {
    constructor() {
        super();

        this.state = {
            activeTab: 'divisions'
        };
    }

    setTab(activeTab) {
        this.setState({
            activeTab
        });
    }

    getTab() {
        const { left, right } = this.props.feedData;

        switch (this.state.activeTab) {
        case 'divisions':
            return (
                <DivisionsTab divisions={{
                    left: left.divisions,
                    right: right.divisions
                }} />
            );
        case 'charts':
            return (
                <ChartsTab data={this.props.feedData} />
            );
        case 'settings':
            return (
                <SettingsTab />
            );
        case 'about':
            return (
                <AboutTab />
            );
        case 'firstKills':
            return (
                <FirstKillsTab firstKills={this.props.feedData.firstKills} />
            );
        case 'autoattacker':
            return (
                <div>
                    <div>This feature is still being tested. Use with caution</div>
                    <AutoAttackerTab />
                </div>
            );
        default:
            return null;
        }
    }

    renderLoader() {
        const zoneFinished = window.BattleEye.nbpStats ? window.BattleEye.nbpStats.zone_finished : false;
        return (
            <div id="battleeye-loading" style={zoneFinished ? { display: 'none' } : {}} className="level-item">
                <div className="spinner" original-title="Loading stats">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        $('.spinner').tipsy();
    }

    reload() {
        window.BattleEye.reload();
    }

    getProgressBar() {
        if (BattleEyeStorage.get('showBattleProgressbar')) {
            const nbpProgress = ((window.BattleEye.second - window.BattleEye.lastNbp) / 30) * 100;
            return (
                <div className="battleeye__nbp-progress">
                    <div style={{ width: `${nbpProgress}%` }} className="battleeye__nbp-progress-bar"></div>
                </div>
            );
        }

        return null;
    }

    getContainerStyle() {
        if (BattleEyeStorage.get('fixedHeight')) {
            let height = parseInt(BattleEyeStorage.get('battleeyeHeight'));
            if (height < 200) {
                height = 200;
            } else if (height > 1000) {
                height = 1000;
            }

            return {
                height: `${height}px`,
                overflowY: 'scroll'
            };
        }

        return {};
    }

    render() {
        return (
            <div style={this.getContainerStyle()} className={BattleEyeStorage.get('showTransitionAnimations') ? '' : 'no-transitions'}>
                <div className="level battleeye__menu">
                    <div className="level-left">
                        <div className="level-item">
                            <div className="tags has-addons logo">
                                <a target="_blank" href="https://battleeye.raideer.xyz/" className="tag">BATTLE EYE</a>
                                <span id="battleeye-version" className="tag is-main">v{ BattleEye.version }</span>
                                <span className="tag">
                                    <span id="be_connected" style={{ display: 'none' }}></span>
                                    { this.renderLoader() }
                                </span>
                            </div>
                        </div>
                        <div className="level-item buttons has-addons">
                            <TabButton
                                name='divisions'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'divisions')}>
                                <i className="fas fa-list be-menu-icon"></i> Divisions
                            </TabButton>
                            <TabButton
                                name='charts'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'charts')}>
                                <i className="fas fa-chart-line be-menu-icon"></i> Charts
                            </TabButton>
                            <TabButton
                                name='export'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'export')}>
                                <i className="fas fa-file-export be-menu-icon"></i> Export
                            </TabButton>
                            <TabButton
                                name='autoattacker'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'autoattacker')}>
                                Auto attacker <span style={{ marginLeft: '4px' }}>{window.BattleEye.autoattacker.enabled ? <i className="fas fa-toggle-on has-text-success"></i> : <i className="fas fa-toggle-off"></i>}</span>
                            </TabButton>
                            <TabButton
                                name='firstKills'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                click={this.setTab.bind(this, 'firstKills')}>
                                First kills {window.BattleEye.fktVersion ? <i style={{ fontSize: '10px', marginLeft: '4px' }}>v{window.BattleEye.fktVersion}</i> : ''}
                            </TabButton>
                        </div>
                    </div>
                    <div className="level-right">
                        <div className="level-item buttons">
                            <TabButton
                                name='about'
                                activeTab={this.state.activeTab}
                                click={this.setTab.bind(this, 'about')}
                                className='is-dark is-outlined'>
                                <i className="fas fa-info-circle be-menu-icon"></i> Info
                            </TabButton>
                            <TabButton
                                click={this.reload.bind(this)}
                                className='is-dark is-outlined'>
                                <i className="fas fa-sync-alt be-menu-icon"></i> Reload
                            </TabButton>
                            <TabButton
                                name='settings'
                                activeTab={this.state.activeTab}
                                click={this.setTab.bind(this, 'settings')}
                                className='is-primary'>
                                <i className="fas fa-cog be-menu-icon"></i> Settings
                            </TabButton>
                        </div>
                    </div>
                </div>
                { this.getProgressBar() }

                <div className="battleeye__tab-content">
                    { /* Putting ExportTab in charge of rendering itself to prevent destructing data */ }
                    <ExportTab visible={this.state.activeTab == 'export'} />
                    { this.getTab() }
                </div>
            </div>
        );
    }
}
