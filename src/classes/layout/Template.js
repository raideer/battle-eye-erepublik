import React from 'react';

import DivisionsTab from './DivisionsTab';
import ChartsTab from './ChartsTab';
import TabButton from './TabButton';
import ExportTab from './ExportTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';
import FirstKillsTab from './FirstKillsTab';

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
        default:
            return null;
        }
    }

    renderLoader() {
        const zoneFinished = window.BattleEye.nbpStats ? window.BattleEye.nbpStats.zone_finished : false;
        return (
            <div id="battleeye-loading" style={zoneFinished ? { display: 'none' } : {}} className="level-item">
                Loading stats
                <div className="spinner">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
            </div>
        );
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

    render() {
        return (
            <div className={BattleEyeStorage.get('showTransitionAnimations') ? '' : 'no-transitions'}>
                <div className="level battleeye__menu">
                    <div className="level-left">
                        <div className="level-item">
                            <div className="tags has-addons logo">
                                <a target="_blank" href="https://battleeye.raideer.xyz/" className="tag">BATTLE EYE</a>
                                <span id="battleeye-version" className="tag is-main">v{ BattleEye.version }</span>
                                <span className="tag">
                                    <span id="be_connected"></span>
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
                                Divisions
                            </TabButton>
                            <TabButton
                                name='charts'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'charts')}>
                                Charts
                            </TabButton>
                            <TabButton
                                name='export'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'export')}>
                                Export
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
                    { this.renderLoader() }
                    <div className="level-right">
                        <div className="level-item buttons">
                            <TabButton
                                name='about'
                                activeTab={this.state.activeTab}
                                click={this.setTab.bind(this, 'about')}
                                className='is-dark is-outlined'>
                                Info
                            </TabButton>
                            <TabButton
                                click={this.reload.bind(this)}
                                className='is-dark is-outlined'>
                                Reload
                            </TabButton>
                            <TabButton
                                name='settings'
                                activeTab={this.state.activeTab}
                                click={this.setTab.bind(this, 'settings')}
                                className='is-primary'>
                                Settings
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
