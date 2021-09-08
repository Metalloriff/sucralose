import React from "react";
import "./PostComments.scss";
import { useInterval } from "../../Classes/Hooks";
import API from "../../Classes/API";
import InlineLoading from "../InlineLoading";
import { ReactComponent as Kermit } from "../../Icons/Kermit.svg";
import LinkWrapper from "../LinkWrapper";
import { joinClassNames } from "../../Classes/Constants";

/* TODO

    Add voting on comments.
    Add timestamps.
    Add the ability to post comments.
    Handle deleted comments.

 */

export default function PostComments({ id }) {
    const [comments, setComments] = React.useState(null);
    
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
            { comments === null ? (
                <InlineLoading/>
            ) : (
                comments.length === 0 ? (
                    <div className="NoComments">
                        <h1>No comment.</h1>
                        
                        <Kermit className="Kermit"/>
                    </div>
                ) : (
                    <div className="Comments">
                        {comments.map(comment => (
                            <div className="Comment" key={comment.id}>
                                <div className="UserSection">
                                    <div className="AvatarContainer">
                                        <LinkWrapper href={`#post/${comment.avatarPost?.id}`}>
                                            <img
                                                className={joinClassNames("Avatar", [comment.avatarPost?.rating === "e", "NSFW"])}
                                                src={comment.avatarPost?.cropped_url}
                                                onError={({ target }) => target.src = comment.avatarPost?.preview_url}
                                                alt="User Avatar"
                                            />
                                        </LinkWrapper>
                                    </div>
                                </div>
                                
                                <div className="BodySection">
                                    <LinkWrapper href={`#user/${comment.userId}`}>
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
            ) }
        </div>
    )
}