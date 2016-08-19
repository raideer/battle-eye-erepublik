class Layout{
    constructor(style, headerData){
        var self = this;
        self.headerData = headerData;

        var battleEye = document.createElement('div');
            battleEye.setAttribute('id', 'battle_eye_live');

        if(settings.moveToTop.value){
            $j('#content').prepend(battleEye);
        }else{
            $j('#content').append(battleEye);
        }

        style.load();
    }

    update(feedData){
        ReactDOM.render(<Template settings={settings} feedData={feedData} headerData={this.headerData} />, document.getElementById('battle_eye_live'));
    }
}
