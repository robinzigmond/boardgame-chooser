import React, { Component } from 'react';
import '../App.css';
import FailureMessage from './FailureMessage.js';
import CollectionInfo from './CollectionInfo.js';
import ImportSelect from './ImportSelect.js';
import Loader from './Loader.js';
import Preferences from './Preferences.js';

const backendUrl = "http://127.0.0.1:5000";

class App extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleWantImportSubmit = this.handleWantImportSubmit.bind(this);
        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
        this.closeBox = this.closeBox.bind(this);
        this.state = {username: "", data: {games: [], users: []}, collections: 0, importWanted: true,
                        showForm: false, failure: false, showDuplicate: false};
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

    async handleImportSubmit() {
        if (this.state.data.users.includes(this.state.username)) {
            this.setState({showDuplicate: true});
            return;
        }
        this.setState(state => ({loading: true, importWanted: false, failure: false}));
        
        let collection;
        try {
            collection = await fetch(`${backendUrl}/collection/${this.state.username}`);
        }
        catch {
            this.setState({failure: true, loading: false});
            return;           
        }
        if (!collection.ok) {
            this.setState({failure: true, loading: false});
            return;
        }
        let data = await collection.json();
        if (data && data.length) {
            let prevData = this.state.data;
            prevData.users.push(this.state.username);
            let newGameIds = data.map(game => game.id);
            // split ids into chunks, to completely avoid URL character limits in the API call
            const chunkSize = 200;
            let chunkedIds = [];
            while (newGameIds.length > 0) {
                let newChunk = [];
                while (newChunk.length < chunkSize && newGameIds.length > 0) {
                    newChunk.push(newGameIds.shift());
                }
                chunkedIds.push(newChunk);
            }
            let oldGames = prevData.games;
            let oldGameIds = oldGames.map(game => game.id);
            let gamesToAdd = data.filter(game => !oldGameIds.includes(game.id));
            let failure;
            (async () => {
                // first loop through all existing users and find if they've rated any of the new games
                for (let user of prevData.users) {
                    for (let chunk of chunkedIds) {
                        let params = chunk.map(String).join("-");
                        let resp = await fetch(`${backendUrl}/check_ratings/${user}/${params}`);
                        if (!resp.ok) {
                            this.setState({failure: true, loading: false});
                            failure = true;
                            return;
                        }
                        let ratingInfo = await resp.json();
                        for (let id in ratingInfo) {
                            if (ratingInfo[id] !== null) {
                                let ratedGame = gamesToAdd.find(gm => gm.id === +id);
                                if (ratedGame) {
                                    if (ratedGame.ratings) {
                                        ratedGame.ratings[user] = ratingInfo[id];
                                    }
                                    else {
                                        ratedGame.ratings = {[user]: ratingInfo[id]};
                                    }
                                }
                            }
                        }
                    }
                }
            })()
            if (failure) {
                this.setState({failure: true, loading: false});
                return;
            }
            let updatedGames = oldGames.concat(gamesToAdd);
            // finally add ratings of the just-added user for all games on the new list
            // (even those not in the new user's collection)
            for (let game of data) {
                let foundIt = updatedGames.find(gm => gm.id === game.id); // should always exist
                if (foundIt.ratings) {
                    foundIt.ratings[this.state.username] = game.my_rating;
                }
                else {
                    foundIt.ratings = {[this.state.username]: game.my_rating};
                }
            }
            this.setState({data: {users: prevData.users, games: updatedGames}, loading: false, showForm: false});
        }
        else {
            this.setState({failure: true, loading: false});
        }
    }

    closeBox() {
        if (this.state.showDuplicate) {
            this.setState({failure: false, showDuplicate: false, username: ""});
        }
        else {
            this.setState({failure: false, showDuplicate: false});
        }
    }

    render() {
        return (
            <div className="App">
                <h1>Find a boardgame to play!</h1>
                <h4>Import your BGG collection, give your preferences and get instant recommendations</h4>
                {this.state.failure ? <FailureMessage close={this.closeBox} /> : null}
                {this.state.showDuplicate ? <FailureMessage close={this.closeBox} duplicate={true} /> : null}
                <CollectionInfo data={this.state.data.users}/>
                <div className="form-section">
                    <label htmlFor="importCheck">Do you want to import a new collection?</label>
                    <input name="importCheck" type="checkbox" onChange={this.handleCheckboxChange} checked={this.state.importWanted}/>
                    <button type="button" onClick={this.handleWantImportSubmit} disabled={!this.state.importWanted}>Import it!</button>
                </div>
                {this.state.showForm ?
                <ImportSelect handleChange={this.handleUserNameChange} handleSubmit={this.handleImportSubmit}/>
                : null}
                {this.state.loading ? <Loader /> : null}
                {!this.state.loading && this.state.data.games.length && !this.state.showForm ?
                <Preferences data={this.state.data.games} users={this.state.data.users} /> : null}
            </div>
        );
    }
}

export default App;
