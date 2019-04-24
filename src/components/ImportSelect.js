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
            <form>
                <div className="form-section">
                    <label htmlFor="bgg-username">Enter a BGG username to import their collection:</label>
                    <input type="text" name="bgg-username" onChange={this.props.handleChange} value={this.state.username}/>
                    <button type="submit" onClick={this.props.handleSubmit}>Go!</button>
                </div>
                {successMessage ? <p>{successMessage}</p> : null}
            </form>
        );
    }
}

export default ImportSelect;