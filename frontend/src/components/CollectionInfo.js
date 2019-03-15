import React, { Component } from 'react';

class CollectionInfo extends Component {
    render() {
        return (
            <div id="collection-info">
                {this.props.data && this.props.data.length
                ? 
                <div>
                    <p>Collections loaded for:</p>
                    <ul>{this.props.data.map((data, idx)=>(
                        <li key={idx}>{data.username}</li>
                    ))}</ul>
                </div>
                : <p>No collection data loaded yet</p>}
            </div>
        );
    }
}

export default CollectionInfo;
