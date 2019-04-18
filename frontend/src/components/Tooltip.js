import React, { Component } from 'react';

class Tooltip extends Component {
    constructor(props) {
        super(props);

        this.toolTip = React.createRef();
    }

    componentDidMount() {
        this.toolTip.current.style.right = this.props.xPos + "px";
        this.toolTip.current.style.bottom = this.props.yPos + "px";
    }

    render() {
        let {required, banned} = this.props.info;
        return (
            <div id="tooltip" ref={this.toolTip}>
                <div id="tooltip-body">
                    <p>
                        {required.length ? (
                            <span>
                                <strong>Required: </strong>
                                {required.join(", ")}
                            </span>
                        ) : null}
                        {required.length && banned.length ? " " : null}
                        {banned.length ? (
                            <span>
                                <strong>Removed: </strong>
                                {banned.join(", ")}
                            </span>
                        ) : null}
                    </p>
                </div>
                <div id="tooltip-arrow"></div>
            </div>
        )
    }
}

export default Tooltip;
