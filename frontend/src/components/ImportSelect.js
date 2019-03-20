import React, { Component } from 'react';

class ImportSelect extends Component {
    constructor(props) {
        super(props);
        this.state = {loading: false};
    }

    render() {
        let successMessage;
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

export default ImportSelect;