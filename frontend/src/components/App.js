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
        this.setState({data: this.state.data || [], loading: true, importWanted: false,
                        showForm: false, failure: false});
        fetch(`${backendUrl}/collection/${this.state.username}`)
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
                    var params = json.map(gm => ""+gm.id).join("-");
                    // more care needs to be taken over the above, a very large collection could easily
                    // lead to a URL of over the permitted 2048(ish) characters. Probably should split into
                    // sets of ~3-400 (perhaps less, seems to go quickly enough now)
                    this.setState(prevState => {
                        var prevData = prevState.data;
                        // not working still - but setting of state here actually looks ok.
                        // Must be going wrong in the reduce that assembles the data for the
                        // table - but now see no reason not to just keep a single list of games
                        // in the state, with (along with the global info), an "owned" property holding
                        // a list of the owners, and a "ratings" property holding an object mapping
                        // currently loaded users to their rating
                        (async function loop() {
                        for (let userData of prevData) {
                            var resp = await fetch(`${backendUrl}/check_ratings/${userData.username}/${params}`);
                            if (!resp.ok) {
                                // deal with error somehow, come back to later
                            }
                            var ratingInfo = await resp.json();
                            for (let id in ratingInfo) {
                                if (ratingInfo[id]) {
                                    let ratedGame = Object.assign({}, json.find(gm => gm.id === +id));
                                    ratedGame.my_rating = ratingInfo[id];
                                    userData.data.push(ratedGame);
                                }
                            }
                        }
                        })()
                        var newData = {username: prevState.username, data: json};
                        prevData.push(newData);
                        return {data: prevData, loading: false};
                    });
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
                <Preferences data={this.state.data.reduce(
                    // see above - intend to replace this with something simple, moving the logic into the
                    // App's state
                    (acc, userdata) => {
                        userdata.data.forEach(game => {
                            var overlap = acc.find(gm => gm.id === game.id)
                            if (overlap) {
                                overlap.ratings[userdata.username] = game.my_rating;
                            }
                            else {
                                game.ratings = {};
                                this.state.data.map(user => user.username).forEach(name => {
                                    game.ratings[name] = undefined;
                                });
                                game.ratings[userdata.username] = game.my_rating;
                                acc.push(game);
                            }
                        });
                        return acc;
                    }, []
                )}/> : null}
            </div>
        );
    }
}

export default App;
