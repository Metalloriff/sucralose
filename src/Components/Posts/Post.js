import React from "react";
import "./Post.scss";
import * as Feather from "react-feather";
import Tooltip from "../Tooltip";
import { download, joinClassNames } from "../../Classes/Constants";
import Posts from "./Posts";
import { copyToClipboard, openImageModal } from "../Modals";
import API from "../../Classes/API";
import _ from "lodash";
import TagItem from "./TagItem";
import InlineLoading from "../InlineLoading";
import ContextMenu from "../ContextMenuHandler";
import Toasts from "../Toasts";
import App from "../../App";
import { Settings, SettingsRenderer } from "../../Pages/SettingsPage";
import LinkWrapper from "../LinkWrapper";

/**
 * The generic post component.
 * @param post {e621Post}
 * @constructor
 */
export default function Post({ post }) {
    // De-structure the post object.
    const {
        id,
        description,
        sample,
        file,
        preview,
        fav_count,
        is_favorited,
        score,
        flags,
        created_at,
        rating,
        tags
    } = post;
    
    // Get the preview image URL without fail.
    const previewImage = sample?.url ?? preview?.url ?? file?.url;
    
    // Create some states.
    const [tooltipText, setTooltipText] = React.useState("");
    const [tooltipSide, setTooltipSide] = React.useState("left");
    const [busyButtons, setBusyButtons] = React.useState([]);
    const [previewLoaded, setPreviewLoaded] = React.useState(false);
    
    // Create a force updater.
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    // Create the button component.
    const Button = React.useMemo(() =>
        ({ text, children, onClick, tooltipText, tooltipSide, className }) => {
            const events = {
                onClick,
                onMouseEnter: () => (
                    setTooltipText(tooltipText),
                    setTooltipSide(tooltipSide ?? "left")
                ),
                onMouseLeave: () => setTooltipText("")
            };
            
            return (
                <div className={joinClassNames("Button", className)} {...events}>
                    { ~busyButtons.indexOf(tooltipText)
                        ? <Feather.Loader className="Spinner"/>
                        : children }
                    
                    <span>{text}</span>
                </div>
            );
        }, [busyButtons]);
    
    // Create the events object.
    let downloading = false;
    const events = {
        toggleFavorite: () => {
            // Mark the button as busy.
            setBusyButtons([ ...busyButtons, "Favorite" ]);
            
            // Create a clear event to unmark the button.
            const clear = () => setBusyButtons(
                busyButtons.filter(b => b !== "Favorite")
            ); 
            
            if (is_favorited)
                // Remove the post from the favorites list.
                API.removeFavorite(id).then(() => (post.is_favorited = false, clear()));
            else
                // Add the post to the favorites list.
                API.favorite(id).then(() => (post.is_favorited = true, clear()));
        },
        vote: score => {
            // Mark the button as busy.
            setBusyButtons([ ...busyButtons, "Upvote", "Downvote" ]);
            
            // Create a clear event to unmark the button.
            const clear = () => setBusyButtons(
                busyButtons.filter(b => !~["Upvote", "Downvote"].indexOf(b))
            );
            
            // Vote on the post.
            API.vote(id, score).then(data => (_.extend(post.score, data), clear()));
        },
        download: () => {
            // Make sure the user isn't impatient.
            if (downloading) return;
            downloading = true;
            
            // Mark the button as busy.
            setBusyButtons([ ...busyButtons, "Download" ]);
            
            // Create a clear event to unmark the button.
            const clear = () => (setBusyButtons(
                busyButtons.filter(b => b !== "Download")
            ), downloading = false);
            
            // Download the post.
            download(file.url).then(clear);
        },
        openInNewTab: () => window.open(`#post/${id}`, "_blank")
    };
    
    const conditionalDnp = tags.artist.indexOf("conditional_dnp");
    !!~conditionalDnp && tags.artist.splice(conditionalDnp, 1);

    // Render me harder, daddy.
    return previewImage && file.ext !== "swf" ? (
        <div className="Post">
            <div className="PostHeader">
                Artist{tags.artist.length > 1 ? "s" : null}
                <div className="Divider"/>
                { tags.artist.length
                    ? tags.artist.map((artist, i) => (
                        <TagItem key={i}>
                            {artist}
                        </TagItem>
                    ))
                    : (
                        <span style={{ opacity: 0.65 }}>
                            unknown
                        </span>
                    ) }
            </div>
            
            { !previewLoaded && (
                <div className="Preview Flex Loading">
                    <InlineLoading/>
                </div>
            ) }
            
            <ContextMenu.Wrapper menu={<PostContextMenu post={post}/>}>
                <img src={previewImage} className="Preview" alt="Preview"
                     onLoad={() => setPreviewLoaded(true)}
                     onClick={() =>
                         openImageModal(file.url, () =>
                             Posts.instance.posts.map(post => ({
                                 preview: post.sample?.url ?? post.preview?.url ?? post.file?.url,
                                 full: post.file.url
                             })), {
                             buttons: index => <PostModalButtons post={Posts.instance.posts[index]}/>
                         })}/>
            </ContextMenu.Wrapper>
            
            { file.ext === "webm" && (
                <div className="VideoOverlay">
                    <Feather.Play/>
                </div>
            ) }
            
            <div className="PostFooter" data-url={previewImage}>
                { tooltipText && <div className={joinClassNames(
                    "FooterTooltip", [tooltipSide === "right", "RightSide"]
                )}>{tooltipText}</div> }
                
                <div className="VotesContainer">
                    <div className="Flex">
                        <Button text={score.up} tooltipText="Upvote"
                                className={score.our_score === 1 ? "Active" : ""}
                                onClick={events.vote.bind(null, 1)}>
                            <Feather.ThumbsUp/>
                        </Button>
                        
                        <Button text={-score.down} tooltipText="Downvote"
                                className={score.our_score === -1 ? "Active" : ""}
                                onClick={events.vote.bind(null, -1)}>
                            <Feather.ThumbsDown/>
                        </Button>
                    </div>
                    
                    <div className="VotesTally">
                        <div className="UpVotes" style={{
                            width: ((score.up / (score.up + -score.down)) * 100) + "%"
                        }}/>
                    </div>
                </div>

                <Button text={fav_count} tooltipText="Favorite"
                        className={is_favorited ? "Favorited" : ""}
                        onClick={events.toggleFavorite}>
                    <Feather.Heart/>
                </Button>
                
                <div style={{ marginLeft: "auto" }} className="Flex">
                    <Button tooltipText="Download" tooltipSide="right"
                            onClick={events.download}>
                        <Feather.Download/>
                    </Button>
                    
                    <LinkWrapper href={`#post/${id}`}>
                        <Button tooltipText="View Post" tooltipSide="right">
                            <Feather.ExternalLink/>
                        </Button>
                    </LinkWrapper>
                </div>
            </div>
        </div>
    ) : null;
}

