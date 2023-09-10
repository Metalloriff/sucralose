import Dropdown, { DropdownItem } from "../Dropdown";

export const OrderTypes = {
	Default: "",
	Random: "order:random",
	Score: "order:score",
	FavCount: "order:favcount",
	TagCount: "order:tagcount",
	NewestFirst: "order:id_desc",
	OldestFirst: "order:id",
	Resolution: "order:mpixels",
	FileSize: "order:filesize"
};

export default function OrderDropdown({ onChange }) {
	return (
		<div className="Order FlexCenter">
			<h2 className="Label">Order</h2>

			<Dropdown onChange={onChange}>
				{Object.keys(OrderTypes).map(key => (
					<DropdownItem key={key} value={OrderTypes[key]}>{key}</DropdownItem>
				))}
			</Dropdown>
		</div>
	);
}