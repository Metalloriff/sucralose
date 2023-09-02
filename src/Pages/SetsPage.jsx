import _ from "lodash";
import React, { useReducer } from "react";
import * as Feather from "react-feather";
import { Heart } from "react-feather";
import API from "../Classes/API";
import { joinClassNames } from "../Classes/Constants";
import Database from "../Classes/Database";
import { useEventListener } from "../Classes/Hooks";
import QueryManager from "../Classes/QueryManager";
import RoutesStore from "../Classes/Stores/RoutesStore";
import UserStore from "../Classes/Stores/UserStore";
import ContextMenu from "../Components/ContextMenuHandler";
import Header from "../Components/General/Header";
import InlineLoading from "../Components/InlineLoading";
import LinkWrapper from "../Components/LinkWrapper";
import TabsList from "../Components/TabsList";
import Toasts from "../Components/Toasts";
import "./SetsPage.scss";

let lastPageChange = Date.now();
export default function SetsList({ options = {} }) {
	const [sets, setSets] = React.useState([]);
	const [isFetching, setFetchingState] = React.useState(true);
	const [search, setSearchQuery] = React.useState("");
	const [hash, setHash] = React.useState(window.location.hash);

	const page = QueryManager.useState(() => QueryManager.get("page")) || 1;
	const query = QueryManager.useState(() => QueryManager.get("search")) || "";

	React.useEffect(() => {
		API.request(
			"post_sets",
			{
				commit: "Search", page,
				"search[order]": "update",
				"search[name]": `*${query}*`,
				...options
			}
		).then(newSets => {
			setFetchingState(false);
			if (!Array.isArray(newSets)) return;

			const _sets =
				query === search && RoutesStore.getFormattedRoute()[0] === hash
					? [...sets, ...newSets]
					: newSets;

			setSets(
				_sets.filter(
					(set, index) =>
						_sets.findIndex(s => s && s.id === set.id) === index
				)
			);

			setSearchQuery(query);
			setHash(window.location.hash);
		});
	}, [isFetching, page, query]);

	// Handle infinite scrolling.
	useEventListener("scroll", () => {
		if (Date.now() - lastPageChange < 2000 || isFetching || !sets?.length) return;

		const target = document.documentElement;

		if (target.scrollTop >= target.scrollHeight - window.innerHeight - 100) {
			QueryManager.set("page", parseInt(QueryManager.get("page", 1)) + 1, {
				pushHistory: false
			});

			lastPageChange = Date.now();
		}
	}, { dependencies: [isFetching, sets] });

	return (
		<div className="Sets">
			{!isFetching && !sets?.length && (
				<div className="NoSets">
					<div className="Placeholder">
						<h2>No sets found.</h2>

						<div>
							Check your search tags, and ensure that you've made no typos.
						</div>
					</div>

					<Feather.Frown />
				</div>
			)}

			<div className="Items">
				<div className="PostSet PostSetWarning">
					WARNING! This page is currently experimental and may be buggy.
				</div>

				<div className="PostSet PostSetNote">
					Note: Right click/tap and hold on a set to favorite it!
				</div>

				{sets?.map(set => (
					<LinkWrapper key={set.id} href={`/posts?search=set:${set.shortname}`}>
						<ContextMenu.Wrapper menu={<SetContextMenu set={set} />}>
							<div className="PostSet">
								<div className="Head">
									<div className="Title">{set.name}</div>

									<div className="ShortName">
										{set.shortname},

										<span>
											{set.post_count} posts
										</span>
									</div>
								</div>

								{set.description && <div className="Description">{set.description}</div>}
							</div>

						</ContextMenu.Wrapper>
					</LinkWrapper>
				))}
			</div>

			<div className={joinClassNames("FetchingStateModal", [isFetching, "Active"])}>
				<InlineLoading />
			</div>
		</div>
	);
}

export function SetContextMenu({ set, forceUpdate }) {
	const user = UserStore.useState(() => UserStore.getLocalUser());

	return user ? (
		<ContextMenu>
			<ContextMenu.Item
				icon={<Heart />}
				onClick={() => {
					user.favoriteSets = user.favoriteSets ?? [];

					if (user.favoriteSets.find(s => s.id === set.id)) {
						user.favoriteSets.splice(user.favoriteSets.findIndex(s => s.id === set.id), 1);
					}
					else {
						user.favoriteSets.push(_.pick(set, "created_at", "creator_id", "description", "id", "name", "shortname"));
					}

					Database.update(
						Database.doc("users", user.uid),
						{ favoriteSets: user.favoriteSets }
					).then(() => {
						Toasts.showToast("Favorite sets updated!", "Success");
						forceUpdate?.();
					});
				}}
				autoClose
			>{user.favoriteSets?.find(s => s.id === set.id) ? "Remove from" : "Add to"} Favorites</ContextMenu.Item>
		</ContextMenu>
	) : null;
}

export function SetsPage() {
	const user = UserStore.useState(() => UserStore.getLocalUser());
	const favoriteSets = UserStore.useState(() => UserStore.getLocalUser()?.favoriteSets);
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	return (
		<div className="SetsPage">
			<Header searchPlaceholder="Search sets..." />

			<TabsList tabs={["All", "Owned", "Favorites"]}>
				<SetsList />

				<SetsList options={{
					"search[creator_name]": UserStore.getLocalUser()?.username
				}} />

				{user ? (
					<div className="Sets">
						<div className="Items">
							{(favoriteSets ?? []).map(set => (
								<LinkWrapper key={set.id} href={`/posts?search=set:${set.shortname}`}>
									<ContextMenu.Wrapper menu={<SetContextMenu set={set} forceUpdate={forceUpdate} />}>
										<div className="PostSet">
											<div className="Head">
												<div className="Title">{set.name}</div>

												<div className="ShortName">
													{set.shortname}
												</div>
											</div>

											{set.description && <div className="Description">{set.description}</div>}
										</div>
									</ContextMenu.Wrapper>
								</LinkWrapper>
							))}
						</div>
					</div>
				) : (
					<div className="NoSets">
						<div className="Placeholder">
							<h2>Not signed in</h2>

							<div>
								You can't view favorited sets without signing in.
							</div>

							<div>
								Favorited sets are saved in Sucralose's database, not e621's.
							</div>
						</div>

						<Feather.Frown />
					</div>
				)}
			</TabsList>
		</div>
	)
}