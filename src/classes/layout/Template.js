import SettingsModal from './settings/SettingsModal';
import TabSelector from './tabs/TabSelector';
import Tabs from './tabs/Tabs';
import Header from './Header';
import Footer from './Footer';

export default class Template extends React.Component{
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

    getTabButtons(){
        return [
            ['div', 'Divisions'],
            ['overall', 'Total'],
            ['countries', 'Countries'],
            ['summary', 'Battle stats (beta)']
        ];
    }

    render(){
        return (
            <div>
                <SettingsModal closeModal={this.closeModal.bind(this)} hidden={this.state.modalHidden} settings={this.props.settings}/>
                <Header viewData={this.props.viewData} openModal={this.openModal.bind(this)} data={this.props.headerData}/>
                <TabSelector changeTab={this.changeTab.bind(this)} tab={this.state.tab} buttons={this.getTabButtons()} />
                <Tabs data={this.props.feedData} settings={this.props.settings} tab={this.state.tab} />
                <Footer />
            </div>
        );
    }
}