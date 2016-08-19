class Template extends React.Component{
    constructor(){
        super();
        this.state = {
            modalHidden: true,
            tab: 'div'
        };
    }

    openModal(){
        this.setState({
            'modalHidden': false
        });
    }

    closeModal(){
        this.setState({
            'modalHidden': true
        });
    }

    changeTab(tab){
        this.setState({
            'tab': tab
        });
    }

    render(){
        return (
            <div>
                <SettingsModal closeModal={this.closeModal.bind(this)} hidden={this.state.modalHidden} settings={this.props.settings}/>
                <Header openModal={this.openModal.bind(this)} data={this.props.headerData}/>
                <TabSelector changeTab={this.changeTab.bind(this)} tab={this.state.tab} />
                <Feed data={this.props.feedData} settings={this.props.settings} tab={this.state.tab} />
                <Footer />
            </div>
        );
    }
}
