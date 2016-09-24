class Feed extends React.Component{
    printDivisions(){
        if(!this.props.data){
            return null;
        }

        var divs = [];
        var divInfo = [];

        if(SERVER_DATA.division == 11){
            divInfo = [[11,'Air Division']];
        }else{
            divInfo = [[1,'Division 1'], [2,'Division 2'], [3,'Division 3'], [4,'Division 4']];
        }

        for(var d in divInfo){
            var info = divInfo[d];

            if(!this.props.settings.showOtherDivs.value){
                if(info[0] != SERVER_DATA.division){
                    continue;
                }
            }

            if(!this.props.settings.showDiv1.value && info[0] == 1){
                continue;
            }

            if(!this.props.settings.showDiv2.value && info[0] == 2){
                continue;
            }

            if(!this.props.settings.showDiv3.value && info[0] == 3){
                continue;
            }

            if(!this.props.settings.showDiv4.value && info[0] == 4){
                continue;
            }

            var divData = {};
                divData.left = this.props.data.left.divisions['div' + info[0]];
                divData.right = this.props.data.right.divisions['div' + info[0]];

            divs.push(<FeedDivision data={divData} div={info} settings={this.props.settings}/>);
        }

        return divs;
    }

    printOverall(){
        var data = {};
        data.left = this.props.data.left;
        data.right = this.props.data.right;

        return (
            <FeedOverall data={data} settings={this.props.settings} />
        );
    }

    printCountries(){
        var data = {};
        data.left = this.props.data.left;
        data.right = this.props.data.right;

        return (
            <FeedCountries data={data} settings={this.props.settings} />
        );
    }

    printOther(){
        return (
            <FeedOther />
        );
    }

    getContent(){
        if(this.props.tab == 'div'){
            return this.printDivisions();
        }else if(this.props.tab == 'overall'){
            return this.printOverall();
        }else if(this.props.tab == 'countries'){
            return this.printCountries();
        }
        // else if(this.props.tab == 'other'){
        //     return this.printOther();
        // }
    }

    render(){
        return (
            <div className="bel-grid">
                {this.getContent()}
            </div>
        );
    }
}
