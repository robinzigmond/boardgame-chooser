import React, { Component } from 'react';

class FilterList extends Component {
    constructor(props) {
        super(props);

        this.updateFilters = this.updateFilters.bind(this);
        this.getGames = this.getGames.bind(this);
        this.state = {itemNames: []}
    }

    componentDidMount() {
        this.getGames(this.props);
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

export default FilterList;