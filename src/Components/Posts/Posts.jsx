import _ from "lodash";
import React, { useState } from "react";
import * as Feather from "react-feather";
import App from "../../App";
import API from "../../Classes/API";
import { ActionTypes, joinClassNames } from "../../Classes/Constants";
import { dispatcher } from "../../Classes/Dispatcher";
import { useEventListener } from "../../Classes/Hooks";
import QueryManager from "../../Classes/QueryManager";
import RoutesStore from "../../Classes/Stores/RoutesStore";
import UserStore from "../../Classes/Stores/UserStore";
import { Settings } from "../../Pages/SettingsPage";
import InlineLoading from "../InlineLoading";
import { Modals } from "../Modals";
import TutorialModal from "../Modals/TutorialModal";
import Toasts from "../Toasts";
import Post from "./Post";
import "./Posts.scss";

export function postFilter(post, index) {
	const localUser = UserStore.getLocalUser();
	if (!localUser) return;

	const bidx = parseInt(localUser.currentBlacklist);
	const blacklist = localUser?.blacklists?.[bidx] ?? [];

	// Handle blacklist
	if (bidx > -1) {
		if (!blacklist) {
			Toasts.showToast("Warning! There was an error finding your blacklist, no posts are filtered currently.", "Failure");

			return true;
		}

		const postTags = Object.values(post.tags).flat().map(tag => tag.toLowerCase());
		const blacklistTags = blacklist.tags.split("\n").map(tag => tag.toLowerCase());

		// Add rating as tag
		postTags.push(`rating:${post.rating}`);

		// Post is blacklisted
		if (blacklistTags.some(tags => tags.split(" ").filter(Boolean).every(tag => postTags.includes(tag))))
			return false;
		// Post is not blacklisted
		return true;
	}

	return true;
}

export let PostsContext = React.createContext({});

