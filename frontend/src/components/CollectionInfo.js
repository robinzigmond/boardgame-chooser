import React, { Component } from 'react';
import ImportSelect from './ImportSelect.js';

class CollectionInfo extends Component {
    constructor(props) {
        super(props);

        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.toggleRemoval = this.toggleRemoval.bind(this);

        this.state = {importWanted: this.props.importWanted, toDelete: []};
    }

    handleCheckboxChange(event) {
        this.setState({importWanted: event.target.checked});
    }

    toggleRemoval(username) {
        let found = this.state.toDelete.findIndex(user => user === username);
        this.setState(state => {
            let toDelete = state.toDelete;
            if (found === -1) {
                toDelete.push(username);
            }
            else {
                toDelete.splice(found, 1);
            }
            return {toDelete};
        });
     }

    render() {
        return (
            <div id="collection-info">
                {this.props.data.length
                ? 
                <div>
                    <p>Collections loaded for:</p>
                    <ul>{this.props.data.map((username, idx)=>(
                        <li key={idx}>
                            <input type="checkbox" onChange={() => this.toggleRemoval(username)}/>
                            <span>{username}</span>
                        </li>
                    ))}</ul>
                    {this.state.toDelete.length ?
                    <button onClick={() => this.props.removeUsers(this.state.toDelete)}>
                    Remove selected collections</button>
                    : null}
                </div>
                : <p>No collection data loaded yet</p>}
                {this.props.showForm ?
                <ImportSelect handleChange={this.props.handleUserNameChange}
                handleSubmit={this.props.handleImportSubmit}/>
                : 
                <div className="form-section">
                    <label htmlFor="importCheck">Do you want to import a new collection?</label>
                    <input name="importCheck" type="checkbox" onChange={this.handleCheckboxChange}
                    checked={this.state.importWanted}/>
                    {this.state.importWanted ? 
                    <button type="button" onClick={this.props.handleWantImportSubmit}>Click to import</button>
                    : null }
                </div>}
            </div>
        );
    }
}

export default CollectionInfo;
