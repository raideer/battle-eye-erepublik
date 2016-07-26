class FeedValue extends React.Component{
    constructor(){
        super();
        this.props = {
            text: ""
        };
    }

    render(){
        return (
            <span className={"bel-value " + ((this.props.a > this.props.b && this.props.highlight)?"bel-value-hl":"")}>{parseFloat(this.props.a).toLocaleString()} {this.props.text}</span>
        );
    }
}
