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

class FailureMessage extends Component {
    render() {
        return (
            <div className="failure">
                <p>Failed to load - please check the username and try again!</p>
                <div className="close-box" onClick={this.props.close}>X</div>
            </div>
        )
    }
}

class Loader extends Component {
    render() {
        return (
            <div className="loader-box">
                <div className="loader"></div>
                <p>Loading game data...</p>
            </div>
        );
    }
}

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
                <div className="form-section">
                    <label htmlFor="bgg-username">Enter your BGG username to import your collection:</label>
                    <input type="text" name="bgg-username" onChange={this.props.handleChange} value={this.state.username}/>
                    <button type="button" onClick={this.props.handleSubmit}>Import!</button>
                </div>
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
                <div className="form-section">
                    <label htmlFor="playerCount">Number of Players</label>
                    <input type="number" name="playerCount" value={this.state.playerCount} onChange={this.handlePlayerCountChange}/>
                    <label htmlFor="availableTime">Desired Playing Time (minutes)</label>
                    <input type="text" name="availableTime" value={this.state.availableTime} onChange={this.handleAvailableTimeChange}/>
                    <label htmlFor="order">Order results by:</label>
                    <select name="order" value={this.state.gameOrder} onChange={this.handleOrderChange}>
                        <option value="myRating">My Rating</option>
                        <option value="bggRating">Overall BGG Rating</option>
                        <option value="geekRating">BGG "Geek Rating"</option>
                    </select>
                    <button type="button" onClick={this.handleSubmit}>Get recommendations!</button>
                </div>
                {this.state.given ? <RecommendationList games={this.state.recommendations} /> : null}
            </div>
        );
    }
}

class RecommendationList extends Component {
    constructor(props) {
        super(props);
        this.gamesPerPage = 10;
        var lastPage = Math.ceil(this.props.games.length / this.gamesPerPage);

        this.filters = ["categories", "families", "mechanics"];

        this.initialiseFlags = this.initialiseFlags.bind(this);

        this.first = this.first.bind(this);
        this.next = this.next.bind(this);
        this.last = this.last.bind(this);
        this.prev = this.prev.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.doFilters = this.doFilters.bind(this);

        this.state = {games: this.props.games, filteredGames: this.props.games, page: 1, lastPage, flags: {},
                        showFilters: false};
    }

    componentWillMount() {
        this.initialiseFlags();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({games: this.props.games, filteredGames: nextProps.games, page: 1, flags: {},
                        showFilters: false});
        this.initialiseFlags();
    }

    componentDidUpdate() {
        var lastPage = Math.ceil(this.state.filteredGames.length / this.gamesPerPage);
        if (this.state.lastPage !== lastPage) {
            this.setState({lastPage});
        }
    }

    initialiseFlags() {
        var flags = {};
        this.filters.forEach(filter => {
            flags[filter] = {};
        });
        this.setState({flags});
    }

    first() {
        this.setState({page: 1});
    }

    next() {
        var nextPage = Math.min(this.state.page + 1, this.state.lastPage);
        this.setState({page: nextPage});
    }

    last() {
        this.setState({page: this.state.lastPage});
    }

    prev() {
        this.setState({page: Math.max(1, this.state.page - 1)});
    }

    convertRating(rating, precision, fallback) {
        if (rating == null) {
            return fallback || "not rated";
        }
        return (+rating).toFixed(precision)
    }

    updateFilters(itemName, filterName, flag=0) {
        var flags = this.state.flags;
        flags[filterName][itemName] = flag;
        this.setState({flags, page: 1}, this.doFilters);
    }

    doFilters() {
        // flag values: +1 - required, -1 - banned, 0 - neither
        var {flags, games} = this.state;

        this.filters.forEach(filter => {
            for (let item in flags[filter]) {
                switch(flags[filter][item]) {
                    case 1:
                        games = games.filter(game => game[filter].includes(item));
                        break;
                    case -1:
                        games = games.filter(game => !game[filter].includes(item));
                        break;
                    case 0:
                    default:
                        break;                
                }
            }
        });
        this.setState({filteredGames: games});
    }

