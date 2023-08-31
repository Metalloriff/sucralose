import _ from "lodash";
import React, { useReducer, useState } from "react";
import QueryStore from "../Classes/QueryManager";
import UserStore from "../Classes/Stores/UserStore";
import Dropdown, { DropdownItem } from "../Components/Dropdown";
import Header from "../Components/General/Header";
import BlacklistDropdown from "../Components/Posts/BlacklistDropdown";
import Posts from "../Components/Posts/Posts";
import "./PostsPage.scss";

function formatDate(date) {
	return date.toUTCString({
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	});
}

function formatDateToE6(date) {
	const _date = new Date(date);
	_date.setDate(_date.getDate() + 1);

	return formatDate(_date);
}

let debouncer;
export default function PopularPostsPage() {
	const wtf = new Date();
	wtf.setHours(0, 0, 0, 0);
	const [date, setDate] = React.useState(new Date(QueryStore.get("date") ?? new Date()));
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	const [range, setRange] = useState(QueryStore.get("range") ?? "day");

	return (
		<div className="PostsPage">
			<Header hasSearch={false} />

			<div className="DatePicker">
				<h2>Date</h2>

				<input type="date"
					defaultValue={new Date(date).toISOString().split("T")[0]}
					onInput={_.debounce(e => {
						const date = new Date(e.target.value);

						setDate(date);

						QueryStore.set("date", formatDate(date), {
							pushHistory: false
						});
					}, 2000)} />
			</div>

			<div className="FlexCenter">
				<h2 className="Label" style={{ marginRight: 10 }}>Range</h2>

				<Dropdown value={range} onChange={range => {
					QueryStore.set("range", range, {
						pushHistory: false
					});

					setRange(range);
				}}>
					<DropdownItem value="day">Day</DropdownItem>
					<DropdownItem value="week">Week</DropdownItem>
					<DropdownItem value="month">Month</DropdownItem>
				</Dropdown>
			</div>

			<BlacklistDropdown forceUpdate={forceUpdate} />

			{UserStore.getLocalUser() && <Posts request={["popular", { date: formatDateToE6(date), scale: range, tags: "", page: "1" }]} pagingDisabled />}
		</div>
	)
}