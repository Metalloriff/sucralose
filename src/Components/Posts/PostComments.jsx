import React from "react";
import * as Feather from "react-feather";
import API from "../../Classes/API";
import { joinClassNames } from "../../Classes/Constants";
import { useInterval } from "../../Classes/Hooks";
import UserStore from "../../Classes/Stores/UserStore";
import InlineLoading from "../InlineLoading";
import LinkWrapper from "../LinkWrapper";
import "./PostComments.scss";

export default function PostComments({ id }) {
	const [comments, setComments] = React.useState(null);

	const localUser = UserStore.useState(() => UserStore.getLocalUser());

	useInterval(() => {
		API.request(`posts/${id}/comments`).then(data => {
			const doc = new DOMParser().parseFromString(data.html, "text/html");

			setComments(
				[...doc.getElementsByClassName("comment")].map(comment => ({
					id: comment.dataset.commentId,
					userId: comment.dataset.creatorId,
					username: comment.dataset.creator,
					score: parseInt(comment.dataset.score),
					isDeleted: comment.dataset.isDeleted === "true",
					body: comment.querySelector(".content > .body")?.innerHTML,
					avatarPost: data.posts[comment.querySelector(
						".avatar > .placeholder"
					)?.dataset.id],
					timestamp: comment.querySelector("time")?.dateTime
				}))
			);
		});
	}, 10000, true);

	return (
		<div className="PostComments">
			{comments === null ? (
				<InlineLoading />
			) : (
				comments.length === 0 ? (
					<div className="NoComments">
						<h1>No comments here.</h1>
					</div>
				) : (
					<div className="Comments">
						{comments.map(comment => (
							<div className="Comment" key={comment.id}>
								<div className="UserSection">
									<div className="AvatarContainer">
										<div className="AvatarPlaceholder FlexCenter">
											<Feather.User />
										</div>

										{comment.avatarPost ? (
											<LinkWrapper href={`/post/${comment.avatarPost?.id ?? "not_found"}`}>
												<img
													className={joinClassNames("Avatar", [comment.avatarPost?.rating === "e", "NSFW"])}
													src={comment.avatarPost?.cropped_url}
													onError={({ target }) => target.src = comment.avatarPost?.preview_url}
													alt=""
												/>
											</LinkWrapper>
										) : null}
									</div>
								</div>

								<div className="BodySection">
									<LinkWrapper href={`/user/${comment.userId}`}>
										<div className="Username">
											{comment.username}
										</div>
									</LinkWrapper>

									<div
										className="Body"
										dangerouslySetInnerHTML={{ __html: comment.body }}
									/>
								</div>
							</div>
						))}
					</div>
				)
			)}

			{localUser?.e621User && (
				<div className="CommentCreatorSection Comments">
					<div className="Comment">
						<div className="UserSection">
							<div className="AvatarContainer">
								<div className="AvatarPlaceholder FlexCenter">
									<Feather.User />
								</div>

								{localUser.e621User.avatarPost ? (
									<LinkWrapper href={`#post/${localUser.e621User.avatarPost?.id ?? "not_found"}`}>
										<img
											className={joinClassNames("Avatar", [localUser.e621User.avatarPost?.rating === "e", "NSFW"])}
											src={localUser.e621User.avatarPost?.cropped_url}
											onError={({ target }) => target.src = localUser.e621User.avatarPost?.preview_url}
											alt=""
										/>
									</LinkWrapper>
								) : null}
							</div>
						</div>

						<div className="BodySection Flex">
							<textarea className="Body" placeholder="This doesn't do anything yet. I got lazy." />
						</div>
					</div>
				</div>
			)}
		</div>
	)
}