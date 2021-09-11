import React from "react";
import "./Home.scss";
import SearchField from "../Components/General/SearchField";
import * as Feather from "react-feather";
import LinkWrapper from "../Components/LinkWrapper";
import Tooltip from "../Components/Tooltip";
import { joinClassNames } from "../Classes/Constants";
import App from "../App";
import TutorialModal from "../Components/Modals/TutorialModal";
import { Modals } from "../Components/Modals";

export const NavigationButtons = {
	posts: { icon: <Feather.Grid/>, title: "Latest Posts" },
	hot: { icon: <Feather.TrendingUp/>, title: "Hot Posts" },
	popular: { icon: <Feather.BarChart2/>, title: "Popular Posts" },
	sets: { icon: <Feather.Layers/>, title: "Browse Sets" },
	
	subscriptions: { icon: <Feather.Bell/>, title: "Subscriptions" },
	favorites: { icon: <Feather.Heart/>, title: "Favorites" },
	upvoted: { icon: <Feather.ThumbsUp/>, title: "Upvoted Posts" },
	settings: { icon: <Feather.Settings/>, title: "Settings" },
};

export const newsPosts = [{
	date: "09/09/2021",
	title: "Welcome to the new Sucralose!",
	modal: function NewsPost090921() {
		return (
			<TutorialModal title={this.title}>
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
	}
}];

export function NavigationButtonsComponent({ className, tooltipMode = false }) {
	return (
		<div className={className || "ButtonsContainer"}>
			<div className="Left">
				{ window.location.hash.length > 1 && (
					<LinkWrapper href="#">
						<div className="Button">
							<Feather.Home/>

							<Tooltip direction="down">Home</Tooltip>
						</div>
					</LinkWrapper>
				) }
				
				{["posts", "hot", "popular", "sets"].map(path => (
					<LinkWrapper key={path} href={"#" + path}>
						<div className="Button">
							{NavigationButtons[path].icon}
							
							{ tooltipMode ? (
								<Tooltip direction="down">
									{NavigationButtons[path].title}
								</Tooltip>
							) : (
								<div className="Title">
									{NavigationButtons[path].title}
								</div>
							) }
						</div>
					</LinkWrapper>
				))}
			</div>

			<div className="Right">
				{["subscriptions", "favorites", "upvoted", "settings"].map(path => (
					<LinkWrapper key={path} href={"#" + path}>
						<div className={joinClassNames("Button HasTooltip", [!App.user, "Disabled"])}>
							{NavigationButtons[path].icon}

							{ tooltipMode ? (
								<Tooltip direction="down">
									{NavigationButtons[path].title}
								</Tooltip>
							) : (
								<div className="Title">
									{NavigationButtons[path].title}
								</div>
							) }
						</div>
					</LinkWrapper>
				))}
			</div>
		</div>
	);
}

export default function Home() {
	const news = newsPosts[newsPosts.length - 1];
	
	return (
		<div className="MainPage">
			<div className="Head">
				<h1>Sucralose!</h1>
				<div>A sweeter way to use <a href="https://e621.net">e621</a>.</div>
			</div>
			
			<SearchField/>
			
			<NavigationButtonsComponent/>
			
			{ window.navigator.userAgent.indexOf("Firefox") !== -1 && (
				<div className="UseAModernWebBrowserThatActuallySupportsBackdropFilterAndOtherFeaturesFromMoreThan5YearsAgo">
					<h2>WARNING</h2>
					
					<div>You're on an unsupported web browser.</div>
					<div>You will likely experience visual and functional errors.</div>
					<div>Please do not report these while on an unsupported browser.</div>
					
					<br/>
					
					<div>Most modern Chromium-based browsers are supported.</div>
					
					<br/>
					
					<div style={{ color: "var(--txt-color)" }}>
						<a href="https://www.google.com/chrome/">Chrome</a>,
						<a href="https://www.opera.com/download">Opera</a>,
						<a href="https://www.opera.com/gx">Opera GX</a>,
						<a href="https://brave.com/download/">Brave</a>,
						<a href="https://www.microsoft.com/en-us/edge">Literally Edge</a>
					</div>
				</div>
			) }
			
			<div className="News" onClick={() => Modals.push(news.modal())}>
				<h3 className="Title">{news.title}</h3>
				
				<div className="Flex">
					<div className="Date">{news.date}</div>
					
					<div className="Poster">by <b>Metalloriff</b></div>
				</div>
			</div>
		</div>
	);
}