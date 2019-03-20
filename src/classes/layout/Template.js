import React from 'react';
import { connect } from 'react-redux';

import DivisionsTab from './DivisionsTab';
import ChartsTab from './ChartsTab';
import TabButton from './TabButton';
import ExportTab from './ExportTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';
import FirstKillsTab from './FirstKillsTab';
import DeployTab from './DeployTab';
import OtherTab from './OtherTab';
import Loader from './Loader';

class Template extends React.Component {
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
        const { leftStats, rightStats } = this.props;

        if (!leftStats || !rightStats) return <Loader />;

        switch (this.state.activeTab) {
        case 'divisions':
            return (
                <DivisionsTab divisions={{
                    left: leftStats.divisions,
                    right: rightStats.divisions
                }} />
            );
        case 'charts':
            return (
                <ChartsTab />
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
                <FirstKillsTab />
            );
        case 'deploy':
            return (
                <DeployTab />
            );
        case 'other':
            return (
                <OtherTab />
            );
        default:
            return null;
        }
    }

    renderLoader() {
        if (!this.props.nbp) return;
        if (!this.props.loading) return;

        if (this.props.nbp.error) {
            return (
                <div id="battleeye-loading">
                    <img style={{ width: '13px', display: 'block' }} src="https://cdn.raideer.xyz/headless.png" alt="Headless chicken"/>
                </div>
            );
        }

        return (
            <div id="battleeye-loading">
                <Loader title="Loading BattleEye" />
            </div>
        );
    }

    reload() {
        window.BattleEye.reload();
    }

    getProgressBar() {
        if (BattleEyeStorage.get('showBattleProgressbar')) {
            const nbpProgress = ((window.BattleEye.second - this.props.lastNbp) / 30) * 100;
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
                <div className="be__menu be__columns">
                    <div className="be__column be__menu-section">
                        <div className="be__logo">
                            <a target="_blank" href="https://battleeye.raideer.xyz/">BATTLE EYE</a>
                            <div className="be__logo-status">
                                <span id="battleeye-version">v{ BattleEye.version }</span>
                                <span id="be_connected"></span>
                            </div>
                            { this.renderLoader() }
                        </div>
                        <div className="be__button-group">
                            <TabButton
                                name='divisions'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                click={this.setTab.bind(this, 'divisions')}>
                                <i className="fas fa-list be-menu-icon"></i> Divisions
                            </TabButton>
                            <TabButton
                                name='charts'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                click={this.setTab.bind(this, 'charts')}>
                                <i className="fas fa-chart-line be-menu-icon"></i> Charts
                            </TabButton>
                            <TabButton
                                name='export'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                click={this.setTab.bind(this, 'export')}>
                                <i className="fas fa-file-export be-menu-icon"></i> Export
                            </TabButton>
                            <TabButton
                                name='firstKills'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                click={this.setTab.bind(this, 'firstKills')}>
                                First kills {window.BattleEye.fktVersion ? <i style={{ fontSize: '10px', marginLeft: '4px' }}>v{window.BattleEye.fktVersion}</i> : ''}
                            </TabButton>
                            { !SERVER_DATA.spectatorOnly
                            && <TabButton
                                name='deploy'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                className="be-deploy-btn"
                                click={this.setTab.bind(this, 'deploy')}>
                                Deploy
                                {
                                    this.props.deployActive
                                    && ` (${Math.round(this.props.deployProgress)}%)`
                                }
                                {
                                    (
                                        this.props.deployActive
                                        && <i className="fas fa-toggle-on"></i>
                                    )
                                    || (
                                        !this.props.deployActive
                                        && <i className="fas fa-toggle-off"></i>
                                    )
                                }
                            </TabButton>}
                            <TabButton
                                name='other'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-lighter"
                                click={this.setTab.bind(this, 'other')}>
                                Other
                            </TabButton>
                        </div>
                    </div>
                    <div className="be__column be__column-right be__menu-section">
                        <div className="be__button-group">
                            <TabButton
                                name='about'
                                activeTab={this.state.activeTab}
                                click={this.setTab.bind(this, 'about')}
                                className="is-gradient">
                                <i className="fas fa-info-circle"></i>
                            </TabButton>
                            <TabButton
                                click={this.reload.bind(this)}
                                activeTab={this.state.activeTab}
                                className='be__button-white'>
                                <i className="fas fa-sync-alt"></i>
                            </TabButton>
                            <TabButton
                                name='settings'
                                activeTab={this.state.activeTab}
                                className="be__button-white"
                                click={this.setTab.bind(this, 'settings')}>
                                <i className="fas fa-cog"></i>
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

function mapState(state) {
    return {
        loading: state.main.loading,
        leftStats: state.main.leftStats,
        rightStats: state.main.rightStats,
        nbp: state.main.nbp,
        lastNbp: state.main.lastNbp,
        deployProgress: state.deployer.progress,
        deployActive: state.deployer.deployActive
    };
}

export default connect(mapState)(Template);
