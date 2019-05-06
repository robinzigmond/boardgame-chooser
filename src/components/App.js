import React, { Component } from 'react';
import '../App.css';
import SiteInfo from './SiteInfo.js';
import FailureMessage from './FailureMessage.js';
import CollectionInfo from './CollectionInfo.js';
import Loader from './Loader.js';
import Preferences from './Preferences.js';

const backendUrl = "https://wgtp-backend.herokuapp.com";
const poll_interval = 5000;
const max_tries = 50;

class App extends Component {
    constructor(props) {
        super(props);

        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.clearAndRemove = this.clearAndRemove.bind(this);
        this.checkStatus = this.checkStatus.bind(this);
        this.handleRequest = this.handleRequest.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
        this.setRatings = this.setRatings.bind(this);
        this.getUserData = this.getUserData.bind(this);
        this.closeBox = this.closeBox.bind(this);
        this.removeUsers = this.removeUsers.bind(this);

        this.tries = 0;
        this.intervals = {};
        // used to track whether any more Ajax requests need to be made, while importing a user's collection
        this.pendingRequests = false;
        this.meepleColours = ["red", "yellow", "green", "blue"];

        let randColour = this.meepleColours[Math.floor(Math.random()*this.meepleColours.length)];

        this.state = {username: "", data: {games: [], users: []}, failure: false, showDuplicate: false,
            loading: false, meepleColour: randColour};
    }

    componentWillUnmount() {
        for (let id of this.intervals) {
            this.clearAndRemove(id);
        }
    }

    handleUserNameChange(event) {
        this.setState({username: event.target.value});
    }

    clearAndRemove(jobId) {
        clearInterval(this.intervals[jobId]);
        delete this.intervals[jobId];
    }

    async checkStatus(id, cb) {
        this.tries++;
        let raw = await fetch(`${backendUrl}/result/${id}`);
        let res = await raw.json();
        if (res.done) {
            this.clearAndRemove(id);
            this.tries = 0;
            cb(res.result);

            // only remove the loader when we know no more Ajax requests will be sent out,
            // and there are no jobs still pending
            if (!this.pendingRequests && !Object.keys(this.intervals).length) {
                this.setState({loading: false});
            }
        }
        else if (res.failed || (this.tries >= max_tries)) {
            this.clearAndRemove(id);
            this.tries = 0;
            this.setState({failure: true, loading: false});
            this.pendingRequests = false;
        }
    }

    async handleRequest(url, cb) {
        let raw = await fetch(url);
        if (!raw.ok) {
            this.setState({failure: true, loading: false});
            this.pendingRequests = false;
        }
        let json = await raw.json();
        let id = json["job_id"];
        this.intervals[id] = setInterval(() => this.checkStatus(id, cb), poll_interval);
    }

    async setRatings(user, gameIdChunks, gamesToSearch) {
        let gamesArr = [...gamesToSearch];
        for (let chunk of gameIdChunks) {
            let params = chunk.map(String).join("-");
            await this.handleRequest(`${backendUrl}/check_ratings/${user}/${params}`,
                ratingInfo => {
                for (let id in ratingInfo) {
                    if (ratingInfo[id] !== null) {
                        let ratedGame = gamesArr.find(gm => gm.id === +id);
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
            });
        }

        return gamesArr;
    }

    async getUserData() {
        if (this.pendingRequests) {
            return; // do nothing if there are requests still ongoing - hopefully avoids
            // the same user's collection being added multiple times, as I saw when in an area with
            // poor wifi
        }
        this.handleRequest(`${backendUrl}/collection/${this.state.username}`, data => {
            this.setState(state => {
                if (data && data.length) {
                    this.pendingRequests = true;
                    let prevData = {games: [...state.data.games],
                        users: [...state.data.users]};
                    prevData.users.push(state.username);
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
        
                    (async () => {
                        // first loop through all existing users and find if they've rated any of the new games
                        for (let user of prevData.users) {
                            gamesToAdd = await this.setRatings(user, newGameIdChunks, gamesToAdd);
                        }
        
                        // then, conversely, add the new user's ratings for all games already in collection
                        oldGames = await this.setRatings(this.state.username, oldGameIdChunks, oldGames);

                        // no more requests will be sent out
                        this.pendingRequests = false;
                    })()

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
                    return {data: {users: prevData.users, games: updatedGames}};
                }
                else {
                    return {failure: true, loading: false};
                }
            });
        });
    }

    async handleImportSubmit(e) {
        e.preventDefault();
        if (this.state.data.users.includes(this.state.username)) {
            this.setState({showDuplicate: true});
        }
        else {
            let randColour = this.meepleColours[Math.floor(Math.random()*this.meepleColours.length)];
            this.setState({loading: true, failure: false, meepleColour: randColour}, this.getUserData);
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
                {this.state.loading ? <Loader colour={this.state.meepleColour}/> : null}
                {!this.state.loading && this.state.data.games.length ?
                <Preferences key={dataToUse.length} data={dataToUse} users={this.state.data.users} /> : null}
            </div>
        );
    }
}

export default App;
