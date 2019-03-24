import React, { Component } from 'react';

class CollectionInfo extends Component {
    render() {
        return (
            <div id="collection-info">
                {this.props.data.length
                ? 
                <div>
                    <p>Collections loaded for:</p>
                    <ul>{this.props.data.map((username, idx)=>(
                        <li key={idx}>
                            <input type="checkbox" name={`removeColl${username}`}/>
                            <span>{username}</span>
                        </li>
                    ))}</ul>
                </div>
                : <p>No collection data loaded yet</p>}
            </div>
        );
    }
}

export default CollectionInfo;
