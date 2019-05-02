import React, { Component } from 'react';
import Pagination from './Pagination.js';
import FilterList from './FilterList.js';
import Tooltip from './Tooltip.js';

class RecommendationList extends Component {
    constructor(props) {
        super(props);
        this.gamesPerPage = 20;
        let lastPage = Math.ceil(this.props.games.length / this.gamesPerPage);

        this.first = this.first.bind(this);
        this.next = this.next.bind(this);
        this.last = this.last.bind(this);
        this.prev = this.prev.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        this.container = React.createRef();

        this.state = {page: 1, lastPage, tooltip: false};
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

    handleMouseEnter(event, filter) {
        let rect = this.container.current.getBoundingClientRect();
        let filterInfo = this.props.flags[filter];
        let allFlags = Object.keys(filterInfo);
        let required = allFlags.filter(k => filterInfo[k] === 1);
        let banned = allFlags.filter(k => filterInfo[k] === -1);
        this.setState({tooltip: true, tooltipInfo: {required, banned},
            mouseX: rect.width - event.pageX + rect.left + window.scrollX - 20,
            mouseY: rect.height - event.pageY + rect.top + window.scrollY + 10});
    }

    handleMouseLeave() {
        this.setState({tooltip: false, tooltipInfo: {}, mouseX: null, mouseY: null});
    }

    render() {
        if (this.props.games.length) {
            let getInfo;
            switch (this.props.sorting) {
                case "alphabetical":
                    break;
                case "yearpublished":
                    getInfo = (gm => this.convertRating(gm.yearpublished, 0, "unknown"));
                    break;
                case "weight":
                    getInfo = (gm => this.convertRating(gm.stats.averageweight, 2, "not enough data"));
                    break;
                case "bggRank":
                    getInfo = (gm => this.convertRating(gm.stats.ranks[0].value, 0, "not ranked"));
                    break;
                default:
                    // must be of the form "ratingXXX" where "XXXX" is the username
                    let username = this.props.sorting.slice(6);
                    getInfo = (gm => this.convertRating(gm.ratings[username], 1, "not rated"));
            }
            return (
                <div className="game-list" ref={this.container}>
                    {this.props.games.length ? (
                        <React.Fragment>
                            <div className="filters">
                                <p>Filter results by:</p>
                                <ul>
                                    {this.props.filters.map((filter, index) => {
                                            let currentFilter = this.props.flags[filter];
                                            let used = currentFilter && Object.keys(currentFilter).some(
                                                flg => currentFilter[flg] !== 0
                                            );
                                            return (
                                                <li key={index}
                                                className={"filter-option" + (used ? " filter-used" : "")}
                                                onClick={() => this.props.filterDisplay(filter)}>
                                                    <span onMouseEnter={used ? (e) => this.handleMouseEnter(e, filter) : null}
                                                    onMouseLeave={used ? this.handleMouseLeave : null}>
                                                        {filter}
                                                    </span>
                                                </li>
                                            )
                                        }
                                    )}
                                </ul>
                            </div>
                            <div>
                                <h3>
                                    Suitable Games
                                    {this.state.lastPage > 1 ? ` - page ${this.state.page} of ${this.state.lastPage}` : null}
                                </h3>
                                {this.state.lastPage > 1 ? 
                                <Pagination first={this.first} next={this.next} prev={this.prev} last={this.last}
                                onFirst={this.state.page === 1} onLast = {this.state.page === this.state.lastPage}/>
                                : null}
                                <div className="gamelist">
                                    {this.props.games.slice((this.state.page - 1) * this.gamesPerPage, this.state.page * this.gamesPerPage).map(game => (
                                        <div className="game-info" key={game.id}>
                                            <a href={`https://boardgamegeek.com/boardgame/${game.id}`} target="_blank"
                                            rel="noopener noreferrer">
                                                <img alt={`${game.name}`} src={game.thumbnail} />
                                                <h4>
                                                    {game.name}
                                                    {getInfo ? ` (${getInfo(game)})` : null}
                                                </h4>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                {this.state.lastPage > 1 ? 
                                <Pagination first={this.first} next={this.next} prev={this.prev} last={this.last}
                                onFirst={this.state.page === 1} onLast = {this.state.page === this.state.lastPage}/>
                                : null}
                            </div>
                        </React.Fragment>
                    ) : <p>Unfortunately, none of your games fit the filters you've selected!</p>}
                    {this.props.showFilters ?
                    <FilterList games={this.props.games} updateFilters={this.props.updateFilters}
                    currentFlags={this.props.flags[this.props.showFilters]}
                    close={() => this.props.filterDisplay()}
                    key={this.props.games.map(game=>game.id).join(",")}
                    filterType={this.props.showFilters}/>
                    : null}
                    {this.state.tooltip ?
                    <Tooltip info={this.state.tooltipInfo} xPos={this.state.mouseX} yPos={this.state.mouseY}/>
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