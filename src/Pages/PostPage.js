import React from "react";
import "./PostPage.scss";
import Header from "../Components/General/Header";
import API from "../Classes/API";
import * as Feather from "react-feather";
import TabsList from "../Components/TabsList";
import PostComments from "../Components/Posts/PostComments";
import TagItem from "../Components/Posts/TagItem";
import _ from "lodash";
import { formatBytes } from "../Classes/Constants";

export default function PostPage({ id }) {
    const [post, setPostData] = React.useState(null);
    const [failed, setFailedState] = React.useState(false);
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    
    React.useEffect(() => {
        API.request(`posts/${id}`)
            .then(post => post?.post ? setPostData(post.post) : setFailedState(true))
            .catch(err => (console.error(err), setFailedState(true)));
    }, []);
    
    const events = {
        toggleFavorite: () => {
            if (post.is_favorited)
                // Remove the post from the favorites list.
                API.removeFavorite(id).then(() => (post.is_favorited = false, forceUpdate()));
            else
                // Add the post to the favorites list.
                API.favorite(id).then(() => (post.is_favorited = true, forceUpdate()));
        },
        vote: score =>
            // Vote on the post.
            API.vote(id, score).then(data => (_.extend(post.score, data), forceUpdate()))
    };
    
    return (
        <div className="PostPage">
            <Header/>
            
            { post ? (
                <div className="PostBody">
                    <div className="ImageContainer">
                        <img className="Image"
                             src={post.file.url}
                             {...{}/* If you can write lazier code than this, I will do nothing because I'm too lazy. */}
                             {...{}/* TODO not this */}
                             onError={({ target }) =>
                                 target.outerHTML = target.outerHTML.replace("img", "video")}
                             loop controls
                             alt="Post Image"/>
                    </div>
                    
                    <div className="PostBodyMain">
                        <div
                            className="Button"
                            style={{ color: post.score.our_score === 1 ? "var(--primary-color)" : null }}
                            onClick={events.vote.bind(null, 1)}
                        >
                            <Feather.ThumbsUp/>
                            <div>{post.score.up}</div>
                        </div>
                        
                        <div
                            className="Button"
                            style={{ color: post.score.our_score === -1 ? "var(--primary-color)" : null }}
                            onClick={events.vote.bind(null, -1)}
                        >
                            <Feather.ThumbsDown/>
                            <div>{-post.score.down}</div>
                        </div>

                        <div
                            className="Button"
                            style={{ color: post.is_favorited ? "var(--red)" : null }}
                            onClick={events.toggleFavorite}
                        >
                            <Feather.Heart/>
                            <div>{post.fav_count}</div>
                        </div>
                    </div>
                    
                    { post.description && (
                        <div className="PostDescriptionContainer Flex">
                            <div className="PostDescription">
                                {post.description}
                            </div>
                        </div>
                    ) }
                    
                    <TabsList tabs={["Comments", "Tags", "Details"]}>
                        <PostComments id={id}/>
                        
                        <div className="TagsList">
                            {Object.keys(post.tags).filter(tc => post.tags[tc].length).reverse().map(category => (
                                <div className="TagCategory" key={category}>
                                    <h2>{category} - {post.tags[category].length}</h2>
                                    
                                    <div className="Tags">
                                        {post.tags[category].map((tag, index) => (
                                            <TagItem key={index}>
                                                {tag}
                                            </TagItem>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="PostDetails Flex">
                            <div>
                                <div className="Entry">
                                    <h2>Post ID</h2>
                                    <div>#{id}</div>
                                </div>

                                <div className="Entry">
                                    <h2>Post MD5 Hash</h2>
                                    <div>{post.file.md5}</div>
                                </div>

                                <div className="Entry">
                                    <h2>Creation Date</h2>
                                    <div>{post.created_at}</div>
                                </div>

                                <div className="Entry">
                                    <h2>Size</h2>
                                    <div>{formatBytes(post.file.size)}</div>
                                </div>

                                <div className="Entry">
                                    <h2>Width</h2>
                                    <div>{post.file.width} pixels</div>
                                </div>

                                <div className="Entry">
                                    <h2>Height</h2>
                                    <div>{post.file.height} pixels</div>
                                </div>

                                <div className="Entry">
                                    <h2>Sources</h2>
                                    <div>{
                                        post.sources.map((src, i) => (
                                            <div key={i} style={{ marginTop: 10 }}>
                                                <a href={src}>
                                                    {src}
                                                </a>
                                            </div>
                                        ))
                                    }</div>
                                </div>
                            </div>
                        </div>
                    </TabsList>
                </div>
            ) : (
                failed ? (
                    <div/>
                ) : (
                    <div/>
                )
            ) }
        </div>
    )
}