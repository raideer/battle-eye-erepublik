class Feed extends React.Component{
    printDivisions(){
        if(!this.props.data){
            return null;
        }

        var divs = [];

        if(unsafeWindow.SERVER_DATA.division == 11){
            var divInfo = [[11,'Air Division']];
        }else{
            var divInfo = [[1,'Division 1'], [2,'Division 2'], [3,'Division 3'], [4,'Division 4']];
        }

        for(var d in divInfo){
            var info = divInfo[d];
            if(!this.props.settings.showOtherDivs.value){
                if(info[0] != unsafeWindow.SERVER_DATA.division){
                    continue;
                }
            }

            var divData = {};
                divData.left = this.props.data.left.divisions['div' + info[0]];
                divData.right = this.props.data.right.divisions['div' + info[0]];

            divs.push(<FeedDivision data={divData} div={info} settings={this.props.settings}/>);
        }

        return divs;
    }
    render(){
        return (
            <div className="bel-grid">
                {this.printDivisions()}
            </div>
        );
    }
}
