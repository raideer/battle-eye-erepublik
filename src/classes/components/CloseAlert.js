class CloseAlert extends React.Component{
    render(){
        return (
            <div id="belClosed" className="bel-closed">
                Connection to the server was closed. Refresh the page to reconnect
                <p>This has nothing to do with BattleEye. <i>Maybe You opened another battle in a new tab?</i></p>
            </div>
        );
    }
}
