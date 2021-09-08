import React from "react";
import "./Posts.scss";
import API from "../../Classes/API";
import { joinClassNames } from "../../Classes/Constants";
import InlineLoading from "../InlineLoading";
import Post from "./Post";
import { useEventListener } from "../../Classes/Hooks";
import QueryManager from "../../Classes/QueryManager";
import * as Feather from "react-feather";
import App from "../../App";

let lastPageChange = Date.now();
export default function Posts({ search: additionalTags, emptyPlaceholder = null, request = null }) {
    const [posts, setPosts] = React.useState([]);
    const [isFetching, setFetchingState] = React.useState(true);
    const [search, setSearchQuery] = React.useState("");
    const [hash, setHash] = React.useState(window.location.hash);
    const [cachedRequest, setCachedRequest] = React.useState(request);
    
    Posts.instance = {
        posts, setPosts,
        isFetching, setFetchingState
    };
    
    React.useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const page = parseInt(query.get("page") || 1);
        const tags = [
            document.getElementById("searchField")?.value,
            additionalTags,
            ...(App.userData?.blacklist ?? []).map(tag => `-${tag}`)
        ].join(" ");
        
        if (cachedRequest !== request) {
            setFetchingState(true);
            setCachedRequest(request);
        }
        
        isFetching && setImmediate(() => {
            API.request(
                ...(request ?? [
                    "posts",
                    { tags, page }
                ])
            ).then(data => {
                // This entire function should be abolished.
                
                setFetchingState(false);
                
                if (page > 1 && !data.posts.length) {
                    QueryManager.set("page", page - 1, {
                        pushHistory: false
                    });
                }
                
                const _posts =
                    tags === search &&  window.location.hash === hash && !request
                        ? [...posts, ...data.posts]
                        : data.posts;
                
                setPosts(
                    _posts.filter(
                        (post, index) =>
                            _posts.findIndex(p => p && p.id === post.id) === index
                    )
                );
                
                setSearchQuery(tags);
                setHash(window.location.hash);
            });
        });
    }, [isFetching, request]);
    
    // Handle infinite scrolling.
    useEventListener("scroll", () => {
        if (Date.now() - lastPageChange < 2000 || isFetching || !posts?.length) return;
        
        const target = document.documentElement;
        
        if (target.scrollTop >= target.scrollHeight - window.innerHeight - 100) {
            QueryManager.set("page", parseInt(QueryManager.get("page", 1)) + 1, {
                pushHistory: false
            });
            
            lastPageChange = Date.now();
        }
    }, { dependencies: [isFetching, posts, request] });
    
    return (
        <div className="Posts">
            <h2 className="PageLabel">{App.hash}</h2>
            
            { !isFetching && !posts?.length && (
                <div className="NoPosts">
                    <div className="Placeholder">{emptyPlaceholder ?? (
                        <>
                            <h2>No posts found.</h2>
                            
                            <div>
                                Check your search tags, and ensure you've made no typos.
                            </div>
                        </>
                    )}</div>
                    
                    <Feather.Frown/>
                </div>
            ) }
            
            <div className="Items">
                { posts?.map(post => <Post post={post} key={post.id}/>) }
            </div>
            
            <div className={joinClassNames("FetchingStateModal", [isFetching, "Active"])}>
                <InlineLoading/>
            </div>
        </div>
    );
}