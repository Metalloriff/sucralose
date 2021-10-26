import { onAuthStateChanged } from "@firebase/auth";
import _ from "lodash";
import { Modals } from "../../Components/Modals";
import AuthModal from "../../Components/Modals/AuthModal";
import API from "../API";
import { ActionTypes } from "../Constants";
import Database from "../Database";
import { dispatcher } from "../Dispatcher";
import Store from "../Store";

const cache = {};
let localUser = null;

const UserStoreClass = class UserStore extends Store {
	constructor(dispatcher, actionTypes) {
		super(dispatcher, actionTypes);

		const unsubscribe = onAuthStateChanged(Database.auth, fbUser => {
			if (fbUser) {
				Database.getDoc(
					Database.doc("users", fbUser.uid)
				).then(async data => {
					let e621User = {};

					if (data.username) {
						e621User = await API.request(`users/${data.username}`, {
							login: data.username,
							api_key: data.apiKey
						});
					}

					const user = _.extend(
						fbUser,
						data,
						{
							e621User,
							signedIn: true,
							sets: data.username && await API.request(
								"post_sets",
								{
									commit: "Search",
									"search[creator_name]": data.username
								}
							),

							get firebaseSerialized() {
								const output = {};

								for (const key in fbUser) {
									if (this[key] !== undefined && key !== "id") {
										output[key] = this[key];
									}
								}

								return output;
							}
						}
					);

					dispatcher.dispatch({
						type: ActionTypes.UPDATE_LOCAL_USER,
						user
					});

					dispatcher.dispatch({
						type: actionTypes.UPDATE_USER,
						user: user.e621User
					});

					dispatcher.dispatch({
						type: actionTypes.UPDATE_SETTINGS,
						settings: user.settings
					});
				});
			}
			else {
				dispatcher.dispatch({
					type: ActionTypes.UPDATE_LOCAL_USER,
					user: {
						signedIn: false
					}
				});

				if (!localStorage.getItem("hasPromptedLogin")) {
					Modals.push(<AuthModal />);

					localStorage.setItem("hasPromptedLogin", "1");
				}
			}
		});
	}

	getUser() {

	}

	getLocalUser() {
		return localUser;
	}

	getCachedUsers() {

	}
}

const UserStore = new UserStoreClass(dispatcher, {
	[ActionTypes.UPDATE_LOCAL_USER]: ({ user }) => {
		localUser = user;
	},
	[ActionTypes.UPDATE_USER]: ({ user }) => {
		cache[user.id] = user;
	}
});

export default UserStore;