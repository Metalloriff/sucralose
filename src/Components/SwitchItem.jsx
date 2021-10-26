import React from "react";
import "./SwitchItem.scss";

export default function SwitchItem({ title, defaultValue, callback, ...props }) {
	return (
		<div className="SwitchItem FlexCenter" {...props}>
			<input
				className="Switch"
				type="checkbox"
				defaultChecked={defaultValue}
				onInput={e => callback?.(e.currentTarget.checked)}
			/>

			<h4>{title}</h4>
		</div>
	);
}