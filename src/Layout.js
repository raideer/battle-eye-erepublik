import React from 'react';
import ReactDOM from 'react-dom';

import Template from './layout/components/Template';

export default class Layout {
    constructor() {
        this.rootElement = document.createElement('div');
        this.rootElement.setAttribute('id', 'battle_observer');

        $j('#content').append(this.rootElement);
    }

    update(stats) {
        ReactDOM.render(
            <Template stats={stats} />,
            this.rootElement
        );
    }
}
