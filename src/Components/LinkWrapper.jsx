import React from "react";
import { ActionTypes } from "../Classes/Constants";
import { dispatcher } from "../Classes/Dispatcher";
import "./LinkWrapper.scss";

export default function LinkWrapper({ children, ...props }) {
	function handleClick(e) {
		dispatcher.dispatch({
			type: ActionTypes.UPDATE_ROUTE,
			path: props.href
		});

		e.preventDefault();
		props.onClick?.(e);
	}

	return (
		<a className="LinkWrapper" onClick={handleClick} {...props}>
			{children}
		</a>
	);
}