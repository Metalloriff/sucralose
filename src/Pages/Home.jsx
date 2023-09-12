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
import { NewsModal, newsPosts } from "./NewsPosts";

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

			<div className="News" onClick={() => Modals.push(<NewsModal />)}>
				<h3 className="Title">{news.title}</h3>

				<div className="Flex">
					<div className="Date">{news.date}</div>

					<div className="Poster"><b>Patch Notes</b></div>
				</div>
			</div>

			<a className="Trello FlexCenter" href="https://trello.com/b/27bqbHA1/roadmap">
				<Trello />
				Roadmap
			</a>
		</div>
	);
}