import * as Feather from "react-feather";
import Icon from "../../Assets/icon50x50.png";
import UserStore from "../../Classes/Stores/UserStore";
import { copyToClipboard } from "../Modals";
import Tooltip from "../Tooltip";
import "./PageFooter.scss";

export default function PageFooter() {
	const contacts = {
		website: () => window.open("https://kinzoku.one/", "_blank"),
		github: () => window.open("https://github.com/metalloriff", "_blank"),
		email: () => window.open("https://kinzoku.one/contact", "_blank"),
		discord: () => copyToClipboard("@metalloriff")
	};

	const user = UserStore.useState(() => UserStore.getLocalUser());

	return (
		<footer>
			<div className="Flex">
				<div className="LeftSections">
					<div className="HeadSection FlexCenter">
						<img className="Logo" src={Icon} alt="Logo" />

						<div className="BodySection">
							<h2>Metalloriff</h2>

							<div>
								Web designer
							</div>
						</div>
					</div>

					<div className="ContactSection Flex">
						<div className="ContactEntry" onClick={contacts.website}>
							<Feather.Globe />
							<Tooltip>Website</Tooltip>
						</div>

						<div className="ContactEntry" onClick={contacts.github}>
							<Feather.GitHub />
							<Tooltip>GitHub</Tooltip>
						</div>

						<div className="ContactEntry" onClick={contacts.email}>
							<Feather.Mail />
							<Tooltip>Contact</Tooltip>
						</div>

						<div className="ContactEntry" onClick={contacts.discord}>
							<Feather.MessageSquare />
							<Tooltip>Discord</Tooltip>
						</div>
					</div>
				</div>

				<div className="MiddleSection">
					{/*  TODO add some shit here.  */}
				</div>

				<div className="RightSections FlexCenter">
					<div className="LinksSection Flex">
						<div className="Contents Flex">
							<div className="Title">Navigate</div>
							<a href="/">Home</a>
							<a href="/posts">Posts</a>
							<a href="/hot">Hot</a>
							<a href="/popular">Popular</a>
							<a href="https://trello.com/b/27bqbHA1/roadmap">Roadmap</a>
						</div>

						{user && (
							<div className="Contents Flex">
								<div className="Title">User Navigate</div>
								<a href="/subscriptions">Subscriptions</a>
								<a href="/favorites">Favorites</a>
								<a href="/upvoted">Upvoted</a>
								<a href="/settings">Settings</a>
							</div>
						)}

						<div className="Contents Flex">
							<div className="Title">Resources</div>
							<a href="https://metalloriff.github.io/city-fog">Color Palette</a>
							<a href="https://feathericons.com">Icons Used</a>
							<a href="https://github.com/metalloriff/sucralose">Source Code</a>
						</div>

						<div className="Contents Flex">

							<div className="Title">Metalloriff</div>
							<a href="https://kinzoku.one/donate">Support Me</a>
							<a href="https://kinzoku.one">My Projects</a>
							<a href="https://kinzoku.one/contact">Contact</a>
						</div>
					</div>
				</div>
			</div>

			<div className="Copyright FlexCenter">
				Copyright© {new Date().getFullYear()} Metalloriff
			</div>
		</footer>
	);
}