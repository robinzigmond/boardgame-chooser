import React, { Component } from 'react';

class FailureMessage extends Component {
    render() {
        let text;
        if (this.props.duplicate) {
            text = "You've already got that user's collection imported!";
        }
        else {
            text = "Failed to load - please check the username and try again!";
        }
        return (
            <div className="failure">
                <p>{text}</p>
                <div className="close-box" onClick={this.props.close}>X</div>
            </div>
        )
    }
}

export default FailureMessage;
