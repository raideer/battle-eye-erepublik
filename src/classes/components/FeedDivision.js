class FeedDivision extends React.Component{
    getPerc(a, b){
        var ap = 0;
        if(a+b != 0){
            ap = Math.round(a * 1000 / (a+b))/10;
        }

        return ap;
    }

    render(){
        var left = this.props.data.left;
        var right = this.props.data.right;
        var settings = this.props.settings;
        var highlightDivision = false;
        if(settings.highlightDivision.value && SERVER_DATA.division == this.props.div[0]){
            highlightDivision = true;
        }

        var leftDomination = left.damage * battleEyeLive.leftDetBonus;
        var rightDomination = right.damage * battleEyeLive.rightDetBonus;

        var leftDmgPerPercent = Math.round(parseFloat(left.damage) / parseFloat(this.getPerc(leftDomination, rightDomination)));
        var rightDmgPerPercent = Math.round(parseFloat(right.damage) / parseFloat(this.getPerc(rightDomination, leftDomination)))
        if(battleEyeLive.leftDetBonus == battleEyeLive.rightDetBonus){
            // rightDmgPerPercent = leftDmgPerPercent;
        }

        return (
            <div>
                <div className={"bel-col-1-1 text-center bel-title " + (highlightDivision?"bel-highlight-title":"")}>
                    {this.props.div[1]}
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <FeedTextValue a={"1% = " + leftDmgPerPercent.toLocaleString() + " dmg"}/>
                            <FeedValue green={true} a={this.getPerc(leftDomination, rightDomination)} b={this.getPerc(rightDomination, leftDomination)} highlight={settings.highlightValue.value}  text={"%"}/>
                        </li>
                        <li className="bel-col-1-3 text-center">Domination</li>
                        <li className="bel-col-1-3 text-left">
                            <FeedValue b={this.getPerc(leftDomination, rightDomination)} a={this.getPerc(rightDomination, leftDomination)} highlight={settings.highlightValue.value} text={"%"}/>
                            <FeedTextValue a={"1% = " + rightDmgPerPercent.toLocaleString() + " dmg"}/>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <If test={settings.showKills.value}>
                                <FeedValue green={true} a={left.hits} b={right.hits} highlight={settings.highlightValue.value} text={"kills"}/>
                            </If>

                            <If test={settings.showDamagePerc.value}>
                                <FeedValue green={true} a={this.getPerc(left.damage, right.damage)} b={this.getPerc(right.damage, left.damage)} highlight={settings.highlightValue.value} text={"%"}/>
                            </If>

                            <FeedValue green={true} a={left.damage} b={right.damage} highlight={settings.highlightValue.value}/>
                        </li>
                        <li className="bel-col-1-3 text-center">Total Damage</li>
                        <li className="bel-col-1-3 text-left">
                            <FeedValue a={right.damage} b={left.damage} highlight={settings.highlightValue.value}/>

                            <If test={settings.showDamagePerc.value}>
                                <FeedValue b={this.getPerc(left.damage, right.damage)} a={this.getPerc(right.damage, left.damage)} highlight={settings.highlightValue.value} text={"%"}/>
                            </If>

                            <If test={settings.showKills.value}>
                                <FeedValue a={right.hits} b={left.hits} text={"kills"} highlight={settings.highlightValue.value}/>
                            </If>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <If test={settings.showAverageDamage.value}>
                        <ul className="list-unstyled">
                            <li className="bel-col-1-3 text-right">
                                <FeedValue green={true} a={left.avgHit} b={right.avgHit} highlight={settings.highlightValue.value}/>
                            </li>
                            <li className="bel-col-1-3 text-center">Average damage</li>
                            <li className="bel-col-1-3 text-left">
                                <FeedValue a={right.avgHit} b={left.avgHit} highlight={settings.highlightValue.value}/>
                            </li>
                        </ul>
                    </If>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <FeedValue green={true} a={left.dps} b={right.dps} highlight={settings.highlightValue.value}/>
                        </li>
                        <li className="bel-col-1-3 text-center">DPS</li>
                        <li className="bel-col-1-3 text-left">
                            <FeedValue a={right.dps} b={left.dps} highlight={settings.highlightValue.value}/>
                        </li>
                    </ul>
                </div>

                <div className="bel-col-1-1">
                    <If test={settings.showDominationBar.value}>
                        <div className="text-left bel-text-tiny">DOMINATION <span className="color-silver">(<strong>{Math.abs(leftDomination-rightDomination).toLocaleString()} </strong> difference)</span></div>
                        <FeedProgressBar a={leftDomination} b={rightDomination}/>
                    </If>

                    <If test={settings.showDamageBar.value}>
                        <div className="text-left bel-text-tiny">DAMAGE <span className="color-silver">(<strong>{Math.abs(left.damage-right.damage).toLocaleString()} </strong> difference)</span> <span className="color-silver">(1% ~ <strong></strong>)</span></div>
                        <FeedProgressBar a={left.damage} b={right.damage}/>
                    </If>

                    <If test={settings.showDpsBar.value}>
                        <div className="text-left bel-text-tiny">DPS <span className="color-silver">(<strong>{Math.abs(left.dps-right.dps).toLocaleString()}</strong> difference)</span></div>
                        <FeedProgressBar a={left.dps} b={right.dps}/>
                    </If>
                </div>
            </div>
        );
    }
}
