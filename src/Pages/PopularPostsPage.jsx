import React from "react";
import UserStore from "../Classes/Stores/UserStore";
import Header from "../Components/General/Header";
import Posts from "../Components/Posts/Posts";
import "./PostsPage.scss";

function formatDate(date) {
	return [date.getUTCDate(), date.getMonth() + 1, date.getFullYear()].join("-");
}

export default function PopularPostsPage() {
	const wtf = new Date();
	const [date, setDate] = React.useState(
		formatDate(
			new Date(
				`${wtf.getFullYear()}-${(wtf.getUTCMonth() + 1).toString().padStart(2, "0")}-${(wtf.getDay() + 1).toString().padStart(2, "0")} 0:00`
			)
		)
	);

	return (
		<div className="PostsPage">
			<Header hasSearch={false} />

			<div className="DatePicker">
				<h2>Date</h2>

				<input type="date" ref={e => e && !e.value ? e.valueAsDate = new Date() : null}
					onInput={e => setDate(formatDate(new Date(e.target.value)))} />
			</div>

			{UserStore.getLocalUser() && <Posts request={["explore/posts/popular", { date, scale: "day" }]} />}
		</div>
	)
}