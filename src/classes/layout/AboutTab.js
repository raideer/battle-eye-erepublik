import React from 'react';
import { connect } from 'react-redux';

class AboutTab extends React.Component {
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
            <div className="be__about has-text-left be__columns">
                <div className="be__column">
                    <h1>BattleEye</h1>

                    { this.renderField('Installed version', `v${BattleEye.version}`) }
                    { this.renderField('Total active BattleEye users', this.props.totalUsers) }
                    { this.renderField('Currently using', this.props.activeUsers) }

                    <h2>Have questions or suggestions?</h2>
                    <div>Join our <b>Discord</b> channel:</div>
                    <div style={{ padding: '10px 0' }}><a rel="noopener noreferrer" target="_blank" className="be__button is-round" href="https://discord.gg/4qeExQz">https://discord.gg/4qeExQz</a></div>
                </div>
                <div className="be__column is-half">
                    <h2>BattleEye is driven by the community</h2>
                    <div className="be__about-contributorsTitle">Here are some of the generous people, that have contributed to BattleEye</div>
                    <div className="be__about-contributors">{
                        this.props.contributorList.map((item, i) =>
                            <a style={{ color: item[1] }} href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/${item[2]}`} key={i}>{item[0]}</a>)
                    }</div>
                    <a rel="noopener noreferrer" target="_blank" href={`https://www.erepublik.com/${window.erepublik.settings.culture}/citizen/profile/8075739`} className="be__button is-round">If you want to become a contributor, you can donate here</a>
                </div>
            </div>
        );
    }
}

function mapState(state) {
    return {
        activeUsers: state.main.activeUsers,
        totalUsers: state.main.totalUsers,
        contributorList: state.main.contributorList,
        contributorCount: state.main.contributorCount
    };
}

export default connect(mapState)(AboutTab);
