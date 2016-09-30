export default class TextValue extends React.Component{
    constructor(){
        super();
        this.props = {
            text: "",
            green: false
        };
    }

    render(){
        return (
            <span className="bel-value">{this.props.a} {this.props.text}</span>
        );
    }
}
