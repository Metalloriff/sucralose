import _ from "lodash";
import Toasts from "../Components/Toasts";
import UserStore from "./Stores/UserStore";

export default new class E621API {
	endpoint = "https://e621.net/";
	sfwEndpoint = "https://e926.net/";

	get loginData() {
		const localUser = UserStore.getLocalUser() ?? {};

		return {
			login: localUser.username,
			api_key: localUser.apiKey
		};
	}

	/**
	 * Gets a request-able URL to the E621 API endpoint.
	 * @param sub {string} The page to request.
	 * @param args The arguments to pass to the request as a string.
	 * @param json {boolean} Whether to request from the json endpoint.
	 * @returns {string} An endpoint URL.
	 */
	getEndpoint(sub, args = {}, json = true) {
		// Create the request params object.
		const params = new URLSearchParams({
			...args,
			_client: "Sucralose/2.0 by Metalloriff"
		});

		const nsfw = (localStorage.getItem("showNsfw") || "false") === "true";

		// Return the request string.
		return `${nsfw ? this.endpoint : this.sfwEndpoint}${sub}${json ? ".json?" : "?"}${params}`;
	}

	/**
	 * Make a request to the E621 API endpoint.
	 * @param sub {string} The page to request from the E621 API endpoint.
	 * @param args The arguments to pass to the request as a string.
	 * @param json {boolean} Whether to request from the json endpoint.
	 * @param restOptions The options argument to pass to the fetch request.
	 * @returns {Promise<any>} A promise that resolves when the request has been made.
	 */
	async request(sub, args = {}, json = true, restOptions = {}) {
		// Rate limit for requests made.
		while (Date.now() - this.lastMadeRequest < 500)
			await new Promise(r => setTimeout(r, 50));
		// Set the last made request to the current time.
		this.lastMadeRequest = Date.now();

		// Apply authorization, if valid
		const { login, api_key } = this.loginData;
		login && api_key && _.set(restOptions, ["headers", "authorization"], "Basic " + btoa(`${login}:${api_key}`));

		// Return the response object.
		return await fetch(this.getEndpoint(sub, args, json), restOptions)
			.then(response => json ? response.json() : response);
	}

	/**
	 * The last time a request was made to the E621 API endpoint.
	 * @type {number}
	 */
	lastMadeRequest = -500;

	#voting = {};

	/**
	 * Handles voting/un-voting on a post.
	 * @param postId {number} The ID of the post.
	 * @param score {number | "-1" | "1"} The score to assign to the post.
	 * @returns {Promise<*>}
	 */
	async vote(postId, score) {
		const localUser = UserStore.getLocalUser() ?? {};
		// If the user is not signed in, throw an error and return.
		if (!localUser.username || !localUser.apiKey)
			return Toasts.showToast("You must be logged into e621 to favorite posts", "Failure");

		// If we're already trying to vote on this post, throw an error and return.
		if (this.#voting[postId])
			return Toasts.showToast("You're attempting to vote too quickly", "Failure");
		this.#voting[postId] = true;

		// Make the request to the E621 API.
		return await this.request(
			`posts/${postId}/votes`,
			{ score, no_unvote: false },
			true,
			{ method: "POST" }
		).then(r => (delete this.#voting[postId], r));
	}

	#favoriting = {};

	/**
	 * Handles adding a post to the user's favorites.
	 * @param postId {number} The ID of the post to add.
	 * @returns {Promise<*>}
	 */
	async favorite(postId) {
		const localUser = UserStore.getLocalUser() ?? {};
		// If the user is not signed in, throw an error and return.
		if (!localUser.username || !localUser.apiKey)
			return Toasts.showToast("You must be logged into e621 to favorite posts", "Failure");

		// If we're already trying to favorite this post, throw an error and return.
		if (this.#favoriting[postId])
			return Toasts.showToast("You're attempting to favorite too quickly", "Failure");
		this.#favoriting[postId] = true;

		// Make the request to the E621 API.
		return await this.request(
			"favorites",
			{ post_id: postId },
			true,
			{ method: "POST" }
		).then(r => (delete this.#favoriting[postId], r));
	}

	/**
	 * Handles deleting a post from the user's favorites.
	 * @param postId {number} The ID of the post to remove.
	 * @returns {Promise<*>}
	 */
	async removeFavorite(postId) {
		const localUser = UserStore.getLocalUser() ?? {};
		// If the user is not signed in, throw an error and return.
		if (!localUser.username || !localUser.apiKey)
			return Toasts.showToast("You must be logged into e621 to favorite posts!");

		// If we're already trying to favorite this post, throw an error and return.
		if (this.#favoriting[postId])
			return Toasts.showToast("You're attempting to favorite too quickly", "Failure");
		this.#favoriting[postId] = true;

		// Make the request to the E621 API.
		return await this.request(
			`favorites/${postId}.json`,
			{},
			false,
			{ method: "DELETE" }
		).then(r => (delete this.#favoriting[postId], r)).catch(err => {
			console.error(err);

			// For when they inevitably still haven't fixed this issue.
			Toasts.showToast(
				<>
					Due to an API issue on e621's side, it is currently impossible to unfavorite posts via their API. Please <a href={`https://e621.net/posts/${postId}#remove-fav-button`}>click here</a> to manually unfavorite it.
				</>,
				"Failure",
				10
			);
		});
	}
}