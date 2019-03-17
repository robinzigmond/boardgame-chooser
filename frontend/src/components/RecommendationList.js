import React, { Component } from 'react';
import Pagination from './Pagination.js';
import FilterList from './FilterList.js';

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

    componentDidMount() {
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
            var ratingColumns;
            if (this.props.users.length > 1) {
                ratingColumns = this.props.users.map(username => ({colname: `${username}'s rating`, fieldref: username}));
            }
            else {
                ratingColumns = [{colname: "Your rating", fieldref: this.props.users[0]}];
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
                    <table className="gamelist">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Image</th>
                                {ratingColumns.map(col => (
                                    <th key={col.fieldref}>{col.colname}</th>   
                                ))}
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
                                    {ratingColumns.map(col => (
                                        <td key={col.fieldref}>{this.convertRating(game.ratings[col.fieldref], 1)}</td>
                                    ))}
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