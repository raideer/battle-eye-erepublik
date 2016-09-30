import Module from './Module';

export default class Other extends Module{
    constructor(){
        super('Other', 'Other miscellaneous enhancements');
    }

    defineSettings(){
        return [
            ['otherFixCometchat', true, "Cometchat fix", "Removes the fading, clickblocking line from the bottom of the screen. (Requires a page refresh)"],
        ];
    }

    run(){
        if(settings.otherFixCometchat.value){
            //Removing that annoying cometchat background
            var waitForCometchat = setInterval(fixCometchat, 500);
            function fixCometchat(){
                var cometchat = document.getElementById('cometchat_base');
                if(cometchat !== null){
                    var style = "width:auto;position:aboslute;right:0;background:none;";
                    cometchat.setAttribute('style', style);
                    clearInterval(waitForCometchat);
                }
            }
        }
    }
}
