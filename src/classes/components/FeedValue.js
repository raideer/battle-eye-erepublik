class FeedValue extends React.Component{
    constructor(){
        super();
        this.props = {
            text: "",
            green: false
        };
    }

    render(){
        return (
            <span className={"bel-value " + ((this.props.a > this.props.b && this.props.highlight)?((this.props.green==true)?"bel-value-hl-w":"bel-value-hl-l"):"")}>{parseFloat(this.props.a).toLocaleString()} {this.props.text}</span>
        );
    }
}
