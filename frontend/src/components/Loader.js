import React, { Component } from 'react';

class Loader extends Component {
    render() {
        const meepleColours = ["red", "yellow", "green", "blue"];
        let randColour = meepleColours[Math.floor(Math.random()*meepleColours.length)];
        const classStr = `loader meeple-${randColour}`
        return (
            <div className="loader-box">
                <div className={classStr}></div>
                <p>Loading collection...</p>
            </div>
        );
    }
}

export default Loader;