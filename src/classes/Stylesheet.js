class Stylesheet{
    constructor(){
        this.sheet = "";

        var style = "width: 100%;position:relative;float:left;padding:10px;box-sizing: border-box;";
        style += "border-radius:0px 0px 20px 20px;background-color: #ffffff;";
        style += "color: #34495e;font-size:14px;font-family:\"Lato\",Helvetica,Arial,sans-serif;";

        this.addCSSRule("#battle_eye_live", style);
        this.addCSSRule(".bel-value", "background-color: #ecf0f1;padding: 4px 10px;");
        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule("#bel-table", "width: 100%;table-layout: fixed;");
        this.addCSSRule("#bel-table tr", "margin-bottom:1px;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-title', 'font-weight:700;')
    }

    addCSSRule(selector, rules) {
    	this.sheet += selector + "{" + rules + "}";
    }

    load(){
        GM_addStyle(this.sheet);
    }
}
