class Layout{
    constructor(style, headerData){
        var self = this;
        self.headerData = headerData;

        var battleEye = document.createElement('div');
            battleEye.setAttribute('id', 'battle_eye_live');

        document.getElementById('content').appendChild(battleEye);

        style.load();
        // 
        // this.update(null);
    }

    update(feedData, settings){
        ReactDOM.render(<Template settings={settings} feedData={feedData} headerData={this.headerData} />, document.getElementById('battle_eye_live'));
    }
}
