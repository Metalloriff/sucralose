import React from "react";
import "./PostsPage.scss";
import Posts from "../Components/Posts/Posts";
import Header from "../Components/General/Header";
import App from "../App";

export default function PostsPage({ search, searchPlaceholder, emptyPlaceholder = null }) {
    return (
        <div className="PostsPage">
            <Header searchPlaceholder={searchPlaceholder}/>
            
            { App.userReady && <Posts search={search} emptyPlaceholder={emptyPlaceholder}/> }
        </div>
    )
}