import React from "react";
import "./TabsList.scss";

export default class extends React.Component {
	state = { active: null };

	componentDidMount() {
		this.setState({ active: this.props.tabs[0] });
	}

	render() {
		const children = React.Children.toArray(this.props.children);

		return (
			<div>
				<div className="TabsList">
					{ this.props.tabs.map(title => (
						<span key={title} className={"TabItem" + (title == this.state.active ? " Active" : "")} onClick={() => {
							this.setState({ active: title });

							if (this.props.onChange) {
								this.props.onChange(title, this);
							}
						}}>
							<span className="TabItemTitle">{ title }</span>
							<div className="TabItemBorder"></div>
						</span>
					)) }
				</div>
					
				{ children.find(c => c.props.tab == this.state.active) }
			</div>
		);
	}
}