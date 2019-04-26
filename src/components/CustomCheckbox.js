import React, { Component } from 'react';

class CustomCheckbox extends Component {
    render() {
        return (
            <React.Fragment>
                <input type="checkbox" value={this.props.value} onChange={this.props.handleChange}
                    id={this.props.id} checked={this.props.checked}/>
                <div className="custom-checkbox">
                    {this.props.checked ? "\u2713" : ""}
                </div>
            </React.Fragment>
        );
    }
}

export default CustomCheckbox;
