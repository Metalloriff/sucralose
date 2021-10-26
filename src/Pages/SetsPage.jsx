import React from "react";
import * as Feather from "react-feather";
import API from "../Classes/API";
import { joinClassNames } from "../Classes/Constants";
import { useEventListener } from "../Classes/Hooks";
import QueryManager from "../Classes/QueryManager";
import RoutesStore from "../Classes/Stores/RoutesStore";
import UserStore from "../Classes/Stores/UserStore";
import Header from "../Components/General/Header";
import InlineLoading from "../Components/InlineLoading";
import LinkWrapper from "../Components/LinkWrapper";
import TabsList from "../Components/TabsList";
import "./SetsPage.scss";

let lastPageChange = Date.now();
export default function SetsList({ options = {} }) {
	const [sets, setSets] = React.useState([]);
	const [isFetching, setFetchingState] = React.useState(true);
	const [search, setSearchQuery] = React.useState("");
	const [hash, setHash] = React.useState(window.location.hash);

	const page = QueryManager.useState(() => QueryManager.get("page")) || 1;
	const query = QueryManager.useState(() => QueryManager.get("query")) || "";

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
							Check your search tags, and ensure you've made no typos.
						</div>
					</div>

					<Feather.Frown />
				</div>
			)}

			<div className="Items">
				{sets?.map(set => (
					<LinkWrapper key={set.id} href={`/posts?search=set:${set.shortname}`}>
						<div className="PostSet">
							<div className="Head">
								<div className="Title">{set.name}</div>

								<div className="ShortName">
									ID - {set.shortname} | {set.id}
								</div>
							</div>

							{set.description && <div className="Description">{set.description}</div>}
						</div>
					</LinkWrapper>
				))}
			</div>

			<div className={joinClassNames("FetchingStateModal", [isFetching, "Active"])}>
				<InlineLoading />
			</div>
		</div>
	);
}

export function SetsPage() {
	return (
		<div className="SetsPage">
			<Header searchPlaceholder="Search sets..." />

			<TabsList tabs={["All", "Owned", "Subscribed"]}>
				<SetsList />

				<SetsList options={{
					"search[creator_name]": UserStore.getLocalUser()?.username
				}} />

				<div className="NoSets">
					<div className="Placeholder">
						<h2>Not yet added.</h2>

						<div>
							This feature isn't yet available.
						</div>

						<div>
							However, you can navigate to <a href="/subscriptions">subscriptions</a> and search <b>set:*</b>
						</div>

						<div>
							This will display all subscribed set posts.
						</div>
					</div>

					<Feather.Frown />
				</div>
			</TabsList>
		</div>
	)
}