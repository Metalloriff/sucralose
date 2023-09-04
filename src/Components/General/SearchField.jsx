import _ from "lodash";
import React from "react";
import * as Feather from "react-feather";
import API from "../../Classes/API";
import { ActionTypes, joinClassNames, openFileDialog } from "../../Classes/Constants";
import { dispatcher } from "../../Classes/Dispatcher";
import QueryManager from "../../Classes/QueryManager";
import RoutesStore from "../../Classes/Stores/RoutesStore";
import InlineLoading from "../InlineLoading";
import Toasts from "../Toasts";
import Tooltip from "../Tooltip";
import "./SearchField.scss";

// Create the tag icon types.
export const TagTypes = {
	0: { icon: <Feather.Hash />, tooltip: "General" },
	1: { icon: <Feather.Edit2 />, tooltip: "Artist" },
	3: { icon: <Feather.Award />, tooltip: "Copyright" },
	4: { icon: <Feather.User />, tooltip: "Character" },
	5: { icon: <Feather.Activity />, tooltip: "Species" },
	6: { icon: <Feather.AlertTriangle />, tooltip: "Invalid" },
	7: { icon: <Feather.AlignCenter />, tooltip: "Meta" },
	8: { icon: <Feather.BookOpen />, tooltip: "Lore" }
};

export default function SearchField({
	placeholder = "Search..."
}) {
	const [focused, setFocused] = React.useState(false);
	const [autoCompleteEntries, setAutoCompleteEntries] = React.useState([]);
	const ref = React.useRef();

	const query = QueryManager.useState(() => QueryManager.get("search")) || "";
	const [value, setValue] = React.useState(query);

	React.useEffect(() => {
		setValue(query);
	}, [query]);

	function search(value = null) {
		// If a value was passed, set the value to that.
		if (value) ref.current.value = value;

		if (!RoutesStore.getFormattedRoute()[0]) {
			dispatcher.dispatch({
				type: ActionTypes.UPDATE_ROUTE,
				path: "/posts"
			});
		}

		QueryManager.set("search", ref.current.value);
		QueryManager.set("page", null);
	}

	async function imageSearch() {
		const [file] = await openFileDialog();
		if (!file) return;

		const md5Response = await API.request("posts", { tags: "md5:" + file.name.split(".")[0] }).catch(() => null);
		if (md5Response?.posts?.length) {
			dispatcher.dispatch({
				type: ActionTypes.UPDATE_ROUTE,
				path: `/post/${md5Response.posts[0].id}`
			});

			return;
		}

		Toasts.showToast("Could not find any post by MD5 hash! True image searching will be added soon!", "Failure");

		return;

		const reader = new FileReader();

		reader.onload = async e => {
			const formData = new FormData();
			formData.append("file", e.target.result.split(",")[1]);

			const req = await fetch("https://saucenao.com/search.php", {
				method: "POST",
				mode: "no-cors",
				headers: {
					"Content-Type": "application/json"
				},
				body: new URLSearchParams({
					file,
					output_type: 2,
					api_key: "d7aca1f6f9e269dd42f9897af2e9538421b756e4"
				})
			});
			const results = req;
		};

		reader.readAsDataURL(file);
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

			// Get the search string.
			const search = value.split(/\s/).slice(-1)[0].replace(/[-~*]/g, "");
			// If the search string is empty, clear the state and return.
			if (!search.trim()) return setAutoCompleteEntries([]);

			// Display a loading indicator.
			setAutoCompleteEntries([null]);

			// Fetch the auto complete entries from the api.
			const entries = await API.request("tags", {
				"search[name_matches]": search + "*",
				"search[order]": "count",
				"limit": 10
			});

			try {
				// Set the auto complete entries.
				setAutoCompleteEntries([...(entries || [])]);
			}
			catch (e) {
				setAutoCompleteEntries([]);
			}
		}, 200),
		onChange: e => {
			const { value } = e.currentTarget;
			setValue(value);
		}
	}), []);

	// Create auto complete entry click handler.
	function handleAutoCompleteEntryClick(tag) {
		// Get all tag entries
		const tags = ref.current.value.split(/\s/);
		// Set the input text to the clicked tag name.
		setValue([
			// Get the text content of the input, excluding the last word.
			...tags.slice(0, -1),
			// Append the tag name to the list of tags.
			(tags[tags.length - 1].match(/[^a-z0-9_]/gi)?.[0] ?? "") + tag.name,
			// And a little spacey.
			""
		].join(" "));

		// Clear the auto complete entries.
		setAutoCompleteEntries([]);

		// Wait for the next frame because JavaScript is shitting through the screen.
		setTimeout(() => {
			// Set the selection index to the end of the list.
			ref.current.selectionStart =
				ref.current.selectionEnd = ref.current.value.length;

			// Focus the input field element.
			ref.current.focus();
		}, 0);
	}

	return (
		<div className={joinClassNames("SearchFieldContainer", [focused, "Focused"])}>
			<input className="SearchField" {...events} ref={ref}
				id="searchField" autoCorrect="false"
				value={value}
				autoComplete="off"
				placeholder={placeholder} />

			<Feather.Image className="Button" onClick={imageSearch.bind(null, null)} />
			<Feather.Search className="Button" onClick={search.bind(null, null)} />

			<div className="AutoCompleteContainer">
				{autoCompleteEntries.map(tag => tag === null
					? (
						<div className="AutoCompleteEntry" style={{ padding: 10 }}>
							<InlineLoading key={Date.now().toString(36)} />
						</div>
					) : (
						tag.categoryIcon = TagTypes[tag.category] ?? TagTypes["0"],
						<div className="AutoCompleteEntry" key={tag.id}
							onMouseDown={handleAutoCompleteEntryClick.bind(this, tag)}>
							<div className="IconContainer">
								{tag.categoryIcon.icon}

								<Tooltip>{tag.categoryIcon.tooltip}</Tooltip>
							</div>

							{tag.antecedent_name ? (
								<div className="Title">
									{tag.name} <span style={{ opacity: 0.75 }}>({tag.antecedent_name})</span>
								</div>
							) : <span className="Title">{tag.name}</span>}
							<span className="PostCount">{tag.post_count} posts</span>
						</div>
					)
				)}
			</div>
		</div>
	);
}