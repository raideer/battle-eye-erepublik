import FloatValue from '../elements/FloatValue';
import TextValue from '../elements/TextValue';
import ProgressBar from '../elements/ProgressBar';
import If from '../If';

export default class DivisionTab extends React.Component{
    getPerc(a, b){
        var ap = 0;

        if(a+b !== 0){
            ap = Math.round(a * 1000 / (a+b))/10;
        }

        return ap;
    }

    render(){
        if(this.props.tab != 'div'){
            return null;
        }

        var left = this.props.data.left;
        var right = this.props.data.right;
        var highlightDivision = false;
        if(window.BattleEyeSettings.highlightDivision.value && SERVER_DATA.division == this.props.div[0]){
            highlightDivision = true;
        }

        var leftDomination = left.damage * window.leftDetBonus;
        var rightDomination = right.damage * window.rightDetBonus;

        var leftDmgPerPercent = Math.round(left.damage / this.getPerc(leftDomination, rightDomination));
        var rightDmgPerPercent = Math.round(right.damage / this.getPerc(rightDomination, leftDomination));
        if(window.leftDetBonus == window.rightDetBonus){
            // rightDmgPerPercent = leftDmgPerPercent;
        }

        // console.log(left.dps);
        // console.log(this.props.data.left.dps);

        return (
            <div>
                <div className={"bel-col-1-1 text-center bel-title " + (highlightDivision?"bel-highlight-title":"")}>
                    {this.props.div[1]}
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <TextValue a={"1% = " + leftDmgPerPercent.toLocaleString() + " dmg"}/>
                            <FloatValue green={true} a={this.getPerc(leftDomination, rightDomination)} b={this.getPerc(rightDomination, leftDomination)} highlight={window.BattleEyeSettings.highlightValue.value}  text={"%"}/>
                        </li>
                        <li className="bel-col-1-3 text-center">Domination</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue b={this.getPerc(leftDomination, rightDomination)} a={this.getPerc(rightDomination, leftDomination)} highlight={window.BattleEyeSettings.highlightValue.value} text={"%"}/>
                            <TextValue a={"1% = " + rightDmgPerPercent.toLocaleString() + " dmg"}/>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <If test={window.BattleEyeSettings.showKills.value}>
                                <FloatValue green={true} a={left.hits} b={right.hits} highlight={window.BattleEyeSettings.highlightValue.value} text={"kills"}/>
                            </If>

                            <If test={window.BattleEyeSettings.showDamagePerc.value}>
                                <FloatValue green={true} a={this.getPerc(left.damage, right.damage)} b={this.getPerc(right.damage, left.damage)} highlight={window.BattleEyeSettings.highlightValue.value} text={"%"}/>
                            </If>

                            <FloatValue green={true} a={left.damage} b={right.damage} highlight={window.BattleEyeSettings.highlightValue.value}/>
                        </li>
                        <li className="bel-col-1-3 text-center">Total Damage</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue a={right.damage} b={left.damage} highlight={window.BattleEyeSettings.highlightValue.value}/>

                            <If test={window.BattleEyeSettings.showDamagePerc.value}>
                                <FloatValue b={this.getPerc(left.damage, right.damage)} a={this.getPerc(right.damage, left.damage)} highlight={window.BattleEyeSettings.highlightValue.value} text={"%"}/>
                            </If>

                            <If test={window.BattleEyeSettings.showKills.value}>
                                <FloatValue a={right.hits} b={left.hits} text={"kills"} highlight={window.BattleEyeSettings.highlightValue.value}/>
                            </If>
                        </li>
                    </ul>
                </div>

                <div className="belFeedValue">
                    <If test={window.BattleEyeSettings.showAverageDamage.value}>
                        <ul className="list-unstyled">
                            <li className="bel-col-1-3 text-right">
                                <FloatValue green={true} a={left.avgHit} b={right.avgHit} highlight={window.BattleEyeSettings.highlightValue.value}/>
                            </li>
                            <li className="bel-col-1-3 text-center">Average damage</li>
                            <li className="bel-col-1-3 text-left">
                                <FloatValue a={right.avgHit} b={left.avgHit} highlight={window.BattleEyeSettings.highlightValue.value}/>
                            </li>
                        </ul>
                    </If>
                </div>

                <div className="belFeedValue">
                    <ul className="list-unstyled">
                        <li className="bel-col-1-3 text-right">
                            <FloatValue green={true} a={left.dps} b={right.dps} highlight={window.BattleEyeSettings.highlightValue.value}/>
                        </li>
                        <li className="bel-col-1-3 text-center">DPS</li>
                        <li className="bel-col-1-3 text-left">
                            <FloatValue a={right.dps} b={left.dps} highlight={window.BattleEyeSettings.highlightValue.value}/>
                        </li>
                    </ul>
                </div>

                <div className="bel-col-1-1">
                    <If test={window.BattleEyeSettings.showDominationBar.value}>
                        <div className="text-left bel-text-tiny">DOMINATION <span className="color-silver">(<strong>{Math.abs(leftDomination-rightDomination).toLocaleString()} </strong> difference)</span></div>
                        <ProgressBar a={leftDomination} b={rightDomination}/>
                    </If>

                    <If test={window.BattleEyeSettings.showDamageBar.value}>
                        <div className="text-left bel-text-tiny">DAMAGE <span className="color-silver">(<strong>{Math.abs(left.damage-right.damage).toLocaleString()} </strong> difference)</span></div>
                        <ProgressBar a={left.damage} b={right.damage}/>
                    </If>

                    <If test={window.BattleEyeSettings.showDpsBar.value}>
                        <div className="text-left bel-text-tiny">DPS <span className="color-silver">(<strong>{Math.abs(left.dps-right.dps).toLocaleString()}</strong> difference)</span></div>
                        <ProgressBar a={left.dps} b={right.dps}/>
                    </If>
                </div>
            </div>
        );
    }
}
