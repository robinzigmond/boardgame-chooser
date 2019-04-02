import React, { Component } from 'react';
import RecommendationList from './RecommendationList.js';

class Preferences extends Component {
    constructor(props) {
        super(props);
        this.handlePlayerCountChange = this.handlePlayerCountChange.bind(this);
        this.handleAvailableTimeChange = this.handleAvailableTimeChange.bind(this);
        this.handleOrderChange = this.handleOrderChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {playerCount: 4, availableTime: 30,
            gameOrder: `rating${this.props.users[0]}`,
            recommendations: [], given: false};
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
        else if (+val > 0) {
            this.setState({availableTime: +val});
        }
    }

    handleOrderChange(event) {
        this.setState({gameOrder: event.target.value}, this.handleSubmit);
    }

    handleSubmit() {
        if (this.state.playerCount && this.state.availableTime) {
            this.setState((state, props) => {
                let foundGames = props.data.filter(game =>
                    game.minplayers <= state.playerCount
                    && game.maxplayers >= state.playerCount
                    && game.minplaytime <= state.availableTime
                    && game.maxplaytime >= state.availableTime);
                let sortFunction;
                switch(state.gameOrder) {
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
                    recommendations: foundGames
                };
            });
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
        return (
            <div>
                <div className="form-section">
                    <div className="input-block">
                        <label htmlFor="playerCount">Number of Players</label>
                        <input type="number" name="playerCount" value={this.state.playerCount} onChange={this.handlePlayerCountChange}/>
                    </div>
                    <div className="input-block">
                        <label htmlFor="availableTime">Desired Playing Time (minutes)</label>
                        <input type="text" name="availableTime" value={this.state.availableTime} onChange={this.handleAvailableTimeChange}/>
                    </div>
                    <div className="input-block">
                        <label htmlFor="order">Order results by:</label>
                        <select name="order" value={this.state.gameOrder} onChange={this.handleOrderChange}>
                            {ratingOrders.map(order => (
                                <option key={order.value} value={order.value}>{order.text}</option>  
                            ))}
                            <option value="bggRank">BGG ranking list position</option>
                        </select>
                    </div>
                    <div className="input-block">
                        <button type="button" onClick={this.handleSubmit}>Get recommendations!</button>
                    </div>
                </div>
                {this.state.given ?
                <RecommendationList games={this.state.recommendations}
                key={this.state.recommendations.map(game => game.id).join(",")} sorting={this.state.gameOrder}
                numUsers={this.props.users.length}/>
                : null}
            </div>
        );
    }
}

export default Preferences;