export function PostContextMenu({ post }) {
    const sets = App.userData?.sets ?? [];
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    const events = {
        toggleSet: async index => {
            const set = App.userData?.sets[index];
            const postIndex = set.post_ids.indexOf(post.id);
            
            if (postIndex !== -1) {
                await API.request(
                    `post_sets/${set.id}/remove_posts`,
                    { "post_ids[]": post.id },
                    true,
                    { method: "POST" }
                );

                set.post_ids.splice(postIndex, 1);
            }
            else {
                await API.request(
                    `post_sets/${set.id}/add_posts`,
                    { "post_ids[]": post.id },
                    true,
                    { method: "POST" }
                );
                
                set.post_ids.push(post.id);
            }
        }
    }
    
    return (
        <ContextMenu>
            <ContextMenu.Item
                icon={<Feather.Clipboard/>}
                onClick={() => copyToClipboard(post.id)}
                autoClose
            >Copy Post ID</ContextMenu.Item>
            
            <ContextMenu.Item
                icon={<Feather.Image/>}
                onClick={() => (Settings.props.backgroundImage.url.value = post.file.url, Settings.save(), SettingsRenderer.forceUpdate())}
                autoClose
            >Set As Background</ContextMenu.Item>
            
            <ContextMenu.Divider/>
            
            <ContextMenu.SubMenuItem
                label="Sets"
                icon={<Feather.Layers/>}
            >
                { !!sets.length && (
                    <React.Fragment>
                        { sets.map((set, index) => (
                            <ContextMenu.Item
                                className={joinClassNames("ContextMenuItem", "SetCmItem",
                                    [!!~set.post_ids.indexOf(post.id), "Active"])}
                                key={set.id}
                                icon={<Feather.Plus/>}
                                onClick={async () => (await events.toggleSet(index), forceUpdate())}
                            >{set.name}</ContextMenu.Item>
                        )) }

                        <ContextMenu.Divider/>     
                    </React.Fragment>
                ) }
                
                <ContextMenu.Item
                    icon={<Feather.PlusSquare/>}
                    onClick={() => Toasts.showToast(
                        "Not yet added - please do this in e621 for now", 
                        "Failure"
                    )}
                >New Set</ContextMenu.Item>
            </ContextMenu.SubMenuItem>
        </ContextMenu>
    );
}

