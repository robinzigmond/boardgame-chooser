import React, { Component } from 'react';

class FailureMessage extends Component {
    render() {
        return (
            <div className="failure">
                <p>Failed to load - please check the username and try again!</p>
                <div className="close-box" onClick={this.props.close}>X</div>
            </div>
        )
    }
}

export default FailureMessage;
