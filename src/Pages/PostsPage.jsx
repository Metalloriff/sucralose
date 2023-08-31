import { useEffect, useReducer, useState } from "react";
import API from "../Classes/API";
import { ActionTypes } from "../Classes/Constants";
import { dispatcher } from "../Classes/Dispatcher";
import UserStore from "../Classes/Stores/UserStore";
import Header from "../Components/General/Header";
import BlacklistDropdown from "../Components/Posts/BlacklistDropdown";
import Posts from "../Components/Posts/Posts";
import "./PostsPage.scss";

export default function PostsPage({
	search: prependedTags = "",
	searchPlaceholder,
	emptyPlaceholder = null
}) {
	const searchTags = decodeURIComponent(window.location.href.split("search=")?.[1]);
	dispatcher.useForceUpdater(ActionTypes.UPDATE_ROUTE);

	const [forceUpdateIteration, forceUpdate] = useReducer(x => x + 1, 0);
	const [pool, setPool] = useState(null);

	useEffect(() => {
		if (searchTags.startsWith("pool:")) {
			API.request(`/pools/${searchTags.split(":")[1]}`).then(data => {
				setPool(data);
			});
		}
		else setPool(null);

		return () => setPool(null);
	}, [searchTags]);

	return (
		<div className="PostsPage">
			<Header searchPlaceholder={searchPlaceholder} />

			<BlacklistDropdown forceUpdate={forceUpdate} />

			{pool && (
				<div className="PoolInfo">
					<h2 className="Name"><span>{pool.name.split("_").join(" ")}</span> by <a href={`/posts?search=${pool.creator_name}`}>{pool.creator_name}</a></h2>

					<p className="Description">
						{pool.description}
					</p>
				</div>
			)}

			{UserStore.getLocalUser() && (
				<Posts
					key={prependedTags}
					prependedTags={prependedTags}
					emptyPlaceholder={emptyPlaceholder}
				/>
			)}
		</div>
	)
}