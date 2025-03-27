import _ from "lodash";
import React from "react";
import { ChevronsUp } from "react-feather";
import "./App.scss";
import { ActionTypes, joinClassNames } from "./Classes/Constants";
import { dispatcher } from "./Classes/Dispatcher";
import { useEventListener, useMediaQuery } from "./Classes/Hooks";
import RoutesStore from "./Classes/Stores/RoutesStore";
import UserStore from "./Classes/Stores/UserStore";
import ContextMenu from "./Components/ContextMenuHandler";
import DarkReaderDetector from "./Components/DarkReaderDetector";
import { Modals } from "./Components/Modals";
import AuthModal from "./Components/Modals/AuthModal";
import PageFooter from "./Components/PageElements/PageFooter";
import Toasts from "./Components/Toasts";
import HomePage from "./Pages/Home";
import PopularPostsPage from "./Pages/PopularPostsPage";
import PostPage from "./Pages/PostPage";
import PostsPage from "./Pages/PostsPage";
import { SetsPage } from "./Pages/SetsPage";
import SettingsPage, { SettingsRenderer } from "./Pages/SettingsPage";
import "./city-fog-theme.css";

window.history.scrollRestoration = "manual";

function PageElement() {
	// Use force update to update the page.
	dispatcher.useForceUpdater(ActionTypes.UPDATE_PAGE);

	// Store the formatted hash in a variable.
	const [hash, ...args] = RoutesStore.getFormattedRoute();

	// Get local user state
	const localUser = UserStore.useState(() => UserStore.getLocalUser());

	// If the user is ready but not logged in, open the auth modal.
	if (localUser?.signedIn === false && (~["subscriptions", "favorites", "settings"].indexOf(hash) || location.hash.includes("sign_in"))) {
		// Make sure the modal is not already open.
		if (Modals.instance?.state?.stack?.length === 0) {
			Modals.push(<AuthModal />);
		}
	}

	// Zhu Li, do the thing!
	switch (hash) {
		default: return <HomePage />;
		case "posts":
			return <PostsPage searchPlaceholder="Search posts..." />;
		case "post":
			return <PostPage id={args[0]} />;
		case "hot":
			return <PostsPage search="order:rank" searchPlaceholder="Search hot posts..." />;
		case "popular":
			return <PopularPostsPage />;
		case "sets":
			return <SetsPage />;
		case "subscriptions":
			return <PostsPage search={
				(localUser?.subscriptions?.length
					? localUser.subscriptions.map(tag => `~${tag}`)
					: ["____"]).join(" ")}
				searchPlaceholder="Search subscriptions..."
				emptyPlaceholder={(
					<>
						<h2>No subscribed posts found.</h2>

						<div>
							You can subscribe to tags by right clicking on them and pressing "Subscribe."
						</div>
					</>
				)} />;
		case "favorites":
			return <PostsPage search={`favoritedby:${localUser?.e621User?.name}`}
				searchPlaceholder="Search favorites..."
				emptyPlaceholder={(
					<>
						<h2>No favorited posts found.</h2>

						<div>
							Check your search tags, as they also apply to favorites.
						</div>
					</>
				)} />;
		case "upvoted":
			return <PostsPage search={`votedup:${localUser?.e621User?.name}`}
				searchPlaceholder="Search upvoted posts..."
				emptyPlaceholder={(
					<>
						<h2>No upvoted posts found.</h2>

						<div>
							Check your search tags, as they also apply to upvotes.
						</div>
					</>
				)} />;
		case "settings":
			return <SettingsPage />;
	}
}

export default function App() {
	const isMobile = useMediaQuery("max-width", 1200);

	const [isScrolledDown, setScrolledDown] = React.useState(false);

	useEventListener(
		"scroll",
		_.debounce(() => {
			const { scrollTop } = document.documentElement;

			setScrolledDown(
				scrollTop > window.innerHeight && !!~[
					"posts",
					"hot",
					"popular",
					"sets",
					"subscriptions",
					"favorites",
					"upvoted"
				].indexOf(RoutesStore.getFormattedRoute()[0])
			);
		}, 100)
	);

	return (
		<div className={joinClassNames("App", isMobile ? "Mobile" : "Desktop")}>
			<div className="AppBackground" />

			<div className="Main">
				<PageElement />

				<div
					className={joinClassNames("ScrollIndicator", "HasTooltip", "FlexCenter", [isScrolledDown, "Active"])}
					onClick={() => (window.scrollTo(0, 0, { behavior: "smooth" }, setScrolledDown(false)))}
				>
					<ChevronsUp />
				</div>
			</div>

			<PageFooter />

			<Modals />
			<Toasts />
			<ContextMenu.Handler />

			<SettingsRenderer />
		</div>
	);
}
