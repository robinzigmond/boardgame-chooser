import React, { Component } from 'react';

class Loader extends Component {
    render() {
        const classStr = `loader meeple-${this.props.colour}`
        return (
            <div className="loader-box">
                <div className={classStr}></div>
                <p>Loading collection...</p>
            </div>
        );
    }
}

export default Loader;