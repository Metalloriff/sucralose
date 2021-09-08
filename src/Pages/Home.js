import React from "react";
import "./Home.scss";
import SearchField from "../Components/General/SearchField";
import * as Feather from "react-feather";
import LinkWrapper from "../Components/LinkWrapper";
import Tooltip from "../Components/Tooltip";
import { joinClassNames } from "../Classes/Constants";
import App from "../App";

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
	return (
		<div className="MainPage">
			<div className="Head">
				<h1>Sucralose!</h1>
				<div>A sweeter way to use <a href="https://e621.net">e621</a>.</div>
			</div>
			
			<SearchField/>
			
			<NavigationButtonsComponent/>
		</div>
	);
}