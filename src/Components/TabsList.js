import React from "react";
import "./TabsList.scss";

export default class extends React.Component {
	state = { active: null };

	componentDidMount() {
		this.setState({ active: 0 });
	}

	render() {
		const children = React.Children.toArray(this.props.children);

		return (
			<div>
				<div className="TabsList">
					{ this.props.tabs.map((title, index) => (
						<span key={title} className={"TabItem" + (index === this.state.active ? " Active" : "")} onClick={() => {
							this.setState({ active: index });

							if (this.props.onChange) {
								this.props.onChange(title, index, this);
							}
						}}>
							<span className="TabItemTitle">{ title }</span>
							<div className="TabItemBorder"/>
						</span>
					)) }
				</div>
					
				{ children.map((child, i) => (
					<div className="TabItem" key={i}
						 style={{ display: this.state.active === i ? "block" : "none" }}>
						{ child }
					</div>
				)) }
			</div>
		);
	}
}