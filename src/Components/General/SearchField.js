import React from "react";
import "./SearchField.scss";
import * as Feather from "react-feather";
import { joinClassNames } from "../../Classes/Constants";
import _ from "lodash";
import API from "../../Classes/API";
import InlineLoading from "../InlineLoading";
import Tooltip from "../Tooltip";
import Posts  from "../Posts/Posts";
import SetsList from "../../Pages/SetsPage";

// Create the tag icon types.
export const TagTypes = {
    0: { icon: <Feather.Hash/>, tooltip: "General" },
    1: { icon: <Feather.Edit2/>, tooltip: "Artist" },
    3: { icon: <Feather.Award/>, tooltip: "Copyright" },
    4: { icon: <Feather.User/>, tooltip: "Character"  },
    5: { icon: <Feather.Activity/>, tooltip: "Species" },
    6: { icon: <Feather.AlertTriangle/>, tooltip: "Invalid" },
    7: { icon: <Feather.AlignCenter/>, tooltip: "Meta" },
    8: { icon: <Feather.BookOpen/>, tooltip: "Lore" }
};

export default function SearchField({
    placeholder = "Search..."
}) {
    const [focused, setFocused] = React.useState(false);
    const [autoCompleteEntries, setAutoCompleteEntries] = React.useState([]);
    const ref = React.useRef();
    
    const defaultValue = new URLSearchParams(window.location.search).get("search");
    SearchField.value = defaultValue;
    
    function search(value = null) {
        // If a value was passed, set the value to that.
        if (value) ref.current.value = value;

        Posts.lastSuccessfulRequest = null;
        
        // Get the query params as an object.
        const params = new URLSearchParams(window.location.search);
        // Set the search value of the query params.
        params.set("search", ref.current.value);
        // Clear the page from the params.
        params.delete("page");
        
        window.history.pushState(
            { },
            null,
            `?${params.toString()}${window.location.hash || "#posts"}`
        );
        
        Posts.instance?.setPosts([]);
        SetsList.instances?.forEach(instance => instance.setSets([ ]));
        window.dispatchEvent(new Event("popstate"));
    }
    
    SearchField.handleSearch = search;
    
    // Create the events object.
    const events = React.useMemo(() => ({
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onKeyDown: e => e.key === "Enter" && search(),
        onInput: _.debounce(async e => {
            // Get the text content of the input.
            const { value } = e.target;
            SearchField.value = value;
            
            // Get the search string.
            const search = value.split(/\s/).slice(-1)[0].replace(/[-~*]/g, "");
            // If the search string is empty, clear the state and return.
            if (!search.trim()) return setAutoCompleteEntries([]);
            
            // Display a loading indicator.
            setAutoCompleteEntries([null]);
            
            // Fetch the auto complete entries from the api.
            const entries = await API.request("tags/autocomplete", {
                "search[name_matches]": search
            });
            
            // Set the auto complete entries.
            setAutoCompleteEntries(entries?.tags ?? entries);
        }, 200)
    }), []);
    
    // Create auto complete entry click handler.
    function handleAutoCompleteEntryClick(tag) {
        // Set the input text to the clicked tag name.
        ref.current.value = [
            // Get the text content of the input, excluding the last word.
            ...ref.current.value.split(/\s/).slice(0, -1),
            // Append the tag name to the list of tags.
            tag.name,
            // And a little spacey.
            ""
        ].join(" ");
        
        // Clear the auto complete entries.
        setAutoCompleteEntries([]);
        
        // Wait for the next frame because JavaScript is shitting through the screen.
        setImmediate(() => {
            // Set the selection index to the end of the list.
            ref.current.selectionStart =
                ref.current.selectionEnd = ref.current.value.length;
            
            // Focus the input field element.
            ref.current.focus();
        });
    }
    
    return (
        <div className={joinClassNames("SearchFieldContainer", [focused, "Focused"])}>
            <input className="SearchField" {...events} ref={ref}
                   id="searchField" autoCorrect="false"
                   defaultValue={defaultValue}
                   autoComplete="off"
                   placeholder={placeholder}/>
            
            <Feather.Search className="Button" onClick={search.bind(null, null)}/>
            
            <div className="AutoCompleteContainer">
                {autoCompleteEntries.map(tag => tag === null
                    ? (
                        <div className="AutoCompleteEntry" style={{ padding: 10 }}>
                            <InlineLoading key={Date.now().toString(36)}/>
                        </div>
                    ) : (
                        tag.categoryIcon = TagTypes[tag.category] ?? TagTypes["0"],
                        <div className="AutoCompleteEntry" key={tag.id}
                             onMouseDown={handleAutoCompleteEntryClick.bind(this, tag)}>
                            <div className="IconContainer">
                                {tag.categoryIcon.icon}
                                
                                <Tooltip>{tag.categoryIcon.tooltip}</Tooltip>
                            </div>
                            
                            { tag.antecedent_name ? (
                                <div className="Title">
                                    {tag.name} <span style={{ opacity: 0.75 }}>({tag.antecedent_name})</span>
                                </div>
                            ) : <span className="Title">{ tag.name }</span> }
                            <span className="PostCount">{tag.post_count} posts</span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}