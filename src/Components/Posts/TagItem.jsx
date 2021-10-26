import React from "react";
import * as Feather from "react-feather";
import Database from "../../Classes/Database";
import UserStore from "../../Classes/Stores/UserStore";
import ContextMenu from "../ContextMenuHandler";
import SearchField from "../General/SearchField";
import LinkWrapper from "../LinkWrapper";
import Toasts from "../Toasts";
import "./TagItem.scss";

export default function TagItem({ children }) {
	return (
		<ContextMenu.Wrapper
			menu={<TagItemContextMenu tag={children} />}
			wrapperClassName="TagItemContextMenuWrapper"
		>
			<LinkWrapper
				className="TagItem"
				href={`/posts?search=${children}`}
			>{children}</LinkWrapper>
		</ContextMenu.Wrapper>
	)
}

export function TagItemContextMenu({ tag }) {
	const events = {
		appendToSearch: () =>
			SearchField.handleSearch(SearchField.value.trim() + " " + tag),
		subscribe: () => {
			const localUser = UserStore.getLocalUser();
			localUser.subscriptions.push(tag);

			Database.update(
				Database.doc("users", localUser.uid),
				localUser.firebaseSerialized
			).then(() => Toasts.showToast(<span>Added <b>{tag}</b> to subscribed tags</span>))
				.catch(err => (console.error(err), Toasts.showToast("An unknown error occurred", "Failure")));
		},
		unsubscribe: () => {

		},
		blacklist: () => {

		},
		tagInfo: () => {
			window.open(`https://e621.net/wiki_pages/${tag}`, "_blank");
		}
	};

	return (
		<ContextMenu>
			<ContextMenu.Item
				autoClose
				icon={<Feather.Plus />}
				onClick={events.appendToSearch}
			>Append To Search Tags</ContextMenu.Item>

			<ContextMenu.Divider />

			{UserStore.getLocalUser()?.signedIn && (
				<React.Fragment>
					{~UserStore.getLocalUser().subscriptions.indexOf(tag.toLowerCase()) ? (
						<ContextMenu.Item
							autoClose
							icon={<Feather.BellOff />}
							onClick={events.unsubscribe}
						>Unsubscribe</ContextMenu.Item>
					) : (
						<ContextMenu.Item
							autoClose
							icon={<Feather.Bell />}
							onClick={events.subscribe}
						>Subscribe</ContextMenu.Item>
					)}

					<ContextMenu.Item
						autoClose
						icon={<Feather.EyeOff />}
						onClick={events.blacklist}
					>Blacklist</ContextMenu.Item>

					<ContextMenu.Divider />
				</React.Fragment>
			)}

			<ContextMenu.Item
				autoClose
				icon={<Feather.HelpCircle />}
				onClick={events.tagInfo}
			>Tag Info</ContextMenu.Item>
		</ContextMenu>
	);
}