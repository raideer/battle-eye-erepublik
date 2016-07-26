class Template extends React.Component{
    constructor(){
        super();
        this.state = {
            modalHidden: true
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

    render(){
        // console.log(this.props);
        return (
            <div>
                <SettingsModal closeModal={this.closeModal.bind(this)} hidden={this.state.modalHidden} settings={this.props.settings}/>
                <Header openModal={this.openModal.bind(this)} data={this.props.headerData}/>
                <Feed data={this.props.feedData} settings={this.props.settings}/>
                <Footer />
            </div>
        );
    }
}
