import React, { Component } from 'react';

class CustomSelect extends Component {
    constructor(props) {
        super(props);

        this.selectOption = this.selectOption.bind(this);

        this.state = {value: this.props.value, open: false};
    }

    selectOption(e) {
        let value = e.target.dataset.value;
        this.setState({value, open: false}, () => this.props.updateParent(value));
    }

    render() {
        let classes = "custom-select";
        if (this.state.open) {
            classes += " open";
        }
        return (
            <div className={classes}>
                <div className="select-main" onClick={() => this.setState(({open}) => ({open: !open}))}>
                    <p className="select-text">
                        {this.props.options.find(opt => String(opt.value) === String(this.state.value)).text}
                    </p>
                    <div className="select-arrow">
                        &#9660;
                    </div>
                </div>
                <div className="select-body">
                    {this.props.options.map(({value, text}) => {
                        let classes = "select-option";
                        if (value === this.state.value) {
                            classes += " selected";
                        }
                        return (
                            <div key={value} className={classes} data-value={value} onClick={this.selectOption}>
                                {text}
                            </div>  
                        )
                    })}
                </div>
            </div>
        );
    }
}

export default CustomSelect;