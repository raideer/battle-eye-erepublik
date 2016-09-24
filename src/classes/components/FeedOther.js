class FeedOther extends React.Component{
    render(){
        if(battleEyeLive.nbpStats === null){
            return (
                <div className="bel-spinner">
                    <div className="rect1"></div>
                    <div className="rect2"></div>
                    <div className="rect3"></div>
                    <div className="rect4"></div>
                    <div className="rect5"></div>
                </div>
            );
        }

        return (
            <div className="text-left">
                <div className="bel-col-1-3">
                    <b>Highest hit:</b> {parseInt(battleEyeLive.nbpStats.maxHit).toLocaleString()}
                </div>
                <div className="bel-col-1-3"></div>
                <div className="bel-col-1-3"></div>
            </div>
        );
    }
}
