class FeedOverall extends React.Component{
    getPerc(a, b){
        var ap = 0;
        if(a+b != 0){
            ap = Math.round(a * 100 / (a+b));
        }

        return ap;
    }

    render(){
        var left = this.props.data.left;
        var right = this.props.data.right;
        var settings = this.props.settings;

        return (
            <div>
                <div className="bel-col-1-1 text-center bel-title bel-highlight-title">
                    Overall stats
                </div>
                <div className="bel-col-1-3 text-right">
                    <ul className="list-unstyled">
                        <li>
                            <If test={settings.showKills.value}>
                                <FeedValue a={left.hits} b={right.hits} highlight={settings.highlightValue.value} text={"kills"}/>
                            </If>

                            <If test={settings.showDamagePerc.value}>
                                <FeedValue a={this.getPerc(left.damage, right.damage)} b={this.getPerc(right.damage, left.damage)} highlight={settings.highlightValue.value} text={"%"}/>
                            </If>

                            <FeedValue a={left.damage} b={right.damage} highlight={settings.highlightValue.value}/>
                        </li>

                        <If test={settings.showAverageDamage.value}>
                            <li>
                                <FeedValue a={left.avgHit} b={right.avgHit} highlight={settings.highlightValue.value}/>
                            </li>
                        </If>

                        <li>
                            <FeedValue a={left.dps} b={right.dps} highlight={settings.highlightValue.value}/>
                        </li>
                    </ul>
                </div>
                <div className="bel-col-1-3 text-center">
                    <ul className="list-unstyled bel-titles">
                        <li>Total Damage</li>
                        <If test={settings.showAverageDamage.value}>
                            <li>Average Damage</li>
                        </If>
                        <li>DPS</li>
                    </ul>
                </div>
                <div className="bel-col-1-3 text-left">
                    <ul className="list-unstyled">
                        <li>
                            <FeedValue a={right.damage} b={left.damage} highlight={settings.highlightValue.value}/>

                            <If test={settings.showDamagePerc.value}>
                                <FeedValue b={this.getPerc(left.damage, right.damage)} a={this.getPerc(right.damage, left.damage)} highlight={settings.highlightValue.value} text={"%"}/>
                            </If>

                            <If test={settings.showKills.value}>
                                <FeedValue a={right.hits} b={left.hits} text={"kills"} highlight={settings.highlightValue.value}/>
                            </If>
                        </li>
                        <If test={settings.showAverageDamage.value}>
                            <li>
                                <FeedValue a={right.avgHit} b={left.avgHit} highlight={settings.highlightValue.value}/>
                            </li>
                        </If>
                        <li>
                            <FeedValue a={right.dps} b={left.dps} highlight={settings.highlightValue.value}/>
                        </li>
                    </ul>
                </div>
                <div className="bel-col-1-1">
                    <If test={settings.showDamageBar.value}>
                        <div className="text-left bel-text-tiny">DAMAGE <span className="color-silver">(<strong>{Math.abs(left.damage-right.damage).toLocaleString()} </strong> difference)</span></div>
                        <FeedProgressBar a={left.damage} b={right.damage}/>
                    </If>

                    <If test={settings.showDpsBar.value}>
                        <FeedProgressBar a={left.dps} b={right.dps}/>
                        <div className="text-left bel-text-tiny">DPS <span className="color-silver">(<strong>{Math.abs(left.dps-right.dps).toLocaleString()}</strong> difference)</span></div>
                    </If>
                </div>
            </div>
        );
    }

}
