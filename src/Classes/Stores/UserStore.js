import { onAuthStateChanged } from "@firebase/auth";
import { serverTimestamp } from "@firebase/firestore";
import { getMessaging, getToken } from "firebase/messaging";
import _ from "lodash";
import { Modals } from "../../Components/Modals";
import AuthModal from "../../Components/Modals/AuthModal";
import Toasts from "../../Components/Toasts";
import { Settings } from "../../Pages/SettingsPage";
import API from "../API";
import { ActionTypes } from "../Constants";
import Database from "../Database";
import { dispatcher } from "../Dispatcher";
import Store from "../Store";

const cache = {};
let localUser = null;

const vapidKey = "BBWvMxlJ7kaRqFNxqnzChq6HE_wXmrt39gSgbsivwiccua2xFmK1qQqtPLtBQRkjBN0xM1HDlQ8ycbXaUiWulzo";

const UserStoreClass = class UserStore extends Store {
	constructor(dispatcher, actionTypes) {
		super(dispatcher, actionTypes);

		const unsubscribe = onAuthStateChanged(Database.auth, fbUser => {
			if (fbUser) {
				Database.getDoc(
					Database.doc("users", fbUser.uid)
				).then(async data => {
					if (!data) {
						data = {};
					}

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

					Notification.requestPermission().then(() => {
						if (Notification.permission !== "granted") {
							Toasts.showToast(
								"Notifications are disabled, you will not received subscribed tag notifications",
								"Failure",
								10
							);

							Toasts.showToast(
								"To fix this, please enabled notifications for sucralose.top in your browser settings",
								"Failure",
								10
							);
						}
						else {
							try {
								const messaging = getMessaging(Database.app);

								getToken(messaging, { vapidKey }).then(async token => {
									const ref = Database.doc("users", fbUser.uid, "fcmTokens", token.slice(0, 10));
									const existing = await Database.getDoc(ref);

									Database.set(
										ref,
										{
											token,
											registered: existing ? existing.registered : serverTimestamp(),
											lastLogin: serverTimestamp()
										}
									);
								}).catch(console.error);
							}
							catch (err) {
								console.error(err);
							}
						}
					});

					dispatcher.dispatch({
						type: ActionTypes.UPDATE_LOCAL_USER,
						user
					});

					dispatcher.dispatch({
						type: ActionTypes.UPDATE_USER,
						user: user.e621User
					});

					Settings.props = _.merge(
						{},
						Settings.defaults,
						Settings.props,
						user.settings
					);

					dispatcher.dispatch({
						type: ActionTypes.UPDATE_SETTINGS,
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