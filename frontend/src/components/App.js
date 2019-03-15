import React, { Component } from 'react';
import '../App.css';
import FailureMessage from './FailureMessage.js';
import CollectionInfo from './CollectionInfo.js';
import ImportSelect from './ImportSelect.js';
import Loader from './Loader.js';
import Preferences from './Preferences.js';

const backendUrl = "http://127.0.0.1:5000/collection/";

class App extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleWantImportSubmit = this.handleWantImportSubmit.bind(this);
        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
        this.closeBox = this.closeBox.bind(this);
        this.state = {username: "", data: null, collections: 0, importWanted: true, showForm: false, failure: false};
    }

    handleCheckboxChange(event) {
        this.setState({importWanted: event.target.checked});
    }

    handleWantImportSubmit() {
        this.setState({showForm: true});
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value});
    }

    handleImportSubmit() {
        this.setState({data: [], loading: true, importWanted: false, showForm: false, failure: false});
        fetch(backendUrl+this.state.username)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    this.setState({failure: true, loading: false});
                }
            })
            .then(json => {
                if (json && json.length) {
                    this.setState(prevState => ({data: [{username: prevState.username, data: json}], loading: false}));
                }
                else {
                    this.setState({failure: true, loading: false});
                }
            });
    }

    closeBox() {
        this.setState({failure: false});
    }

    render() {
        return (
            <div className="App">
                <h1>Find a boardgame to play!</h1>
                <h4>Import your BGG collection, give your preferences and get instant recommendations</h4>
                {this.state.failure ? <FailureMessage close={this.closeBox} /> : null}
                <CollectionInfo data={this.state.data}/>
                <div className="form-section">
                    <label htmlFor="importCheck">Do you want to import a new collection?</label>
                    <input name="importCheck" type="checkbox" onChange={this.handleCheckboxChange} checked={this.state.importWanted}/>
                    <button type="button" onClick={this.handleWantImportSubmit} disabled={!this.state.importWanted}>Import it!</button>
                </div>
                {this.state.showForm ?
                <ImportSelect handleChange={this.handleUserNameChange} handleSubmit={this.handleImportSubmit}/>
                : null}
                {this.state.loading ? <Loader /> : null}
                {!this.state.loading && this.state.data && this.state.data.length && !this.state.showForm ?
                <Preferences data={this.state.data.reduce((acc, userdata) =>acc.concat(userdata.data), [])}/> : null}
            </div>
        );
    }
}

export default App;
