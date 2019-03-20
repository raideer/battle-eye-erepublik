import React from 'react';
import $ from 'jQuery';

export default class AboutTab extends React.Component {
    constructor() {
        super();

        this.state = {
            activeUsers: 'loading...',
            currentlyUsing: 'loading...'
        };

        this.loadActiveUsers();
    }

    async loadActiveUsers() {
        this.state.activeUsers = await $.getJSON(`${BattleEye.apiURL}/users`);
        this.state.currentlyUsing = await $.getJSON(`${BattleEye.apiURL}/users/5minutes`);
    }

    renderKnownBugs() {
        return (
            <div>
                <h2>Known bugs and errors</h2>
                { BattleEye.knownErrors.map((bug, i) => {
                    return (
                        <div key={i} className="bug">
                            <div className="bug-problem"><b>Problem:</b></div>
                            <div className="bug-text">{ bug[0] }</div>
                            <div className="bug-solution"><b>Temporary solution:</b></div>
                            <div className="bug-text">{ bug[1] }</div>
                        </div>
                    );
                }) }
            </div>
        );
    }

    renderField(name, value) {
        return <div className="be__other-field" style={{ display: 'inline-flex', marginRight: '5px' }}>
            <div className="be__other-field-name">{name}</div>
            <div className="be__other-field-value" style={{ padding: '5px' }}>{ value }</div>
        </div>;
    }

    render() {
        return (
            <div className="battleeye__about has-text-left be__columns">
                <div className="be__column">
                    <h1>BattleEye</h1>

                    { this.renderField('Installed version', `v${BattleEye.version}`) }
                    { this.renderField('Total active BattleEye users', this.state.activeUsers) }
                    { this.renderField('Currently using', this.state.currentlyUsing) }

                    { this.renderKnownBugs() }
                </div>
                <div className="be__column">
                    <h2>Have questions or suggestions?</h2>
                    <div>Join our <b>Discord</b> channel:</div>
                    <div style={{ padding: '10px 0' }}><a rel="noopener noreferrer" target="_blank" className="be__button is-round" href="https://discord.gg/4qeExQz">https://discord.gg/4qeExQz</a></div>
                </div>
            </div>
        );
    }
}
