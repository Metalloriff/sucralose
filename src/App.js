import React from "react";
import { useMediaQuery } from "react-responsive";
import "./App.scss";
import "./city-fog-theme.css";
import { Modals } from "./Components/Modals";
import HomePage from "./Pages/Home";
import Toasts from "./Components/Toasts";
import { joinClassNames } from "./Classes/Constants";
import ContextMenu from "./Components/ContextMenuHandler";
import PostsPage from "./Pages/PostsPage";
import Posts from "./Components/Posts/Posts";
import { onAuthStateChanged } from "firebase/auth";
import Database from "./Classes/Database";
import AuthModal from "./Components/Modals/AuthModal";
import SettingsPage, { Settings, SettingsRenderer } from "./Pages/SettingsPage";
import QueryManager from "./Classes/QueryManager";
import PostPage from "./Pages/PostPage";
import API from "./Classes/API";
import _ from "lodash";
import SetsList, { SetsPage } from "./Pages/SetsPage";
import PopularPostsPage from "./Pages/PopularPostsPage";
import TutorialModal from "./Components/Modals/TutorialModal";
import PageFooter from "./Components/PageElements/PageFooter";

/* TODO 

	Add an option to set a custom background.
	Add popular page https://e621.net/explore/posts/popular
	Put all to-do on README.md
	Fix the order of favorites posts.
	Add a list for blacklist and subscriptions.
	Add a quick blacklist toggle menu.

 */

window.history.scrollRestoration = "manual";

// Ugh.
let lastSearch = QueryManager.get("search") ?? "";
let lastHash = window.location.hash;
let lastModalState = QueryManager.get("modalState");
export let lastHistoryPop = Date.now();
window.addEventListener("popstate", () => {
	PageElement?.forceUpdate();
	
	// Get the current search state.
	const search = QueryManager.get("search") ?? "";
	// If the search states do not match, handle page update.
	if ((lastSearch !== search || lastHash !== window.location.hash) && document.getElementById("searchField")) {
		// Clear all post states.
		Posts.instance?.setPosts([]);
		SetsList.instances?.forEach(instance => instance.setSets([ ]));
		// Set the search field value to the search.
		document.getElementById("searchField").value = search;
		
		if (parseInt(QueryManager.get("page")) > 1) {
			QueryManager.set("page", 1, {
				pushHistory: false
			});
		}

		// Set the last search state to the current search state.
		lastSearch = search;
		// Set the last hash state to the current hash state.
		lastHash = window.location.hash;
	}
	
	// Get the current modal state.
	const modalState = QueryManager.get("modalState");
	// If the modal states do not match, handle the modal state update.
	if (lastModalState !== modalState) {
		// If the modal state is closed, close the modal.
		!modalState && Modals.pop();
		
		// Set the last modal state to the current modal state.
		lastModalState = modalState;
	}
	// Otherwise, handle updating the page.
	else {
		// Gonna be honest, I don't remember what the fuck this does.
		if (modalState && lastModalState && Modals.instance.state.stack.length)
			QueryManager.set("modalState", null);
		
		// Set the fetching states of the posts and sets.
		Posts.instance?.setFetchingState(true);
		SetsList.instances?.forEach(instance => instance.setFetchingState(true));

		// Force update the app.
		App.forceUpdate?.();
	}
	
	// Set the last pop state time to now.
	lastHistoryPop = Date.now();
	
	// Jesus fucking christ.
	setImmediate(() => {
		Posts.lastHash = window.location.hash;
	});
});

function PageElement() {
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);
	PageElement.forceUpdate = forceUpdate;
	
	// Store the formatted hash in a variable.
	const [hash, ...args] = (window.location.hash
		.split(/#\/?/)[1] ?? "")
		.split("?")[0]
		.split("/");
	
	// If the user is ready but not logged in, open the auth modal.
	if (App.userReady && !App.user && ~["subscriptions", "favorites", "settings"].indexOf(hash)) {
		// Make sure the modal is not already open.
		if (Modals.instance?.state?.stack?.length === 0) {
			Modals.push(<AuthModal/>);
		}
	}
	
	// Set the app hash value.
	App.hash = hash;
	
	// Zhu Li, do the thing!
	switch (hash) {
		default: return <HomePage/>;
		case "posts":
			return <PostsPage searchPlaceholder="Search posts..."/>;
		case "post":
			return <PostPage id={args[0]}/>;
		case "hot":
			return <PostsPage search="order:rank" searchPlaceholder="Search hot posts..."/>;
		case "popular":
			return <PopularPostsPage/>;
		case "sets":
			return <SetsPage/>;
		case "subscriptions":
			return <PostsPage search={
								(App.userData?.subscriptions?.length
									? App.userData.subscriptions.map(tag => `~${tag}`)
									: ["____"]).join(" ")}
							  searchPlaceholder="Search subscriptions..."
							  emptyPlaceholder={(
							  	<>
									<h2>No subscribed posts found.</h2>
									
									<div>
										You can subscribe to tags by right clicking on them and pressing "Subscribe."
									</div>
								</>
							  )}/>;
		case "favorites":
			return <PostsPage search={`favoritedby:${App.e621User?.name}`}
							  searchPlaceholder="Search favorites..."
							  emptyPlaceholder={(
							  	<>
									<h2>No favorited posts found.</h2>
									
									<div>
										Check your search tags, as they also apply to favorites.
									</div>
								</>
							  )}/>;
		case "upvoted":
			return <PostsPage search={`votedup:${App.e621User?.name}`}
							  searchPlaceholder="Search upvoted posts..."
							  emptyPlaceholder={(
								  <>
									  <h2>No upvoted posts found.</h2>

									  <div>
										  Check your search tags, as they also apply to upvotes.
									  </div>
								  </>
							  )}/>;
		case "settings":
			return <SettingsPage/>;
	}
}

export default function App() {
	const isMobile = useMediaQuery({ query: "(max-width: 1224px)" });
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);
	App.forceUpdate = forceUpdate;
	App.userData = App.userData ?? { };
	
	React.useEffect(() => {
		onAuthStateChanged(Database.auth, user => {
			if (user) {
				// Assign the user.
				App.user = user;
				
				Database.get("users", user.uid).then(async data => {
					// If the user's username is defined, get their e621 user data.
					if (data.username)
						App.e621User = await API.request(`users/${data.username}`);
					
					// Assign Firebase data.
					App.userData = _.extend({
						subscriptions: [],
						settings: { }
					}, data);
					
					// Assign e621 database data.
					_.extend(App.userData, {
						sets: data.username ? await API.request(
							"post_sets",
							{
								commit: "Search",
								"search[creator_name]": data.username
							}
						) : []
					});
					
					// Set user ready state and force update.
					App.userReady = true;
					App.forceUpdate();
					
					// Apply settings
					_.merge(Settings.props, App.userData.settings);
					SettingsRenderer.forceUpdate();
					SettingsPage.forceUpdate?.();
				});
			}
			else {
				App.userReady = true;
				
				if (!localStorage.getItem("hasPromptedLogin")) {
					Modals.push(<AuthModal/>);
					
					localStorage.setItem("hasPromptedLogin", "1");
				}
			}
		});
	}, []);

	return (
		<div className={joinClassNames("App", isMobile ? "Mobile" : "Desktop")}>
			<div className="AppBackground"/>
			
			<div className="Main">
				<PageElement/>
			</div>
			
			<PageFooter/>

			<Modals/>
			<Toasts/>
			<ContextMenu.Handler/>
			
			<SettingsRenderer/>
		</div>
	);
}