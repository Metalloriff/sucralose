import { useEffect, useReducer, useState } from "react";
import API from "../Classes/API";
import { ActionTypes, getRandomKey } from "../Classes/Constants";
import Database from "../Classes/Database";
import { dispatcher } from "../Classes/Dispatcher";
import UserStore from "../Classes/Stores/UserStore";
import Dropdown, { DropdownItem } from "../Components/Dropdown";
import Header from "../Components/General/Header";
import { Modals } from "../Components/Modals";
import CreateBlacklistModal from "../Components/Modals/CreateBlacklistModal";
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

	const onChangeBlacklist = selection => {
		if (selection.startsWith("action.")) {
			switch (selection) {
				case "action.create":
					Modals.push(<CreateBlacklistModal />);
					break;

				case "action.edit":
					dispatcher.dispatch({
						type: ActionTypes.UPDATE_ROUTE,
						path: "/settings"
					});
					break;
			}

			return forceUpdate();
		}

		UserStore.getLocalUser().currentBlacklist = selection;

		Database.update(
			Database.doc("users", UserStore.getLocalUser().uid),
			{ currentBlacklist: selection }
		);

		dispatcher.dispatch({
			type: ActionTypes.UPDATE_LOCAL_USER,
			user: UserStore.getLocalUser()
		});
	};

	return (
		<div className="PostsPage">
			<Header searchPlaceholder={searchPlaceholder} />

			{UserStore.getLocalUser() && (
				<div className="Blacklists FlexCenter">
					<h2 className="Label">Blacklist</h2>

					<Dropdown value={UserStore.getLocalUser().currentBlacklist} onChange={onChangeBlacklist} key={getRandomKey()}>
						<DropdownItem value="defaults.none">None</DropdownItem>

						{(UserStore.getLocalUser().blacklists ?? []).map(({ name, tags }, index) => (
							<DropdownItem key={index} value={index}>{name}</DropdownItem>
						))}

						<DropdownItem value="action.none" />
						<DropdownItem value="action.edit">EDIT BLACKLISTS</DropdownItem>
						<DropdownItem value="action.create">CREATE NEW BLACKLIST</DropdownItem>
					</Dropdown>
				</div>
			)}

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