    render() {
        if (this.state.games.length) {
            return (
                <div className="game-list">
                    <h3>
                        Recommended Games
                        {this.state.lastPage > 1 ? `- page ${this.state.page} of ${this.state.lastPage}` : null}
                    </h3>
                    {this.state.lastPage > 1 ? 
                    <Pagination first={this.first} next={this.next} prev={this.prev} last={this.last}
                    onFirst={this.state.page === 1} onLast = {this.state.page === this.state.lastPage}/>
                    : null}
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
                            {this.state.filteredGames.slice((this.state.page - 1) * this.gamesPerPage, this.state.page * this.gamesPerPage).map(game => (
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
                    {this.state.lastPage > 1 ? 
                    <Pagination first={this.first} next={this.next} prev={this.prev} last={this.last}
                    onFirst={this.state.page === 1} onLast = {this.state.page === this.state.lastPage}/>
                    : null}
                    <div>
                        <p>Filter results by:</p>
                        {this.filters.map((filter, index) =>
                            <ul key={index}>
                                <li className="filter-option" onClick={() => this.setState({showFilters: filter})}>{filter}</li>
                            </ul>
                        )}
                    </div>
                    {this.state.showFilters ?
                    <FilterList games={this.state.filteredGames} updateFilters={this.updateFilters}
                    currentFlags={this.state.flags[this.state.showFilters]}
                    close={() => {this.setState({showFilters: false})}}
                    filterType={this.state.showFilters}/>
                    : null}
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

class Pagination extends Component {
    render() {
        return (
            <div className="pagination-buttons">
                <button onClick={this.props.first} disabled={this.props.onFirst}>|&lt;</button>
                <button onClick={this.props.prev} disabled={this.props.onFirst}>&lt;</button>
                <button onClick={this.props.next} disabled={this.props.onLast}>&gt;</button>
                <button onClick={this.props.last} disabled={this.props.onLast}>&gt;|</button>
            </div>
        );
    }
}

class FilterList extends Component {
    constructor(props) {
        super(props);

        this.updateFilters = this.updateFilters.bind(this);
        this.getGames = this.getGames.bind(this);
        this.state = {itemNames: []}
    }

    componentWillMount() {
        this.getGames(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.getGames(nextProps);
    }

    getGames(props) {
        var itemNames = new Set();
        props.games.forEach(
            (game) => {
                game[this.props.filterType].forEach(
                    (item) => {
                        itemNames.add(item);
                    }
                );
            }
        );
        for (var item in props.currentFlags) {
            if (props.currentFlags[item]) {
                itemNames.add(item);
            }
        }
        this.setState({itemNames});
    }

    updateFilters(event, name, status) {
        if (event.target.checked) {
            this.props.updateFilters(name, this.props.filterType, status);
        }
        else {
            this.props.updateFilters(name, this.props.filterType);
        }
    }

    render() {
        return (
            <div className="filter-list">
                <div className="wrapper">
                    <div className="close-box" onClick={this.props.close}>X</div>
                    {Array.from(this.state.itemNames).sort().map(
                        (name, index) => (
                            <div key={index}>
                                <span>{name}:  </span>
                                <label htmlFor={`${name}Required`}>Require</label>
                                <input type="checkbox" name={`${name}Required`}
                                onChange={(event) => this.updateFilters(event, name, 1)}
                                checked={this.props.currentFlags[name] === 1}/>
                                <label htmlFor={`${name}Banned`}>Remove</label>
                                <input type="checkbox" name={`${name}Banned`}
                                onChange={(event) => this.updateFilters(event, name, -1)}
                                checked={this.props.currentFlags[name] === -1} />
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }
}

export default App;
