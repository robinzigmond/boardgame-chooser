import React, { Component } from 'react';

class Loader extends Component {
    render() {
        return (
            <div className="loader-box">
                <div className="loader"></div>
                <p>Loading game data...</p>
            </div>
        );
    }
}

export default Loader;