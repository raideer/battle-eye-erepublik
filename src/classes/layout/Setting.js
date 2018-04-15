import React from 'react';

export default class Setting extends React.Component {
    render() {
        const { title, name, value, handleClick, options } = this.props;

        if (options) {
            return (
                <div className="setting">
                    <span className="buttons has-addons">
                        <span className="button setting-name is-small">{ title }</span>
                        { options.map(option => {
                            return (
                                <span
                                    key={option[0]}
                                    onClick={handleClick.bind(null, name, option[0])}
                                    className={`button is-small ${value == option[0] ? 'is-info' : 'is-light'}`}>{option[1]}</span>
                            );
                        }) }
                    </span>
                </div>
            );
        }

        return (
            <div className="setting">
                <span className="buttons has-addons">
                    <span className="button setting-name is-small">{ title }</span>
                    <span onClick={handleClick.bind(null, name, true)} className={`button is-small ${value === true ? 'is-success' : 'is-light'}`}>On</span>
                    <span onClick={handleClick.bind(null, name, false)} className={`button is-small ${value === false ? 'is-danger' : 'is-light'}`}>Off</span>
                </span>
            </div>
        );
    }
}
