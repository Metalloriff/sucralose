import "./Dropdown.scss";

export default function Dropdown({ value = null, children = null, onChange = v => { } }) {
	const events = {
		onChange: e => {
			onChange(e.target.value);
		}
	};

	return (
		<select className="Dropdown" {...events} defaultValue={value}>
			{children}
		</select>
	);
}

export function DropdownItem({ value, children }) {
	return (
		<option className="DropdownItem" value={value}>
			{children}
		</option>
	);
}