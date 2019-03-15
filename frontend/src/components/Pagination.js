import React, { Component } from 'react';

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

export default Pagination;