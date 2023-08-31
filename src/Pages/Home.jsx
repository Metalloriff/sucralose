import * as Feather from "react-feather";
import { Trello } from "react-feather";
import logo from "../Assets/logo.png";
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
}, {
	date: "01/01/2023",
	title: "Minor QoL Changes and Fixes",
	modal: function NewsPost01012023() {
		return (
			<TutorialModal title={this.title}>
				<h2>What's different?</h2>

				<p>
					This was a set of small changes, there's nothing major in this update. In general, I made small changes to the design of the website.
					I will continue to push this design style in later updates.
				</p>

				<p>
					You can now navigate through posts with A and D along with the arrow keys. This makes for easier left-handed controls.
				</p>

				<p>
					Fixed a few small bugs mostly related to the post page.
				</p>
			</TutorialModal>
		);
	}
}, {
	date: "08/25/2023",
	title: "Important! Please Read",
	modal: function NewsPost08252023() {
		return (
			<TutorialModal title={this.title}>
				<h2>First and foremost</h2>

				<p>
					This website is not dead, and there is a Trello roadmap available to the public. You can view this underneath the news post you clicked to view this modal.
				</p>

				<p>
					However, I have many projects. I work on them in a priority list of what I'm motivated to do, and what I feel needs doing. If you have any suggestions, notice any missing features in Sucralose, or find any pesky bugs, please reach out to my Telegram or Discord (Metalloriff on both). Knowing that someone is waiting for features heavily motivates me to work on whichever project you're waiting for. This does go for my other projects as well.
				</p>

				<p>
					That being said, if you are a new user of Sucralose, you notice notice features missing from e621 and are considering leaving. Please reach out to me and I will have it fixed as soon as possible. This is still a work in progress, and a large solo project.
				</p>

				<h2>Blacklists</h2>

				<p>
					Blacklist functionality is finally here, along with quick blacklist switching, right below the search bar! The UI is not entirely complete, it's a little ugly and clunky, but should be fully function.
				</p>

				<h2>What's different?</h2>

				<p>
					A lot of modal improvements, including a HUGE performance improvement -- the previous and next images used to show full resolution. This is stupid. That includes videos. Now, they show their proper preview image. The image modal has some new controls. Up and down will upvote and downvote, respectively. And F will favorite. Also, there's now a spinner for when the image is loading. This will prevent you from accidentally saving a preview too quickly, without realizing it's a preview. And videos autoplay. A lot of modal improvements, as that's where you spend most of your time.
				</p>

				<p>
					Favoriting a post now upvotes it as well. The upvote feature in e621 is underused. If you favorite a post, 9/10 times you'd want to upvote as well. If not, an extra click 1/10 times is better than 9/10!
				</p>

				<p>
					Reverse searching is here! Currently it works flawlessly for any files that have an md5 hash in the name. But it is not perfect for improperly named files.
				</p>

				<p>
					Pools now show name and description on the search page, instead of.. in a context menu. This is currently a work in progress, so there is no formatting. You'll see a lot of [[this]], and unclickable links. I apologize for that, but I at least made the text selectable so you can search.
				</p>

				<h2>Patched bugs</h2>

				<p>
					Personalization settings (background, colors, etc.) weren't saving properly. This should be fully fixed now.
				</p>

				<p>
					Not being able to open pools in new tab.
				</p>

				<p>
					Clicking on comment profile avatars wouldn't open the avatar post.
				</p>

				<h2>What's next?</h2>

				<p>
					Soon, I will be adding a saved searches feature. This will be similar to the quick blacklists feature, but for searching!
				</p>

				<p>
					You can see more of what's planned in the future on the roadmap.
				</p>
			</TutorialModal>
		);
	}
}, {
	date: "08/31/2023",
	title: "Bug Fixes & Features",
	modal: function NewsPost08312023() {
		return (
			<TutorialModal title={this.title}>
				<h2>This is a WIP website!</h2>

				<p>
					I have many projects, and work on them in a priority list of what I'm motivated to do, and what I feel needs doing. If you have any suggestions, notice any missing features in Sucralose, or find any pesky bugs, please reach out to my Telegram or Discord (Metalloriff on both). Knowing that someone is waiting for features heavily motivates me to work on whichever project you're waiting for. This does go for my other projects as well.
				</p>

				<p>
					That being said, if you are a new user of Sucralose, you notice notice features missing from e621 and are considering leaving. Please reach out to me and I will have it fixed as soon as possible. This is still a work in progress, and a large solo project.
				</p>

				<h2>What's new?</h2>

				<p>
					The logo is now on the homepage!
				</p>

				<p>
					Popular page -- The popular page now has a slightly better UI, much less bugs (and it actually works), and you can now choose the time range. The popular page also adds the date and range into the URI, so you can copy a specific date/date range for bookmarking or sharing.
				</p>

				<p>
					Post modal -- There's now artist tags underneath the controls on the post modal. Open a post and see an art style you really like? Now you can be lazy and don't have to close the modal to view their other works.
				</p>

				<h2>Patched bugs</h2>

				<p>
					Fixed a fatal bug related to new users. If you were a new user and couldn't save any settings, this should be fixed now.
				</p>

				<p>
					Blacklists now take aliases into account. This means that before, if you blacklisted "futa", it would still show because the tag is technically "intersex".<br />
					Now, when you save your blacklist, it will automatically forward all tags from their aliases to the real tag.
				</p>

				<p>
					No more random jumps to page 2 when opening tags! This was driving me mad.
				</p>

				<p>
					Fixed the popular page.
				</p>

				<p>(Potentially) fixed a bug causing scrolling to randomly say you've reached the end, when you have not. This requires longer testing, as it wasn't easily reproducable.</p>

				<h2>What's next?</h2>

				<p>
					You can see more of what's planned in the future on the roadmap.
				</p>
			</TutorialModal>
		);
	}
}];

const basePatchNote = {
	date: "08/31/2023",
	title: "Bug Fixes & Features",
	modal: function NewsPost08312023() {
		return (
			<TutorialModal title={this.title}>
				<h2>This is a WIP website!</h2>

				<p>
					I have many projects, and work on them in a priority list of what I'm motivated to do, and what I feel needs doing. If you have any suggestions, notice any missing features in Sucralose, or find any pesky bugs, please reach out to my Telegram or Discord (Metalloriff on both). Knowing that someone is waiting for features heavily motivates me to work on whichever project you're waiting for. This does go for my other projects as well.
				</p>

				<p>
					That being said, if you are a new user of Sucralose, you notice notice features missing from e621 and are considering leaving. Please reach out to me and I will have it fixed as soon as possible. This is still a work in progress, and a large solo project.
				</p>

				<h2>What's new?</h2>

				<h2>Patched bugs</h2>

				<h2>What's next?</h2>

				<p>
					You can see more of what's planned in the future on the roadmap.
				</p>
			</TutorialModal>
		);
	}
};

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
				<div className="Logo">
					<img src={logo} alt="Logo" />
				</div>
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

			<div className="News" onClick={() => Modals.push(news.modal())}>
				<h3 className="Title">{news.title}</h3>

				<div className="Flex">
					<div className="Date">{news.date}</div>

					<div className="Poster">by <b>Metalloriff</b></div>
				</div>
			</div>

			<a className="Trello FlexCenter" href="https://trello.com/b/27bqbHA1/roadmap">
				<Trello />
				Roadmap
			</a>
		</div>
	);
}