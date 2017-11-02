import React from 'react';

export default class Header extends React.Component {
    render() {
        return (
            <div className="bo__Header">
                <div className="bo__flex">
                    <div className="bo__Header__item"><span className="version">v {GM_info.script.version}</span></div>
                    <div className="bo__Header__item"><a className="bo__Header__logo" href="#">BATTLE EYE</a></div>
                    <div className="bo__Header__item">
                        <div class="spinner">
                            <div class="rect1"></div>
                            <div class="rect2"></div>
                            <div class="rect3"></div>
                            <div class="rect4"></div>
                            <div class="rect5"></div>
                        </div>
                    </div>
                </div>
                <div className="bo__flex">
                    <div className="bo__Header__item"><a href="#">Script homepage</a></div>
                    <div className="bo__Header__item"><a href="#">Settings</a></div>
                </div>
            </div>
        );
    }
}
