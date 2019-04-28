import React, { Component } from 'react';
import '../App.css';
import SiteInfo from './SiteInfo.js';
import FailureMessage from './FailureMessage.js';
import CollectionInfo from './CollectionInfo.js';
import Loader from './Loader.js';
import Preferences from './Preferences.js';

const backendUrl = "https://wgtp-backend.herokuapp.com";

class App extends Component {
    constructor(props) {
        super(props);

        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
        this.closeBox = this.closeBox.bind(this);
        this.removeUsers = this.removeUsers.bind(this);

        this.state = {username: "", data: {games: [], users: []}, failure: false, showDuplicate: false};
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value});
    }

    async handleImportSubmit(e) {
        e.preventDefault();
        if (this.state.data.users.includes(this.state.username)) {
            this.setState({showDuplicate: true});
            return;
        }
        this.setState({loading: true, failure: false});
        
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
            function chunks(arr, size) {
                let chunks = [];
                while (arr.length > 0) {
                    let newChunk = [];
                    while (newChunk.length < size && arr.length > 0) {
                        newChunk.push(arr.shift());
                    }
                    chunks.push(newChunk);
                }
                return chunks;            
            }

            let oldGames = prevData.games;
            let oldGameIds = oldGames.map(game => game.id);
            let gamesToAdd = data.filter(game => !oldGameIds.includes(game.id));

            let newGameIdChunks = chunks(newGameIds, chunkSize);
            let oldGameIdChunks = chunks(oldGameIds, chunkSize);

            let failure;
            (async () => {
                // first loop through all existing users and find if they've rated any of the new games
                for (let user of prevData.users) {
                    setRatings(user, newGameIdChunks, gamesToAdd);
                }

                // then, conversely, add the new user's ratings for all games already in collection
                setRatings(this.state.username, oldGameIdChunks, oldGames);

                async function setRatings(user, gameIdChunks, gamesToSearch) {
                    for (let chunk of gameIdChunks) {
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
                                let ratedGame = gamesToSearch.find(gm => gm.id === +id);
                                if (ratedGame) {
                                    if (ratedGame.ratings) {
                                        ratedGame.ratings[user] = ratingInfo[id];
                                    }
                                    else {
                                        ratedGame.ratings[user] = {[user]: ratingInfo[id]};
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

            // finally,
            // 1) add the username to the "users" property of each game object, for the games just added
            // 2) make sure each game has a "ratings" property
            updatedGames.forEach(game => {
                if (!game.users) {
                    game.users = [];
                }
                if (data.map(gm => gm.id).includes(game.id)) {
                    game.users.push(this.state.username);
                }
                if (!game.ratings) {
                    game.ratings = {};
                }
            });
            this.setState({data: {users: prevData.users, games: updatedGames}, loading: false});
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

    removeUsers(toDelete) {
        this.setState(state => {
            let {users, games} = state.data;
            toDelete.forEach(user => {
                if (users.includes(user)) {
                    let idx = users.findIndex(theUser => theUser === user);
                    users.splice(idx, 1);
                }
            });
            let noMoreUsers = [];
            games.forEach(game => {
                game.users = game.users.filter(user => !toDelete.includes(user));
                for (let user of toDelete) {
                    if (Object.keys(game.users).includes(user)) {
                        delete game.users[user];
                    }
                }
                if (!game.users.length) {
                    noMoreUsers.push(game.id);
                }
            });
            games = games.filter(game => !noMoreUsers.includes(game.id));
            return {data: {users, games}};
        });
    }

    render() {
        let dataToUse = this.state.data.games.filter(game => game.users.length);
        return (
            <div className="App">
                <h1>Find a boardgame to play!</h1>
                <h4>Import your BGG collection, give your preferences and get instant recommendations</h4>
                <SiteInfo/>
                {this.state.failure ? <FailureMessage close={this.closeBox} /> : null}
                {this.state.showDuplicate ? <FailureMessage close={this.closeBox} duplicate={true} /> : null}
                <CollectionInfo data={this.state.data.users} showForm={!this.state.data.users.length}
                handleUserNameChange={this.handleUserNameChange} handleImportSubmit={this.handleImportSubmit}
                removeUsers={this.removeUsers} key={this.state.data.users} />
                {this.state.loading ? <Loader /> : null}
                {!this.state.loading && this.state.data.games.length ?
                <Preferences key={dataToUse.length} data={dataToUse} users={this.state.data.users} /> : null}
            </div>
        );
    }
}

export default App;
