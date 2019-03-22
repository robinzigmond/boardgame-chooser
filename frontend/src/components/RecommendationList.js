import React, { Component } from 'react';
import Pagination from './Pagination.js';
import FilterList from './FilterList.js';

class RecommendationList extends Component {
    constructor(props) {
        super(props);
        this.gamesPerPage = 10;
        let lastPage = Math.ceil(this.props.games.length / this.gamesPerPage);

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

    componentDidMount() {
        this.initialiseFlags();
    }

    componentDidUpdate() {
        this.setState(state => {
            let lastPage = Math.ceil(state.filteredGames.length / this.gamesPerPage);
            if (state.lastPage !== lastPage) {
                return {lastPage};
            }
        });
    }

    initialiseFlags() {
        let flags = {};
        this.filters.forEach(filter => {
            flags[filter] = {};
        });
        this.setState({flags});
    }

    first() {
        this.setState({page: 1});
    }

    next() {
        this.setState(state => {
            let nextPage = Math.min(state.page + 1, state.lastPage);
            return {page: nextPage};
        });
    }

    last() {
        this.setState(state => ({page: state.lastPage}));
    }

    prev() {
        this.setState(state => ({page: Math.max(1, state.page - 1)}));
    }

    convertRating(rating, precision, fallback) {
        if (rating == null) {
            return fallback || "not rated";
        }
        return (+rating).toFixed(precision)
    }

    updateFilters(itemName, filterName, flag=0) {
        this.setState(state => {
            let flags = state.flags;
            flags[filterName][itemName] = flag;
            return {flags, page: 1};
        }, this.doFilters);
    }

    doFilters() {
        // flag values: +1 - required, -1 - banned, 0 - neither
        this.setState(state => {
            let {flags, games} = state;

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
            return {filteredGames: games};
        });
    }

    render() {
        if (this.state.games.length) {
            let columnInfo;
            switch (this.props.sorting) {
                case "bggRank":
                    columnInfo = {"name": "BGG ranking list position",
                                    extract: gm => this.convertRating(gm.stats.ranks[0].value, 0, "not ranked")};
                    break;
                default:
                    // must be of the form "ratingXXX" where "XXXX" is the username
                    let username = this.props.sorting.slice(6);
                    columnInfo = {"name": this.props.numUsers > 1 ? `${username}'s rating` : "My rating",
                                    extract: gm => this.convertRating(gm.ratings[username], 1, "not ranked")};
            }
            return (
                <div className="game-list">
                    <h3>
                        Recommended Games
                        {this.state.lastPage > 1 ? ` - page ${this.state.page} of ${this.state.lastPage}` : null}
                    </h3>
                    {this.state.lastPage > 1 ? 
                    <Pagination first={this.first} next={this.next} prev={this.prev} last={this.last}
                    onFirst={this.state.page === 1} onLast = {this.state.page === this.state.lastPage}/>
                    : null}
                    <table className="gamelist" cellSpacing="0">
                        <thead>
                            <tr>
                                <th>Game</th>
                                <th>{columnInfo.name}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.filteredGames.slice((this.state.page - 1) * this.gamesPerPage, this.state.page * this.gamesPerPage).map(game => (
                                <tr key={game.id}>
                                    <td>
                                        <a href={`https://boardgamegeek.com/boardgame/${game.id}`} target="_blank"
                                        rel="noopener noreferrer">
                                            <img alt={`${game.name}`} src={game.thumbnail} />
                                            <h4>{game.name}</h4>
                                        </a>
                                    </td>
                                    <td>{columnInfo.extract(game)}</td>
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
                    key={this.state.filteredGames.map(game=>game.id).join(",")}
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

export default RecommendationList;