class Stylesheet{
    constructor(){
        this.sheet = "";

        //General
        this.addCSSRule("#battle_eye_live", `
            width: 100%;
            position:relative;
            float:left;
            padding:10px;
            box-sizing: border-box;
            border-radius:0px 0px 20px 20px;
            background-color: #ffffff;
            color: #34495e;
            font-size:14px;
            font-family: "Lato",
            Helvetica,Arial,sans-serif;
            text-align: center;
            line-height: 1.7;
        `);

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before',
            '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
        this.addCSSRule(".bel-value", "background-color: #ecf0f1;padding: 2px 10px;border-radius: 4px;margin: 0 2px;");
        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-title', 'background-color: #ecf0f1;margin-bottom:2px;margin-top:5px;');
        //Grids
        this.addCSSRule('.bel-grid:after', 'content: "";display: table;clear: both;');
        this.addCSSRule("[class*='bel-col-']", 'float: left;');
        this.addCSSRule('.bel-col-1-1', 'width: 100%;');
        this.addCSSRule('.bel-col-1-2', 'width: 50%;');
        this.addCSSRule('.bel-col-1-4', 'width: 25%;');
        this.addCSSRule('.bel-col-1-3', 'width: 33.3333%;');
        this.addCSSRule('.bel-col-1-8', 'width: 12.5%;');
        //Lists
        this.addCSSRule('.list-unstyled', 'list-style: outside none none;padding-left: 0;');
        this.addCSSRule('.list-inline li', 'display: inline-block;');

        //Modal
        this.addCSSRule('.bel-modal', `
            z-index: 999;
        `);

        //Button
        this.addCSSRule('.bel-btn', `
            -moz-user-select: none;
            background-image: none;
            border: medium none;
            cursor: pointer;
            font-size: 14px;
            font-weight: normal;
            margin-bottom: 0;
            text-align: center;
            border-radius: 4px;
            font-size: 12px;
            padding: 3px 8px;
        `);

        this.addCSSRule('.bel-btn-default', `
            background-color: #1abc9c;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-default:hover', `
            background-color: #16a085;
            color: #ffffff;
        `);

        //Header menu
        this.addCSSRule('.bel-header-menu', 'margin-bottom: 10px;');
        this.addCSSRule('.bel-header-menu li', 'padding: 0 5px;');
        //Progress bars
        this.addCSSRule('.bel-progress', `
            height: 4px;
            position: relative;
            background: #ebedef none repeat scroll 0 0;
            border-radius: 32px;
            box-shadow: none;
            margin-top: 2px;
            overflow: hidden;
        `);

        this.addCSSRule('.bel-teama', 'background-color: #27ae60;');
        this.addCSSRule('.bel-teamb', 'background-color: #c0392b;');

        this.addCSSRule('.bel-progress-bar', `
            box-shadow: none;
            line-height: 12px;
            color: #fff;
            float: left;
            font-size: 12px;
            height: 100%;
            line-height: 20px;
            text-align: center;
            transition: width 0.6s ease 0s;
            width: 0;
        `);

        this.addCSSRule('.bel-progress-center-marker', `
            border-right: 3px solid #ffffff;
            height: 10px;
            left: 50%;
            margin-left: -2px;
            opacity: 0.6;
            position: absolute;
        `);
        //Other
        this.addCSSRule('.bel-hr', `
            -moz-border-bottom-colors: none;
            -moz-border-left-colors: none;
            -moz-border-right-colors: none;
            -moz-border-top-colors: none;
            border-color: #eee -moz-use-text-color -moz-use-text-color;
            border-image: none;
            border-style: solid none none;
            border-width: 1px 0 0;
            margin-bottom: 20px;
        `);
    }

    addCSSRule(selector, rules) {
    	this.sheet += selector + "{" + rules + "}";
    }

    load(){
        GM_addStyle(GM_getResourceText('modals'));
        GM_addStyle(this.sheet);
    }
}