// Two months later, this code makes me want to punch a wall.
// Idk how many more years later, but it makes me want to punch a wall even more.
let lastPageChange = performance.now();
let hasReachedEnd = false;
let lastHash = RoutesStore.getFormattedRoute()[0];
let lastSuccessfulRequest = null;
export default function Posts({ prependedTags, emptyPlaceholder = null, request = null, pagingDisabled = false }) {
	const [posts, setPosts] = React.useState([]);
	const [isFetching, setFetchingState] = React.useState(true);
	const [search, setSearchQuery] = React.useState(QueryManager.get("search"));
	const [hash, setHash] = React.useState(RoutesStore.getFormattedRoute()[0]);
	const [cachedRequest, setCachedRequest] = React.useState(request);

	const searchQuery = QueryManager.useState(() => QueryManager.get("search"));
	const pageQuery = QueryManager.useState(() => QueryManager.get("page"));

	const [columnCount, setColumnCount] = useState(Math.round(window.innerWidth / 480));

	useEventListener("resize", () => {
		setColumnCount(Math.round(window.innerWidth / 480));
	}, { target: window });

	console.log(columnCount);

	dispatcher.useForceUpdater(ActionTypes.UPDATE_LOCAL_USER);

	React.useEffect(() => {
		setFetchingState(true);
		setPosts([]);
	}, [searchQuery, prependedTags]);

	React.useEffect(() => {
		if (!hasReachedEnd && !pagingDisabled) {
			setFetchingState(true);
		}
	}, [pageQuery]);

	React.useEffect(() => {
		const page = parseInt(pageQuery || 1);
		const tags = [
			searchQuery,
			prependedTags
		].join(" ").trim();

		if (_.isArray(cachedRequest?.[1]?.tags)) {
			cachedRequest[1].tags = cachedRequest[1].tags.join(" ").trim();
		}

		if (JSON.stringify(cachedRequest) !== JSON.stringify(request)) {
			!isFetching && setFetchingState(true);
			setCachedRequest(request);
		}

		isFetching && setTimeout(async () => {
			if (request && !request[1].page)
				request[1].page = page;
			if (request && !request[1].tags)
				request[1].tags = tags;

			let endpoint = "posts";
			const params = { tags, page };
			const localUser = UserStore.getLocalUser();

			if (prependedTags === `favoritedby:${localUser?.e621User?.name}` &&
				!searchQuery) {
				endpoint = "favorites";

				delete params.tags;
			}

			const _request = request ?? [
				endpoint,
				params
			];

			// I have no clue why this is here, but I am too afraid to touch it.
			if (_.isEqual(lastSuccessfulRequest, _request) && lastHash === RoutesStore.getFormattedRoute()[0])
				return setFetchingState(false);

			const tagChunk = UserStore.getLocalUser()?.e621User?.tagQueryLimit ?? 40;
			function chunkifyTags(request) {
				let chunk = tagChunk;
				const newTags = [];
				let tags = (request[1].tags || "");
				if (typeof (tags) !== "string") tags = tags.join(" ");
				tags = tags.split(" ").filter(Boolean);

				if (tags.length >= tagChunk) {
					while (chunk <= tags.length + tagChunk) {
						newTags.push(tags.slice(chunk - tagChunk, chunk).join(" "));

						chunk += tagChunk;
					}

					if (!localStorage.getItem("chunk-tag-warning")) {
						Modals.push(
							<TutorialModal title="Tag Warning!">
								Your tag query is too large to be processed by the server.<br />
								e621 has a limit of {tagChunk} tags per request,<br />
								but Sucralose attempts to chunk your tag query into multiple requests.<br /><br />
								Because of this, your tag query will be split into {newTags.length} requests.<br /><br />
								This will drastically increase the amount of time it takes to<br />
								process your requests, and may interfere with sorting.<br /><br />
								It's recommended that you reduce your search tags, blacklists, or subscribed tag count.
							</TutorialModal>
						);

						localStorage.setItem("chunk-tag-warning", "1");
					}

					request[1].tags = newTags;
				}
				else {
					request[1].tags = [request[1].tags || ""];

					localStorage.removeItem("chunk-tag-warning");
				}

				return request;
			}

			const tempPosts = [];
			let resPosts = [];

			if (endpoint === "favorites") {
				const response = await API.request(..._request);
				resPosts = response.posts;
			}
			else {
				const req = chunkifyTags(_request);
				for (let i = 0; i < req[1].tags?.length; i++) {
					const tagChunk = req[1].tags[i];
					const newRequest = _.cloneDeep(req);

					newRequest[1].tags = tagChunk;
					newRequest[1].limit = Math.max(5, (localUser?.e621User?.per_page ?? 50) / req[1].tags.length);

					const response = await API.request(...newRequest);
					tempPosts.push(...(response.posts ?? []));
				}

				resPosts = _request[1].tags.length > 1
					? tempPosts
						.filter((post, index) => tempPosts.indexOf(post) === index)
						.sort((a, b) => a.created_at < b.created_at ? 1 : -1)
					: tempPosts;
			}

			setFetchingState(false);

			hasReachedEnd = false;

			if (page > 1 && !resPosts.length) {
				QueryManager.set("page", page - 1, {
					pushHistory: false
				});

				hasReachedEnd = true;
			}
			else lastSuccessfulRequest = _request;

			const _posts =
				tags === search && RoutesStore.getFormattedRoute()[0] === hash && !request
					? [...posts, ...resPosts]
					: resPosts;

			setPosts(
				_posts.filter((post, index) => _posts.findIndex(p => p && p.id === post.id) === index)
			);

			setSearchQuery(tags);
			setHash(RoutesStore.getFormattedRoute()[0]);
		}, 0);
	}, [isFetching, request, cachedRequest, searchQuery, pageQuery]);

	// Handle infinite scrolling.
	useEventListener("scroll", () => {
		if (pagingDisabled) return;

		// How much shit do I throw on here to prevent this bug from happening?
		if (performance.now() - lastPageChange < 2000 || isFetching || !posts?.length || hasReachedEnd || document.querySelector(".FetchingStateModal.Active")) return;

		const target = document.documentElement;

		if (target.scrollTop >= target.scrollHeight - window.innerHeight - 100) {
			QueryManager.set("page", parseInt(QueryManager.get("page", 1)) + 1, {
				pushHistory: false
			});

			lastPageChange = performance.now();
		}
	}, { dependencies: [isFetching, posts, request, hasReachedEnd] });

	const filteredPosts = posts.filter(postFilter);

	return (
		<PostsContext.Provider value={{
			posts
		}}>
			<div className="Posts" style={{
				"--post-column-count": Math.min(Math.max(columnCount, Settings.props.posts.minColumns.value), Settings.props.posts.maxColumns.value),
				"--post-height": Settings.props.posts.postHeight.value + "px"
			}}>

				<h2 className="PageLabel">{App.hash}</h2>

				{!isFetching && !filteredPosts?.length && (
					<div className="NoPosts">
						<div className="Placeholder">{emptyPlaceholder ?? (
							<>
								<h2>No posts found.</h2>

								<div>
									Check your search tags, and ensure you've made no typos.
								</div>
							</>
						)}</div>

						<Feather.Frown />
					</div>
				)}

				<div className="Items">
					{filteredPosts?.map(post => <Post post={post} key={post.id} />)}
				</div>

				{hasReachedEnd && (
					<div className="ReachedEndPlaceholder FlexCenter">
						<h2>You've reached the end of your search.</h2>

						<Feather.Frown />
					</div>
				)}

				<div className={joinClassNames("FetchingStateModal", [isFetching, "Active"])}>
					<InlineLoading />
				</div>
			</div>
		</PostsContext.Provider>
	);
}