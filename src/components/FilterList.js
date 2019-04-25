import React, { Component } from 'react';

class FilterList extends Component {
    constructor(props) {
        super(props);

        this.updateFilters = this.updateFilters.bind(this);
        this.getGames = this.getGames.bind(this);
        this.state = {itemNames: []}

        this.singularForms = {categories: "category", families: "family", mechanics: "mechanic"};
    }

    componentDidMount() {
        this.getGames(this.props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.filterType !== this.props.filterType) {
            this.getGames(this.props);
        }
    }

    getGames(props) {
        this.setState((prevState, thisProps) => {
            let itemNames = new Set();
            props.games.forEach(
                (game) => {
                    game[thisProps.filterType].forEach(
                        (item) => {
                            itemNames.add(item);
                        }
                    );
                }
            );
            for (let item in props.currentFlags) {
                if (props.currentFlags[item]) {
                    itemNames.add(item);
                }
            }
            return {itemNames};
        });
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
                    <h3>Filter games by {this.singularForms[this.props.filterType]}</h3>
                    {Array.from(this.state.itemNames).sort().map(
                        (name, index) => (
                            <div key={index} className="single-filter">
                                <span className="filter-name">{name}</span>
                                <div className="filter-checks">
                                    <label htmlFor={`${name}Required`}>Require</label>
                                    <input type="checkbox" name={`${name}Required`}
                                    onChange={(event) => this.updateFilters(event, name, 1)}
                                    checked={this.props.currentFlags[name] === 1} />
                                    <label htmlFor={`${name}Banned`}>Remove</label>
                                    <input type="checkbox" name={`${name}Banned`}
                                    onChange={(event) => this.updateFilters(event, name, -1)}
                                    checked={this.props.currentFlags[name] === -1} />
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    }
}

export default FilterList;