/**
 * Please, do not look at this component.
 * I was lazy.
 * Leave me alone.
 * No stop.
 * Please don't scroll down.
 * @param post
 * @returns {JSX.Element}
 * @constructor
 */
export function PostModalButtons({ post }) {
    const {
        id,
        is_favorited,
        score,
        fav_count,
        file
    } = post;
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    const events = {
        favorite: () => {
            if (is_favorited)
                // Remove the post from the favorites list.
                API.removeFavorite(id).then(() => (post.is_favorited = false, forceUpdate()));
            else
                // Add the post to the favorites list.
                API.favorite(id).then(() => (post.is_favorited = true, forceUpdate()));
        },
        vote: score =>
            API.vote(id, score).then(data => (_.extend(post.score, data), forceUpdate())),
        download: () => download(file.url)
    }
    
    return (
        <React.Fragment>
            <div className="Button Flex" style={{
                alignItems: "center", justifyContent: "center",
                color: score.our_score === 1 ? "var(--primary-color)" : null
            }} onClick={events.vote.bind(null, 1)}>
                <Feather.ThumbsUp/>
                <div style={{ marginLeft: 5 }}>{score.up}</div>
                
                <Tooltip style={{ color: "var(--txt-color)" }}>Upvote</Tooltip>
            </div>

            <div className="Button Flex" style={{
                alignItems: "center", justifyContent: "center",
                color: score.our_score === -1 ? "var(--primary-color)" : null
            }} onClick={events.vote.bind(null, -1)}>
                <Feather.ThumbsDown/>
                <div style={{ marginLeft: 5 }}>{-score.down}</div>

                <Tooltip style={{ color: "var(--txt-color)" }}>Downvote</Tooltip>
            </div>

            <div className="Button Flex" style={{
                alignItems: "center", justifyContent: "center",
                color: is_favorited ? "var(--red)" : null
            }} onClick={events.favorite}>
                <Feather.Heart/>
                <div style={{ marginLeft: 5 }}>{fav_count}</div>

                <Tooltip style={{ color: "var(--txt-color)" }}>Favorite</Tooltip>
            </div>

            <div className="Button Flex" style={{
                alignItems: "center", justifyContent: "center"
            }} onClick={events.download}>
                <Feather.Download/>
                <Tooltip style={{ color: "var(--txt-color)" }}>Download</Tooltip>
            </div>
        </React.Fragment>
    );
}