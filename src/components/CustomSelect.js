import React, { Component } from 'react';

class CustomSelect extends Component {
    constructor(props) {
        super(props);

        this.selectOption = this.selectOption.bind(this);

        this.state = {value: this.props.value, open: false};
    }

    componentDidUpdate(prevProps) {
        let newLength = this.props.options.length;
        let oldLength = prevProps.options.length
        if ((newLength === 1 && oldLength > 1) || (newLength > 1 && oldLength === 1)) {
            this.setState({open: false});
        }
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
                <div className="select-main"
                onClick={() => this.setState(({open}) => (
                    {open: this.props.options.length > 1 ? !open : false}
                ))}>
                <p className="select-text">
                        {this.props.options.find(opt => String(opt.value) === String(this.state.value)).text}
                    </p>
                    {this.props.options.length > 1 ?
                    <div className="select-arrow">
                        &#9660;
                    </div>
                    : null}
                </div>
                <div className="select-body">
                    {this.props.options.map(({value, text}) => {
                        let classes = "select-option";
                        if (String(value) === String(this.state.value)) {
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