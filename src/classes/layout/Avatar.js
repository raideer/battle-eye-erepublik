import React from 'react';

export default class Avatar extends React.Component {
    getAvatarStyle(c) {
        return {
            backgroundImage: `url('${c}')`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            width: '27px',
            height: '20px',
            marginLeft: '5px',
            marginRight: '5px',
            borderRadius: '5px',
            display: 'inline-block'
        };
    }

    render() {
        return (
            <div style={this.getAvatarStyle(this.props.avatar)}></div>
        );
    }
}
