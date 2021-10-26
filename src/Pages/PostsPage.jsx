import React from "react";
import UserStore from "../Classes/Stores/UserStore";
import Header from "../Components/General/Header";
import Posts from "../Components/Posts/Posts";
import "./PostsPage.scss";

export default function PostsPage({
	search: prependedTags = "",
	searchPlaceholder,
	emptyPlaceholder = null
}) {
	return (
		<div className="PostsPage">
			<Header searchPlaceholder={searchPlaceholder} />

			{UserStore.getLocalUser() && (
				<Posts
					key={prependedTags}
					prependedTags={prependedTags}
					emptyPlaceholder={emptyPlaceholder}
				/>
			)}
		</div>
	)
}