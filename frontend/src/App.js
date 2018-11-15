import React, { Component } from 'react';
import './App.css';

const backendUrl = "http://127.0.0.1:5000/collection/";

class App extends Component {
    constructor(props) {
        super(props);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleWantImportSubmit = this.handleWantImportSubmit.bind(this);
        this.handleUserNameChange = this.handleUserNameChange.bind(this);
        this.handleImportSubmit = this.handleImportSubmit.bind(this);
        this.state = {username: "", data: null, collections: 0, importWanted: true, showForm: false};
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
        this.setState({data: [], loading: true, importWanted: false, showForm: false});
        fetch(backendUrl+this.state.username)
            .then(response => response.json())
            .then(json => this.setState(prevState => ({data: [{username: prevState.username, data: json}], loading: false})));
    }

    render() {
        return (
            <div className="App">
                <h1>Find a boardgame to play!</h1>
                <h4>Import your BGG collection, give your preferences and get instant recommendations</h4>
                <p>{this.state.data && this.state.data.length
                ? `Collections loaded for: ${this.state.data.map(data=>data.username).join(", ")}`
                : "No collection data loaded yet"}</p>
                <label htmlFor="importCheck">Do you want to import a new collection?</label>
                <input name="importCheck" type="checkbox" onChange={this.handleCheckboxChange} checked={this.state.importWanted}/>
                <button type="button" onClick={this.handleWantImportSubmit} disabled={!this.state.importWanted}>Import it!</button>
                {this.state.showForm ?
                <ImportSelect handleChange={this.handleUserNameChange} handleSubmit={this.handleImportSubmit}/>
                : null}
                {this.state.loading ? <p>Loading game data...</p> : null}
                {!this.state.loading && this.state.data && this.state.data.length && !this.state.showForm ?
                <Preferences data={this.state.data.reduce((acc, userdata) =>acc.concat(userdata.data), [])}/> : null}
            </div>
        );
    }
}

class ImportSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: false};
    }

    render() {
        var successMessage;
        if (this.state.data && !this.state.loading) {
            if (this.state.data.length) {
                successMessage = "Collection successfully loaded!";
            }
            else {
                successMessage = "Invalid username entered";
            }
        }
        return (
            <div>
                <label htmlFor="bgg-username">Enter your BGG username to import your collection:</label>
                <input type="text" name="bgg-username" onChange={this.props.handleChange} value={this.state.username}/>
                <button type="button" onClick={this.props.handleSubmit}>Import!</button>
                {successMessage ? <p>{successMessage}</p> : null}
            </div>
        );
    }
}

class Preferences extends Component {
    constructor(props) {
        super(props);
        this.handlePlayerCountChange = this.handlePlayerCountChange.bind(this);
        this.handleAvailableTimeChange = this.handleAvailableTimeChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {playerCount: 4, availableTime: 30, gameOrder: "myRating", recommendations: [], given: false};
    }

    handlePlayerCountChange(event) {
        this.setState({playerCount: +event.target.value});
    }

    handleAvailableTimeChange(event) {
        this.setState({availableTime: +event.target.value});
    }

    handleOrderChange(event) {
        this.setState({gameOrder: event.target.value});
    }

    handleSubmit() {
        var foundGames = this.props.data.filter(game =>
            game.minplayers <= this.state.playerCount
            && game.maxplayers >= this.state.playerCount
            && game.minplaytime <= this.state.availableTime
            && game.maxplaytime >= this.state.availableTime);
        var sortFunction;
        switch(this.state.gameOrder) {
            case "bggRating":
                sortFunction = (a,b) => (b.stats.average - a.stats.average);
                break;
            case "geekRating":
                sortFunction = (a,b) => (b.stats.bayesaverage - a.stats.bayesaverage);
                break;
            case "myRating":
            default:
                sortFunction = (a,b) => (b.my_rating - a.my_rating);
                break;
        }
        foundGames.sort(sortFunction);
        this.setState({
            given: true,
            recommendations: foundGames
        });
    }

    render() {
        return (
            <div>
                <label htmlFor="playerCount">Number of Players</label>
                <input type="number" name="playerCount" value={this.state.playerCount} onChange={this.handlePlayerCountChange}/>
                <label htmlFor="availableTime">Desired Playing Time</label>
                <input type="text" name="availableTime" value={this.state.availableTime} onChange={this.handleAvailableTimeChange}/>
                <label htmlFor="order">Order results by:</label>
                <select name="order" value={this.state.gameOrder} onChange={this.handleOrderChange}>
                    <option value="myRating">My Rating</option>
                    <option value="bggRating">Overall BGG Rating</option>
                    <option value="geekRating">BGG "Geek Rating"</option>
                </select>
                <button type="button" onClick={this.handleSubmit}>Get recommendations!</button>
                {this.state.given ? <RecommendationList games={this.state.recommendations}/> : null}
            </div>
        );
    }
}

class RecommendationList extends Component {
    convertRating(rating, precision, fallback) {
        if (rating == null) {
            return fallback || "not rated";
        }
        return (+rating).toFixed(precision)
    }

    render() {
        if (this.props.games.length) {
            return (
                <div>
                    <h3>Recommended Games</h3>
                    <table className="gamelist">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Image</th>
                                <th>Your rating</th>
                                <th>Overall BGG rating</th>
                                <th>BGG "Geek Rating"</th>
                                <th>BGG ranking list position</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.props.games.map(game => (
                                <tr key={game.id}>
                                    <td>{game.name}</td>
                                    <td><img alt={`${game.name}`} src={game.thumbnail} /></td>
                                    <td>{this.convertRating(game.my_rating, 1)}</td>
                                    <td>{this.convertRating(game.stats.average, 2)}</td>
                                    <td>{this.convertRating(game.stats.bayesaverage, 2)}</td>
                                    <td>{this.convertRating(game.stats.ranks[0].value, 0, "not ranked")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )            
        }
        else {
            return (
                <p>Unfortunately, none of your games fit your criteria!</p>
            );
        }
    }
}

export default App;
