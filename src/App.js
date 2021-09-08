import React from "react";
import { useMediaQuery } from "react-responsive";
import "./App.scss";
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

/* TODO 

	Add an option to set a custom background.
	Add popular page https://e621.net/explore/posts/popular
	Put all to-do on README.md
	Fix the order of favorites posts.
	Add a list for blacklist and subscriptions.
	Add a quick blacklist toggle menu.

 */

let lastSearch = QueryManager.get("search") ?? "";
window.addEventListener("popstate", () => {
	const search = QueryManager.get("search") ?? "";
	if (lastSearch !== search && document.getElementById("searchField")) {
		Posts.instance?.setPosts([]);
		SetsList.instances?.forEach(instance => instance.setSets([ ]));
		document.getElementById("searchField").value = search;

		lastSearch = search;
	}
	
	App.forceUpdate?.();
	Posts.instance?.setFetchingState(true);
	SetsList.instances?.forEach(instance => instance.setFetchingState(true));
});

function PageElement() {
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
			
			// If the user is new to the site, display the V2 modal.
			if (!localStorage.getItem("v2")) {
				Modals.push(
					<TutorialModal title="Welcome to the new Sucralose!">
						<h2>What's different?</h2>
						
						<p>
							I've re-built the site from the ground up, with better code, performance, 
							and most importantly, better device support.
						</p>
						
						<p>
							Some of the new features include the following:
							
							<ul>
								<li>
									<div><b>Database!</b></div>
									I've added a Firebase database to the site, which will let you create 
									an account and sync your data between devices and browsers.
								</li>
								
								<br/>
								
								<li>
									<div><b>Mobile support</b></div>
									Mobile support was pretty bad in the previous release, but 
									this version was started with mobile in mind.
								</li>
								
								<br/>
								
								<li>
									<div><b>Better UI/UX</b></div>
									This is of course an opinional thing, but the user interface and user 
									experience has been redesigned for a friendlier experience.
								</li>
								
								<br/>
								
								<li>
									<div><b>Popular page</b></div>
									This is an overlooked feature in e621, mostly because its UI is 
									so outdated; but it has been incorporated into Sucralose with a 
									little better interface.
								</li>
								
								<br/>
								
								<li>
									<div><b>Search everything, everywhere</b></div>
									The previous version of Sucralose did not let you search hot, 
									favorites, sets, etc. All of this is fixed in this version.
								</li>
							</ul>
						</p>
					</TutorialModal>
				);
				
				localStorage.setItem("v2", "1");
			}
		});
	}, []);

	return (
		<div className={joinClassNames("App", isMobile ? "Mobile" : "Desktop")}>
			<div className="AppBackground"/>
			
			<div className="Main">
				<PageElement/>
			</div>

			<footer className="Footer">
				<div><a href="https://feathericons.com/">Icons License</a></div>
				<div className="Divider"/>
				<div><a href="https://metalloriff.github.io/city-fog">Default Theme</a></div>
				<div className="Divider"/>
				<div><a href="https://metalloriff.github.io/sucralose-legacy">Sucralose Legacy</a></div>
				<div className="Divider"/>
				<div>Copyright © 2021-{new Date().getFullYear()} Metalloriff</div>
				<div className="Divider"/>
				<div><a href="https://paypal.me/israelboone">♥ Donate ♥</a></div>
			</footer>

			<Modals/>
			<Toasts/>
			<ContextMenu.Handler/>
			
			<SettingsRenderer/>
		</div>
	);
}