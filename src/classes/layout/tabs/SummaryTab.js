export default class SummaryTab extends React.Component{
    constructor(){
        super();
        this.loading = false;
    }

    renderSummary(){

    }

    renderButton(){
        return (
            <div id="bel-summary" className="text-center">
                <div>
                    This will generate a summary of this battle till this point. The process can take up to 20 seconds. <br/>
                    Please use this tool only when necessary, as it is quite a heavy process.
                </div>
                <button id="bel-generate-summary" onClick={this.showLoader} className="bel-btn bel-btn-info">GENERATE</button>
            </div>
        );
    }

    showLoader(){
        this.loading = true;
        console.log('Show loader');
    }

    renderLoader(){
        return (
            <div id="bel-summary" className="text-center">
                <div className="bel-spinner text-center">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
            </div>
        );
    }

    render(){
        if(false){
            return this.renderSummary();
        }else{
            if(this.loading){
                return this.renderLoader();
            }else{
                return this.renderButton();
            }
        }

        return null;
    }
}
