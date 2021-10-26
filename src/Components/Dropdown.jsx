import React from "react";
import "./Dropdown.scss";

export default class extends React.Component {
	state = { value: null, open: false };

	componentDidMount() {
		if (this.props.value != null) {
			this.setState({ value: this.props.items[this.props.value].value });
		}
	}

	componentDidUpdate() {
		if (this.props.callback != null) {
			this.props.callback(this);
		}
	}

	render() {
		return (
			<div className={"Dropdown" + (this.state.open ? " Open" : "")}>
				<div className={"DropdownItem Selected" + (!this.state.value ? " Grayed" : "")} onClick={() => this.setState({ open: !this.state.open })}>
					{ (this.props.items.find(item => item.value == this.state.value) || {}).label || this.props.placeholder || "None selected" }
				</div>

				{ this.props.items.map(({ key, value, label }) => (
					<div key={key} className="DropdownItem" onClick={() => this.setState({ value, open: false })}>
						{ label }
					</div>
				)) }
			</div>
		);
	}
}