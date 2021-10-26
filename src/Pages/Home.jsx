import React from "react";
import * as Feather from "react-feather";
import { joinClassNames } from "../Classes/Constants";
import RoutesStore from "../Classes/Stores/RoutesStore";
import UserStore from "../Classes/Stores/UserStore";
import SearchField from "../Components/General/SearchField";
import LinkWrapper from "../Components/LinkWrapper";
import { Modals } from "../Components/Modals";
import TutorialModal from "../Components/Modals/TutorialModal";
import SwitchItem from "../Components/SwitchItem";
import Tooltip from "../Components/Tooltip";
import "./Home.scss";

export const NavigationButtons = {
	posts: { icon: <Feather.Grid />, title: "Latest Posts" },
	hot: { icon: <Feather.TrendingUp />, title: "Hot Posts" },
	popular: { icon: <Feather.BarChart2 />, title: "Popular Posts" },
	sets: { icon: <Feather.Layers />, title: "Browse Sets" },

	subscriptions: { icon: <Feather.Bell />, title: "Subscriptions" },
	favorites: { icon: <Feather.Heart />, title: "Favorites" },
	upvoted: { icon: <Feather.ThumbsUp />, title: "Upvoted Posts" },
	settings: { icon: <Feather.Settings />, title: "Settings" },
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

						<br />

						<li>
							<div><b>Mobile support</b></div>
							Mobile support was pretty bad in the previous release, but
							this version was started with mobile in mind.
						</li>

						<br />

						<li>
							<div><b>Better UI/UX</b></div>
							This is of course an opinional thing, but the user interface and user
							experience has been redesigned for a friendlier experience.
						</li>

						<br />

						<li>
							<div><b>Popular page</b></div>
							This is an overlooked feature in e621, mostly because its UI is
							so outdated; but it has been incorporated into Sucralose with a
							little better interface.
						</li>

						<br />

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
}, {
	date: "10/24/2021",
	title: "Domain name and performance overhauls",
	modal: function NewsPost102421() {
		return (
			<TutorialModal title={this.title}>
				<h2>What's different?</h2>

				<p>
					The domain name has been changed to <b>sucralose.top</b>.
					The site has been optimized for performance, and should load faster.<br /><br />
					However, this overhaul does not come without downfall, and may cause some bugs.
				</p>

				<h2>Data Exports</h2>

				<p>
					You can now export your data in the settings, for those of you who are interested in what is stored on the database.<br />
					Obviously passwords are not exported, as even I do not have the ability to view or export them.
				</p>

				<h2>Ads</h2>

				<p>
					Ads will be added to the site in the near future, <b>but</b>, you will be able to disable them in the settings.<br />
					This is for those of you who are interested in supporting me, but do not have the funds to do so.<br />
					Meanwhile, if you do have the funds, you can support me by donating to my Patreon page, which I will be creating soon. :)<br /><br />
					If you would be interested, please contact me on my Discord or <a href="https://twitter.com/@Metalloriff">Twitter</a> <i>(Psst.. give me a follow, I'm beginning to actively use my Twitter.)</i>, and let me know that I'm not wasting my time.
				</p>
			</TutorialModal>
		);
	}
}];

export function NavigationButtonsComponent({ className, tooltipMode = false }) {
	const localUser = UserStore.useState(() => UserStore.getLocalUser());

	return (
		<div className={className || "ButtonsContainer"}>
			<div className="Left">
				{RoutesStore.getCurrentRoute().length > 1 && (
					<LinkWrapper href="/">
						<div className="Button">
							<Feather.Home />

							<Tooltip direction="down">Home</Tooltip>
						</div>
					</LinkWrapper>
				)}

				{["posts", "hot", "popular", "sets"].map(path => (
					<LinkWrapper key={path} href={"/" + path}>
						<div className="Button">
							{NavigationButtons[path].icon}

							{tooltipMode ? (
								<Tooltip direction="down">
									{NavigationButtons[path].title}
								</Tooltip>
							) : (
								<div className="Title">
									{NavigationButtons[path].title}
								</div>
							)}
						</div>
					</LinkWrapper>
				))}
			</div>

			<div className="Right">
				{["subscriptions", "favorites", "upvoted", "settings"].map(path => (
					<LinkWrapper key={path} href={localUser?.signedIn ? "/" + path : "#sign_in"}>
						<div className={joinClassNames("Button HasTooltip", [!localUser?.signedIn, "Disabled"])}>
							{NavigationButtons[path].icon}

							{tooltipMode ? (
								<Tooltip direction="down">
									{NavigationButtons[path].title}
								</Tooltip>
							) : (
								<div className="Title">
									{NavigationButtons[path].title}
								</div>
							)}
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

			<SearchField />

			<SwitchItem
				title="SFW Mode"
				defaultValue={(localStorage.getItem("showNsfw") || "false") === "false"}
				callback={value => {
					if (!value && !localStorage.getItem("hasShownNsfwNotice")) {
						Modals.push(
							<TutorialModal title="NSFW Confirmation">
								<h2>NSFW Confirmation</h2>

								<p>
									With SFW mode off, you will be able to see NSFW (18+) content.<br />
									You can disable this at any time on the home page.
								</p>

								<h2>Age Confirmation</h2>

								<p>
									By disabling SFW mode, you agree that you're at least 18 years old.<br />
									If your age is incorrect, this may result in your account being terminated.<br />
									If your age is incorrect, re-enable SFW mode before continuing.
								</p>
							</TutorialModal>
						);

						localStorage.setItem("hasShownNsfwNotice", "true");
					}

					localStorage.setItem("showNsfw", value ? "false" : "true");
				}}
			/>

			<NavigationButtonsComponent />

			{window.navigator.userAgent.indexOf("Firefox") !== -1 && (
				<div className="UseAModernWebBrowserThatActuallySupportsBackdropFilterAndOtherFeaturesFromMoreThan5YearsAgo">
					<h2>WARNING</h2>

					<div>You're on an unsupported web browser.</div>
					<div>You will likely experience visual and functional errors.</div>
					<div>Please do not report these while on an unsupported browser.</div>

					<br />

					<div>Most modern Chromium-based browsers are supported.</div>

					<br />

					<div style={{ color: "var(--txt-color)" }}>
						<a href="https://www.google.com/chrome/">Chrome</a>,
						<a href="https://www.opera.com/download">Opera</a>,
						<a href="https://www.opera.com/gx">Opera GX</a>,
						<a href="https://brave.com/download/">Brave</a>,
						<a href="https://www.microsoft.com/en-us/edge">Literally Edge</a>
					</div>
				</div>
			)}

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