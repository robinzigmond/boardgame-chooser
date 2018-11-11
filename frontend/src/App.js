import React, { Component } from 'react';
import './App.css';

const backendUrl = "http://127.0.0.1:5000/collection/";

class App extends Component {
    render() {
        return (
            <div className="App">
                <h1>Find a boardgame to play!</h1>
                <h4>Import your BGG collection, give your preferences and get instant recommendations</h4>
                <ImportSelect />
            </div>
        );
    }
}

class ImportSelect extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {username: "", data: null, loading: false};
    }

    handleChange(event) {
        this.setState({username: event.target.value});
    }

    handleSubmit() {
        this.setState({loading: true});
        fetch(backendUrl+this.state.username)
            .then(response => response.json())
            .then(json => this.setState({data: json, loading: false}));
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
                <input type="text" name="bgg-username" onChange={this.handleChange} value={this.state.username}/>
                <button type="button" onClick={this.handleSubmit}>Import!</button>
                {this.state.loading ? <p>Loading game data...</p> : null}
                {successMessage ? <p>{successMessage}</p> : null}
                {!this.state.loading && this.state.data && this.state.data.length ?
                <Preferences data={this.state.data}/> : null}
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
        this.state = {playerCount: 1, availableTime: 30, gameOrder: "myRating", recommendations: [], given: false};
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
            case "myRating":
                sortFunction = (a,b) => (b.my_rating - a.my_rating);
                break;
            case "bggRating":
                sortFunction = (a,b) => (b.stats.average - a.stats.average);
                break;
            case "geekRating":
                sortFunction = (a,b) => (b.stats.bayesaverage - a.stats.bayesaverage);
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
    render() {
        if (this.props.games.length) {
            return (
                <div>
                    <h3>Recommended Games</h3>
                    <ul>
                        {this.props.games.map(game => (
                            <li key={game.id}>{game.name}</li>
                        ))}
                    </ul>
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
