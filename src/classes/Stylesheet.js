class StyleSheet{
    constructor(){
        this.sheet = "";

        this.sheet += `
            @keyframes bel-pulse-w {
                0% {
                    background-color: #27ae60;
                }

                10% {
                    background-color: #2ecc71;
                }

                100% {
                    background-color: #27ae60;
                }
            }

            @keyframes bel-pulse-l {
                0% {
                    background-color: #e74c3c;
                }

                10% {
                    background-color: #c0392b;
                }

                100% {
                    background-color: #e74c3c;
                }
            }

            @keyframes connectionAlert{
                49%{
                    background-color: #34495e;
                }
                50%{
                    background-color: #e74c3c;
                }
            }

            .bel-disconnectedAlert{
                animation: connectionAlert 1s infinite;
            }

            .bel-status-log{
                padding: 2px;
                text-align: right;
                margin: 4px 0;
                font-size: 0.8em;
                color: #8c8c8c;
                width: 100%;
            }

            .bel-spinner {
              width: 50px;
              height: 20px;
              text-align: center;
              font-size: 10px;
              padding-top: 8px;
            }

            .bel-spinner > div {
              background-color: #2980b9;
              height: 100%;
              width: 6px;
              display: inline-block;

              -webkit-animation: sk-stretchdelay 1.2s infinite ease-in-out;
              animation: sk-stretchdelay 1.2s infinite ease-in-out;
            }

            .bel-spinner .rect2 {
              -webkit-animation-delay: -1.1s;
              animation-delay: -1.1s;
              background-color: #3498db;
            }

            .bel-spinner .rect3 {
              -webkit-animation-delay: -1.0s;
              animation-delay: -1.0s;
              background-color: #2980b9;
            }

            .bel-spinner .rect4 {
              -webkit-animation-delay: -0.9s;
              animation-delay: -0.9s;
              background-color: #3498db;
            }

            .bel-spinner .rect5 {
              -webkit-animation-delay: -0.8s;
              animation-delay: -0.8s;
              background-color: #2980b9;
            }

            @-webkit-keyframes sk-stretchdelay {
              0%, 40%, 100% { -webkit-transform: scaleY(0.4) }
              20% { -webkit-transform: scaleY(1.0) }
            }

            @keyframes sk-stretchdelay {
              0%, 40%, 100% {
                transform: scaleY(0.4);
                -webkit-transform: scaleY(0.4);
              }  20% {
                transform: scaleY(1.0);
                -webkit-transform: scaleY(1.0);
              }
            }

            hr.bel{
                 border: 0; height: 0; border-top: 1px solid rgba(0, 0, 0, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }

            .bel-stat-spacer{
                padding-right: 2px;
                padding-left: 2px;
            }

            .bel-color-emerald{
                color: #2ecc71;
            }

            .bel-color-belize{
                color: #2980b9;
            }

            .bel-color-amethyst{
                color: #9b59b6;
            }

            .bel-spacer-sm{
                display: inline-block;
                width: 15px;
            }

            .bel-chart-tooltip{
                background-color: #fff;
                padding: 5px;
                border-radius: 5px;
                border: 2px solid #e0e0e0;
            }
        `;

        this.addCSSRule('.clearfix:after', `
            content: "";
            display: table;
            clear: both;
        `);

        this.addCSSRule('.bel-alert', `
            background-color: #34495e;
            color:#ecf0f1;
            padding: 3px 8px;
            border-radius:4px;
            margin-right:4px;
        `);

        this.addCSSRule('.bel-alert-danger', `
            background-color: #e74c3c;
        `);


        // this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        // this.addCSSRule('.bel-version-outdated', 'background-color: #e74c3c;');

        // this.addCSSRule('.belFeedValue:after', `
        //     content: "";
        //     display: table;
        //     clear: both;
        // `);
        //
        // this.addCSSRule('.belFeedValue', `
        //     position: relative;
        // `);
        //
        // this.addCSSRule('.belFeedValue ul', `
        //     z-index: 2;
        //     position: relative;
        // `);

        this.addCSSRule('#bel-battle-history', `
            position: relative;
            display: block;
            height: 35px;
            width: 35px;
            float: left;
            text-indent: -9999px;
            margin-left: 4px;
            margin-top: 5px;
            border-radius: 4px;
            overflow: hidden;
            background-color: rgba(0, 0, 0, 0.45);
        `);

        this.addCSSRule('#bel-battle-history:hover', `
            background-color: rgba(0, 0, 0, 0.8);
        `);

        this.addCSSRule('#bel-battle-history::after', `
            position: absolute;
            top: 5px;
            left: 5px;
            width: 35px;
            height: 35px;
            background-image: url("https://dl.dropbox.com/s/atksgh3abnxh1qm/sprites.png");
            background-repeat: no-repeat;
            background-position: 0 0;
            content: " ";
            opacity: 0.6;
        `);

        this.addCSSRule('#bel-battle-history')

        //General
        //

        this.addCSSRule('#bel-minimonitor', `
            position: absolute;
            right: 0;
        `);

        this.addCSSRule('.bel-country-list', `
            max-height: 400px;
            overflow-y: scroll;
        `);

        this.addCSSRule('.bel-minimonitor', `
            position: absolute;
            width: 118px;
            background-color: rgba(52, 73, 94, 0.7);
            right: 0;
            color: #ecf0f1;
            top: 60px;
            padding: 2px;
        `);

        this.addCSSRule('.bel-div', `
            background-image: url("https://dl.dropbox.com/s/qitlbj5b0dokpk8/divs.png");
            background-repeat: no-repeat;
            height: 22px;
            width: 19px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 5px;
        `);

        this.addCSSRule('.bel-div1', `
            background-position: 0 0;
        `);

        this.addCSSRule('.bel-div2', `
            background-position: -38px 0;
        `);

        this.addCSSRule('.bel-div3', `
            background-position: -19px 0;
        `);

        this.addCSSRule('.bel-div4', `
            background-position: -76px 0;
        `);

        this.addCSSRule('.bel-div11', `
            background-position: -57px 0;
        `);

        this.addCSSRule('.bel-tabs', `
            margin: 5px 0;
        `);

        this.addCSSRule('.bel-tabs button', `
            border-radius: 0px;
        `);

        this.addCSSRule('.bel-tabs button:first-child', `
            border-radius: 4px 0 0 4px;
        `);

        this.addCSSRule('.bel-tabs button:last-child', `
            border-radius: 0 4px 4px 0;
        `);

        this.addCSSRule('.bel-country', `
            width: 28px;
            height: 25px;
            margin-bottom: -5px;
            margin-left: 5px;
            margin-right: 5px;
            display: inline-block;
        `);

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
            font-family: "Lato",Helvetica,Arial,sans-serif;
            text-align: center;
            line-height: 1.7;
        `);

        this.addCSSRule('.color-silver', 'color: #bdc3c7');

        this.addCSSRule('.pull-left', 'float:left;');
        this.addCSSRule('.pull-right', 'float:right;');

        this.addCSSRule('#battle_eye_live *,#battle_eye_live *:after,#battle_eye_live *:before',
            '-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;');
        this.addCSSRule(".bel-value", `
            display: inline-block;
            line-height: 1.2;
            background-color: #ecf0f1;
            padding: 2px 10px;
            border-radius: 4px;
            margin: 0 2px 2px 2px;
        `);

        this.addCSSRule(".bel-value-hl-w", `
            color: #ffffff;
            animation: bel-pulse-w 3s infinite;
            background-color: #27ae60;
        `);

        this.addCSSRule(".bel-value-hl-l", `
            color: #ffffff;
            animation: bel-pulse-l 3s infinite;
            background-color: #e74c3c;
        `);

        this.addCSSRule(".text-center", "text-align:center;");
        this.addCSSRule(".text-left", "text-align:left;");
        this.addCSSRule(".text-right", "text-align:right;");
        this.addCSSRule('.bel-version', 'background-color: #34495e;color:#ecf0f1;padding: 3px 8px;border-radius:4px;margin-right:4px;');
        this.addCSSRule('.bel-version-outdated', 'background-color: #e74c3c;');
        this.addCSSRule('.bel-title', 'background-color: #ecf0f1;margin-bottom:2px;margin-top:5px;');
        this.addCSSRule('.bel-titles', `
            font-weight: 700;
        `);
        this.addCSSRule('.bel-text-tiny', 'font-size:10px;');
        this.addCSSRule('.bel-highlight-title', `
            background-color: #34495e;
            color: #fff;
        `);
        this.addCSSRule('.bel-highlight', `
            color: #34495e;
        `);
        //Grids
        this.addCSSRule('.bel-grid:after', 'content: "";display: table;clear: both;');
        this.addCSSRule("[class*='bel-col-']", 'float: left;min-height: 1px;');
        this.addCSSRule('.bel-col-1-1', 'width: 100%;');
        this.addCSSRule('.bel-col-1-2', 'width: 50%;');
        this.addCSSRule('.bel-col-1-4', 'width: 25%;');
        this.addCSSRule('.bel-col-1-3', 'width: 33.3333%;');
        this.addCSSRule('.bel-col-1-8', 'width: 12.5%;');
        //Lists
        this.addCSSRule('.list-unstyled', 'list-style: outside none none;padding-left: 0;');
        this.addCSSRule('.list-inline li', 'display: inline-block;');

        this.addCSSRule('.bel-closed', `
            z-index: 100;
            position: absolute;
            width: 100%;
            opacity: 0.95;
            top: 0;
            left: 0;
            background-color: #2c3e50;
            text-shadow: 0 0 2px #363636;
            color: #ffffff;
            font-size: 20px;
            padding: 14px;
            text-align: center;
            overflow: hidden;
            height: 100%;
            display: none;
        `);
        this.addCSSRule('.bel-closed p', `
            font-size: 12px;
        `);

        //Settings
        this.addCSSRule('.bel-settings', `
            z-index: 100;
            position: absolute;
            width: 100%;
            opacity: 0.95;
            top: 0;
            left: 0;
            background-color: #ffffff;
            padding: 14px;
            text-align: left;
            overflow-y: scroll;
            height: 100%;
        `);

        this.addCSSRule('.bel-settings-group', `
            background-color: #34495e;
            color: #ecf0f1;
            padding-left: 10px;
        `);

        this.addCSSRule('.bel-settings-container', `
            padding-left: 5px;
        `);

        this.addCSSRule('.bel-settings-field', `
            margin-right: 3px;
        `);

        this.addCSSRule('.bel-field-description', `
            font-size: 12px;
            color: #95a5a6;
        `);

        this.addCSSRule('.bel-checkbox', `
            padding: 5px 3px;
            border-bottom: 1px solid #ecf0f1;
        `);

        this.addCSSRule('.bel-hidden',`
            display: none;
        `)

        //Button
        this.addCSSRule('.bel-btn', `
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            background-image: none;
            border: none !important;
            cursor: pointer;
            font-size: 13px;
            font-weight: normal;
            margin-bottom: 0;
            text-align: center;
            border-radius: 4px;
            padding: 3px 8px;
            font-family: "Lato",Helvetica,Arial,sans-serif;
            transition: background-color 0.5s;
        `);

        this.addCSSRule('a.bel-btn', `
            padding: 4px 8px;
        `);

        this.addCSSRule('.bel-btn-default', `
            background-color: #1abc9c;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-default:hover', `
            background-color: #16a085;
        `);

        this.addCSSRule('.bel-btn-grey', `
            background-color: #ecf0f1;
            color: #34495e;
        `);

        this.addCSSRule('.bel-btn-grey:hover', `
            background-color: #CED3D6;
        `);

        this.addCSSRule('.bel-btn-danger', `
            background-color: #e74c3c;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-danger:hover', `
            background-color: #c0392b;
        `);

        this.addCSSRule('.bel-btn-inverse', `
            background-color: #2c3e50;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-inverse:hover', `
            background-color: #34495e;
        `);

        this.addCSSRule('.bel-btn-info', `
            background-color: #2980b9;
            color: #ffffff;
        `);

        this.addCSSRule('.bel-btn-info:hover', `
            background-color: #3498db;
        `);


        //Header menu
        this.addCSSRule('.bel-header-menu', 'margin-bottom: 10px;');
        this.addCSSRule('.bel-header-menu li', 'padding: 0 5px;');

        //Team colors
        this.addCSSRule('.bel-teama', 'background-color: #27ae60;');
        this.addCSSRule('.bel-teamb', 'background-color: #c0392b;');
        this.addCSSRule('.bel-teama-color', 'color: #27ae60;');
        this.addCSSRule('.bel-teamb-color', 'color: #c0392b;');

        //Progress bars
        // this.addCSSRule('.bel-progress', `
        //     position: absolute;
        //     height: 20px;
        //     width: 100%;
        //     left:0;
        //     bottom: 0;
        // `);
        this.addCSSRule('.bel-progress', `
            height: 4px;
            position: relative;
            background: #ebedef none repeat scroll 0 0;
            border-radius: 32px;
            box-shadow: none;
            margin-top: 2px;
            overflow: hidden;
        `);

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
        //
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
        $j('head').append(`<style>${this.sheet}</style>`);
    }
}

export default (new StyleSheet());
