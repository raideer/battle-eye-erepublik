import React from 'react';

import DivisionsTab from './DivisionsTab';
import ChartsTab from './ChartsTab';
import TabButton from './TabButton';
import ExportTab from './ExportTab';
import SettingsTab from './SettingsTab';
import AboutTab from './AboutTab';

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
        default:
            return null;
        }
    }

    renderLoader() {
        return (
            <div id="battleeye-loading" className="level-item">
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

    render() {
        return (
            <div>
                <div className="level battleeye__menu">
                    <div className="level-left">
                        <div className="level-item">
                            <div className="tags has-addons logo">
                                <a target="__blank" href="http://bit.ly/BattleEye" className="tag">BATTLE EYE</a>
                                <span id="battleeye-version" className="tag is-main">v{ GM_info.script.version }</span>
                            </div>
                        </div>
                        <div className="level-item buttons">
                            <TabButton
                                name='divisions'
                                activeTab={this.state.activeTab}
                                inactiveClass="is-outlined"
                                className="is-info"
                                click={this.setTab.bind(this, 'divisions')}>
                                Divisions
                            </TabButton>
                            <TabButton
                                name='countries'
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
                                About BattleEye
                            </TabButton>
                            <TabButton
                                click={this.reload.bind(this)}
                                className='is-dark is-outlined'>
                                Reload BattleEye
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

                <div className="battleeye__tab-content">
                    { /* Putting ExportTab in charge of rendering itself to prevent destructing data */ }
                    <ExportTab visible={this.state.activeTab == 'export'} />
                    { this.getTab() }
                </div>
            </div>
        );
    }
}
