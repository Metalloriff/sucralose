import React from "react";
import "./HeaderButton.scss";

import LinkWrapper from "../Components/LinkWrapper";

let zIndex = 100;

export default class extends React.Component {
	render() {
		const { href, icon, scale, children, iconStyle = {}, onClick, className = "" } = this.props;

		zIndex--;

		return (
			<LinkWrapper className={"Container " + className} href={href} style={{ zIndex }} onClick={onClick}>
				<div className="Button">
					<img className="Icon" src={icon} style={{ width: (scale || 1) * 30, ...iconStyle }}></img>
					<span className="Content">{ children }</span>
				</div>
			</LinkWrapper>
		);
	}
}