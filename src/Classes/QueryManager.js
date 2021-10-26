import { ActionTypes } from "./Constants";
import { dispatcher } from "./Dispatcher";
import Store from "./Store";

const QueryStoreClass = class QueryStore extends Store {
	get query() {
		return Object.fromEntries(
			new URLSearchParams(window.location.search)
		);
	}

	get(key, def = null) {
		return this.query[key] ?? def;
	}

	set(key, value, options = {}) {
		const query = new URLSearchParams(window.location.search);
		value === null ? query.delete(key) : query.set(key, value);

		dispatcher.dispatch({
			type: ActionTypes.UPDATE_QUERY,
			query: "?" + query.toString(),
			options
		});
	}
}

const QueryStore = new QueryStoreClass(dispatcher, {
	[ActionTypes.UPDATE_QUERY]: ({ query, options }) => {
		const {
			pushHistory = true
		} = options;

		dispatcher.dispatch({
			type: ActionTypes.UPDATE_ROUTE,
			replace: !pushHistory,
			path: query
		});
	},

	[ActionTypes.UPDATE_PAGE]: () => { }
});

export default QueryStore;