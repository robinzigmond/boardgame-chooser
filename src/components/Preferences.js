import React, { Component } from 'react';
import CustomCheckbox from './CustomCheckbox.js';
import CustomSelect from './CustomSelect.js';
import RecommendationList from './RecommendationList.js';

class Preferences extends Component {
    constructor(props) {
        super(props);

        this.timePresets = [{mins: 30, label: "Half an Hour"},
                            {mins: 60, label: "1 Hour"},
                            {mins: 120, label: "2 Hours"},
                            {mins: 180, label: "3 Hours"}];

        this.filters = ["categories", "families", "mechanics"];
        
        this.initialiseFlags = this.initialiseFlags.bind(this);
        this.updateFilters = this.updateFilters.bind(this);
        this.doFilters = this.doFilters.bind(this);
        this.filterDisplay = this.filterDisplay.bind(this);
        this.handlePlayerCountChange = this.handlePlayerCountChange.bind(this);
        this.handleAvailableTimeChange = this.handleAvailableTimeChange.bind(this);
        this.handleTimePresetChange = this.handleTimePresetChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {playerCount: 4, availableTime: 30,
            gameOrder: "alphabetical", allGames: [],
            given: false, filteredGames: [], flags: {}, showFilters: false};
    }

    componentDidMount() {
        this.initialiseFlags();
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.gameOrder !== this.state.gameOrder) {
            this.handleSubmit(false);
        }
    }

    initialiseFlags(cb=null) {
        let flags = {};
        this.filters.forEach(filter => {
            flags[filter] = {};
        });
        this.setState({flags}, cb);
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
            let {flags} = state;
            let filteredGames = [...state.allGames];

            this.filters.forEach(filter => {
                for (let item in flags[filter]) {
                    switch(flags[filter][item]) {
                        case 1:
                            filteredGames = filteredGames.filter(game => game[filter].includes(item));
                            break;
                        case -1:
                            filteredGames = filteredGames.filter(game => !game[filter].includes(item));
                            break;
                        case 0:
                        default:
                            break;                
                    }
                }
            });
            return {filteredGames};
        });
    }

    filterDisplay(filter=false) {
        this.setState({showFilters: filter});
    }

    handlePlayerCountChange(event) {
        let val = event.target.value;
        if (val === "") {
            this.setState({playerCount: val})
        }
        else if (+val > 0) {
            this.setState({playerCount: +val});
        }
    }

    handleAvailableTimeChange(event) {
        let val = event.target.value;
        if (val === "") {
            this.setState({availableTime: val})
        }
        else if (+val >= 0) {
            this.setState({availableTime: +val});
        }
    }

    handleTimePresetChange(event) {
        if (event.target.checked) {
            this.setState({availableTime: event.target.value});
        }
        else {
            this.setState({availableTime: ""});
        }
    }

    handleOrderChange(val) {
        this.setState({gameOrder: val});
    }

    handleSubmit(clearFilters=true) {
        if (clearFilters) {
            this.initialiseFlags(() => this.handleSubmit(false));
            return;   
        }
        if (this.state.playerCount && this.state.availableTime) {
            this.setState((state, props) => {
                let foundGames = props.data.filter(game =>
                    game.minplayers <= state.playerCount
                    && game.maxplayers >= state.playerCount
                    && game.minplaytime <= state.availableTime
                    && game.maxplaytime >= state.availableTime);
                let sortFunction;
                switch(state.gameOrder) {
                    case "alphabetical":
                        sortFunction = (a,b) => {
                            // it's surprisingly unintutitive to write a sort function to order lexicographically
                            // on the result of a property extraction! But this works:
                            let tempArray = [a.name, b.name];
                            tempArray.sort();
                            return 1 - 2*(tempArray[0] === a.name);
                            // (hacky shorthand to return -1 if the comparison is true and 1 if false)
                        };
                        break;
                    case "yearpublished":
                        sortFunction = (a,b) => ((a.yearpublished || Infinity) - (b.yearpublished || Infinity));
                        break;
                    case "bggRank":
                        sortFunction = (a,b) => ((a.stats.ranks[0].value || Infinity) - (b.stats.ranks[0].value || Infinity));
                        break;
                    default:
                        let userToRate = this.state.gameOrder.slice(6);
                        sortFunction = (a,b) => ((b.ratings[userToRate] || 0) - (a.ratings[userToRate] || 0));
                        break;
                }
                foundGames.sort(sortFunction);
                return {
                    given: true,
                    allGames: foundGames
                };
            }, this.doFilters);
        }
    }

    render() {
        let ratingOrders;
        let users = this.props.users;
        if (users.length > 1){
            ratingOrders = users.map(user => ({value: `rating${user}`, text: `${user}'s rating`}));
        }
        else {
            ratingOrders = [{value: `rating${users[0]}`, text: "My Rating"}];
        }
        ratingOrders.unshift({value: "alphabetical", text: "Name (alphabetical)"},
            {value: "yearpublished", text: "Year published"});
        ratingOrders.push({value: "bggRank", text: "BGG ranking list position"});
        return (
            <div>
                <div className="form-section">
                    <div className="input-block">
                        <label htmlFor="playerCount">Number of Players</label>
                        <input type="number" name="playerCount" id="playerCount" value={this.state.playerCount} onChange={this.handlePlayerCountChange}/>
                    </div>
                    <div className="input-block">
                        <label htmlFor="availableTime">Desired Playing Time (minutes)</label>
                        <input type="number" id="availableTime" name="availableTime" value={this.state.availableTime} onChange={this.handleAvailableTimeChange}/>
                        <div>
                            Or select:
                            {this.timePresets.map(preset => (
                                <div className="time-checkbox" key={preset.mins}>
                                    <label htmlFor={`timePreset${preset.mins}`}>{preset.label}:</label>
                                    <CustomCheckbox value={preset.mins} handleChange={this.handleTimePresetChange}
                                    id={`timePreset${preset.mins}`}
                                    checked={+this.state.availableTime === preset.mins}/>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="input-block">
                        <p className="select-label">Order results by:</p>
                        <CustomSelect options={ratingOrders} value={ratingOrders[0].value}
                        updateParent={this.handleOrderChange}/>
                    </div>
                    <div className="input-block">
                        <button type="button" onClick={() => this.handleSubmit()}>
                            {this.state.given ? "Update" : "Get"} recommendations!
                        </button>
                    </div>
                </div>
                {this.state.given ?
                <RecommendationList games={this.state.filteredGames}
                key={this.state.filteredGames.map(game => game.id).join(",")} sorting={this.state.gameOrder}
                numUsers={this.props.users.length} filters={this.filters} flags={this.state.flags}
                updateFilters={this.updateFilters} showFilters={this.state.showFilters}
                filterDisplay={this.filterDisplay}/>
                : null}
            </div>
        );
    }
}

export default Preferences;