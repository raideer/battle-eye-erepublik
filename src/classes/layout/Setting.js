import React from 'react';

export default class Setting extends React.Component {
    render() {
        const { title, name, value, handleClick, options, input, inputType } = this.props;

        if (input) {
            return (
                <div className="setting">
                    <span className="be__button-group">
                        <span className="be__button setting-name">{ title }</span>
                        <input onChange={input} value={value} className="setting-input" type="text"/>
                        { inputType ? <span className="be__button setting-name">{inputType}</span> : null}
                    </span>
                </div>
            );
        }

        if (options) {
            return (
                <div className="setting">
                    <span className="be__button-group">
                        <span className="be__button setting-name">{ title }</span>
                        { options.map(option => {
                            return (
                                <span
                                    key={option[0]}
                                    onClick={handleClick.bind(null, name, option[0])}
                                    className={`be__button ${value == option[0] ? 'is-active' : ''}`}>{option[1]}</span>
                            );
                        }) }
                    </span>
                </div>
            );
        }

        return (
            <div className="setting">
                <span className="be__button-group">
                    <span className="be__button setting-name">{ title }</span>
                    <span onClick={handleClick.bind(null, name, true)} className={`be__button ${value === true ? 'is-active' : ''}`}>On</span>
                    <span onClick={handleClick.bind(null, name, false)} className={`be__button ${value === false ? 'is-active' : ''}`}>Off</span>
                </span>
            </div>
        );
    }
}
