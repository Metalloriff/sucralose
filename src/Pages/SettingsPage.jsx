import _ from "lodash";
import React, { useReducer } from "react";
import * as Feather from "react-feather";
import { Edit2, Trash } from "react-feather";
import { ActionTypes, getRandomKey } from "../Classes/Constants";
import Database from "../Classes/Database";
import { dispatcher } from "../Classes/Dispatcher";
import UserStore from "../Classes/Stores/UserStore";
import Header from "../Components/General/Header";
import InlineLoading from "../Components/InlineLoading";
import LinkWrapper from "../Components/LinkWrapper";
import { Modals, openBoolModal } from "../Components/Modals";
import CreateBlacklistModal from "../Components/Modals/CreateBlacklistModal";
import TutorialModal from "../Components/Modals/TutorialModal";
import Toasts from "../Components/Toasts";
import Tooltip from "../Components/Tooltip";
import ApiKeyHelp0 from "../Help/API Key/0.png";
import ApiKeyHelp1 from "../Help/API Key/1.png";
import ApiKeyHelp2 from "../Help/API Key/2.png";
import "./SettingsPage.scss";


function ApiKeyTutorialModal() {
	return (
		<TutorialModal>
			<h3>
				Your API key is <b style={{ color: "var(--red)" }}>NOT</b> your password.
			</h3>

			<h4>
				It is used to interface with the e621 API, safely and securely;
			</h4>

			<h4>
				however, you should refrain from revealing this API key to anyone,
				as it gives them access to all of your content, and the ability to post and vote as you.
			</h4>

			<h4>
				If you do not trust Sucralose, all of the source is available on GitHub,
				I recommend and encourage you to view and analyze the source code.
			</h4>

			<p>
				That being said, you may gain access to your API key by navigating
				to <a href="https://e621.net/users/home">https://e621.net/users/home</a> and
				following the steps below.
			</p>

			<p style={{ marginTop: 50 }}>
				<h2>Step 1</h2>
				After navigating to your home page (and signing in if necessary),
				you'll want to navigate to <b>Manage API Access</b>.
			</p>
			<img src={ApiKeyHelp0} alt="Help" />

			<p style={{ marginTop: 50 }}>
				<h2>Step 2</h2>
				Enter your password, and press <b>Submit</b>.
			</p>
			<img src={ApiKeyHelp1} alt="Help" />

			<p style={{ marginTop: 50 }}>
				<h2>Step 3</h2>
				Copy the text under <b>API Key</b> to your clipboard.
			</p>
			<img src={ApiKeyHelp2} alt="Help" />

			<p style={{ marginTop: 50 }}>
				<h2>Step 4, Final</h2>
				Now that you have the API key, simple enter your username and API key
				into their respective fields in Sucralose.
			</p>
		</TutorialModal>
	)
}

function ApiKeySection() {
	const localUser = UserStore.useState(() => UserStore.getLocalUser());

	const events = {
		saveUsername: ({ target }) => {
			if (target.value.trim() === localUser?.username) return;

			if (target.length > 36)
				return Toasts.showToast("Username is too long", "Failure");

			Database.update(
				Database.doc("users", localUser.uid),
				{ username: target.value }
			).then(() => {
				Toasts.showToast("Username updated", "Success");

				_.merge(localUser, { username: target.value });
			});
		},
		saveApiKey: ({ target }) => {
			if (target.value.trim() === localUser?.apiKey) return;

			if (target.length > 36)
				return Toasts.showToast("Invalid API key", "Failure");

			Database.update(
				Database.doc("users", localUser.uid),
				{ apiKey: target.value }
			).then(() => {
				Toasts.showToast("API key updated", "Success");

				_.merge(localUser, { apiKey: target.value });
			});
		}
	}

	return localUser?.signedIn ? (
		<div className="Section ApiKey">
			<h1>E621 API Key</h1>

			<u onClick={() => Modals.push(<ApiKeyTutorialModal />)}>
				What's this?
			</u>

			<div className="FieldContainer">
				<input className="Field" placeholder="Username"
					defaultValue={localUser.username}
					onBlur={events.saveUsername} />
			</div>

			<div className="FieldContainer">
				<input className="Field Confidential" placeholder="API Key"
					defaultValue={localUser.apiKey}
					onBlur={events.saveApiKey} />
			</div>
		</div>
	) : null;
}

export function SubscriptionsSection() {
	const localUser = UserStore.useState(() => UserStore.getLocalUser());
	const [subscriptions, setSubscriptions] = React.useState([]);
	const [busy, setBusy] = React.useState(false);

	React.useEffect(() => {
		if (localUser?.subscriptions) {
			setSubscriptions(localUser.subscriptions);
		}
	}, [localUser]);

	React.useEffect(() => {
		if (localUser?.signedIn && !_.isEqual(localUser.subscriptions, subscriptions) && busy) {
			_.merge(localUser, { subscriptions });

			Database.update(
				Database.doc("users", localUser.uid),
				{ subscriptions }
			).then(() => {
				Toasts.showToast("Subscriptions updated", "Success");

				setBusy(false);
			});
		}
	}, [subscriptions, busy]);

	return localUser?.signedIn ? (
		<div className="Section TagsManager Subscriptions">
			<h1>Subscribed Tags</h1>

			<div className="Tags Flex">
				{subscriptions.map(tag => (
					<div className="Tag FlexCenter" key={tag}>
						<LinkWrapper href={`/posts?search=${tag}`}>{tag}</LinkWrapper>

						<Feather.X
							onClick={() => {
								setBusy(true);
								setSubscriptions(subscriptions.filter(t => t !== tag));
							}}
						/>
					</div>
				))}

				<input
					key={subscriptions.length}

					className="TagField"
					placeholder="Add tag"

					onBlur={e => {
						if (!e.target.value.trim()) return;

						setBusy(true);
						setSubscriptions([...subscriptions, e.target.value.trim()]);

						e.target.value = "";
					}}
				/>
			</div>
		</div>
	) : null;
}

export function BlacklistsSection() {
	const localUser = UserStore.useState(() => UserStore.getLocalUser());
	const blacklists = UserStore.useState(() => UserStore.getLocalUser()?.blacklists);

	const [, forceUpdate] = useReducer(x => x + 1, 0);

	const events = {
		edit: index => {
			Modals.push(<CreateBlacklistModal edit={blacklists[index]} index={index} callback={forceUpdate} />)
		},
		delete: index => {
			openBoolModal({
				title: "Are you sure?",
				description: `Do you want to delete blacklist '${blacklists[index].name}?' This cannot be undone.`
			}).then(r => {
				if (!r) return;

				localUser.blacklists.splice(index, 1);
				Database.update(
					Database.doc("users", localUser.uid),
					{
						blacklists: localUser.blacklists,
						currentBlacklist: "defaults.none"
					}
				).then(forceUpdate);
			});
		}
	};

	return localUser?.signedIn ? (
		<div className="Section BlacklistsSection">
			<h1>Blacklists</h1>

			{blacklists.map(({ name, tags }, index) => (
				<div className="Blacklist" key={getRandomKey()}>
					<h3>{name}</h3>

					<p>
						{tags.split("\n").map(tag => <div key={tag}>{tag}</div>)}
					</p>

					<div className="FooterButtons">
						<Edit2 className="FooterButton" onClick={() => events.edit(index)} />
						<Trash className="FooterButton" onClick={() => events.delete(index)} />
					</div>
				</div>
			))}
		</div>
	) : null;
}

export default function SettingsPage() {
	const updateDeBouncer = _.debounce(() => dispatcher.dispatch({ type: ActionTypes.UPDATE_SETTINGS }), 200);
	const saveDeBouncer = _.debounce(Settings.save.bind(Settings), 2000);

	const localUser = UserStore.useState(() => UserStore.getLocalUser());
	const [, forceUpdate] = React.useReducer(x => x + 1, 0);

	React.useEffect(() => {
		if (localUser) {
			Settings.props = _.merge(
				{},
				Settings.defaults,
				Settings.props,
				localUser.settings
			);

			forceUpdate();
		}
	}, [localUser]);

	dispatcher.useForceUpdater(ActionTypes.UPDATE_SETTINGS);

	return localUser?.signedIn ? (
		<div className="SettingsPage">
			<Header hasSearch={false} />

			<div className="Section Flex" style={{ gap: 10 }}>
				<div
					className="Button"
					onClick={() => {
						Database.getDoc(
							Database.doc("users", localUser.uid)
						).then(data => {
							const url = URL.createObjectURL(new Blob([
								JSON.stringify(Database.serializeObject(data), null, "\t")
							], { type: "json" }));

							const a = _.assign(
								document.createElement("a"),
								{
									download: `${localUser.username}.json`,
									href: url
								}
							);

							document.body.appendChild(a);
							a.click();

							setTimeout(() => {
								document.body.removeChild(a);
								URL.revokeObjectURL(url);
							}, 0);
						});
					}}
				>
					Download My Data

					<Tooltip style={{ color: "white" }}>
						This will give you a JSON file<br />
						containing all of your data<br />
						stored on the database.
					</Tooltip>
				</div>

				<div
					className="Button"
					onClick={() =>
						Database.auth.signOut()
							.then(() => (window.location.pathname = "", window.location.reload()))}
				>
					Sign Out
				</div>
			</div>

			<ApiKeySection />
			<SubscriptionsSection />
			<BlacklistsSection />

			{Object.entries(Settings.props).map(([categoryName, props]) => (
				<div className="Section" key={categoryName}>
					<h1>{formatCamelCase(categoryName)}</h1>

					{Object.entries(props).map(([name, setting]) => (
						<SettingField
							key={getRandomKey()}
							name={name}
							setting={setting}
							resetValue={Settings.defaults[categoryName][name].value}
							callback={value =>
								(Settings.props[categoryName][name].value = value, saveDeBouncer(), updateDeBouncer())}
						/>
					))}
				</div>
			))}
		</div>
	) : (
		<div className="SettingsPage FlexCenter">
			<InlineLoading />
		</div>
	);
}

export const Settings = new class Settings {
	defaults = {
		accentColors: {
			primary: {
				type: "color",
				value: "#7bb1bd"
			},
			secondary: {
				type: "color",
				value: "#BD7BA2"
			}
		},
		backgroundColors: {
			primary: {
				type: "color",
				value: "#2c3946"
			},
			secondary: {
				type: "color",
				value: "#364758"
			},
			tertiary: {
				type: "color",
				value: "#364758"
			}
		},
		backgroundImage: {
			url: {
				type: "string",
				value: "",
				placeholder: "Example - https://c.tenor.com/Z6gmDPeM6dgAAAAC/dance-moves.gif"
			},
			brightness: {
				type: "slider",
				min: 0, max: 100,
				step: 1,
				value: 100
			},
			blur: {
				type: "slider",
				min: 0, max: 25,
				step: 0.5,
				value: 0
			},
			positionX: {
				type: "slider",
				min: 0, max: 100,
				step: 1,
				value: 50
			},
			positionY: {
				type: "slider",
				min: 0, max: 100,
				step: 1,
				value: 50
			}
		}
	};

	props = _.extend({}, this.defaults);

	async save() {
		const localUser = UserStore.getLocalUser();

		console.trace();

		for (const categoryName in this.props) {
			for (const name in this.props[categoryName]) {
				const setting = this.props[categoryName][name];

				_.set(localUser, ["settings", categoryName, name, "value"], setting.value);
			}
		}

		const promise = await Database.getDoc(Database.doc("users", localUser.uid))
			? Database.update(
				Database.doc("users", localUser.uid),
				{ settings: localUser.settings }
			)
			: Database.set(
				Database.doc("users", localUser.uid),
				{ settings: localUser.settings }
			);

		await promise
			.then(() => Toasts.showToast("Settings updated on the database"))
			.catch(err => (console.error(err), Toasts.showToast("An unknown error occurred while saving settings", "Failure")));
	}
}

function formatCamelCase(camelCase) {
	const r = camelCase.replace(/([A-Z])/g, " $1");

	return r.charAt(0).toUpperCase() + r.slice(1);
}

export function SettingField({ name, setting, resetValue, callback }) {
	const [value, setValueState] = React.useState(setting.value);
	const pickerRef = React.useRef();
	const inputRef = React.useRef();
	const setState = newVal => {
		callback?.(newVal);
		setValueState(newVal);

		if (pickerRef.current) pickerRef.current.value = newVal;
		if (inputRef.current) inputRef.current.value = newVal;
	};

	const resetButton = value !== resetValue && (
		<div className="ResetButton"
			onClick={() => setState(resetValue)}>
			<Feather.RotateCcw />

			<Tooltip>Reset To Default</Tooltip>
		</div>
	);

	switch (setting.type) {
		default: return null;

		case "color": return (
			<div className="FieldContainer">
				<h4 className="FieldTitle">{formatCamelCase(name)}</h4>

				<div className="Flex" style={{ alignItems: "center" }}>
					<input className="ColorPicker" defaultValue={value}
						type="color"
						ref={pickerRef}
						onInput={e => setState(e.currentTarget.value)} />

					<input className="Field ColorField" defaultValue={value}
						ref={inputRef}
						style={{ borderColor: value }}
						maxLength={64}
						onInput={e => setState(e.currentTarget.value)} />

					{resetButton}
				</div>
			</div>
		);

		case "string": return (
			<div className="FieldContainer">
				<h4 className="FieldTitle">{formatCamelCase(name)}</h4>

				<div className="Flex" style={{ alignItems: "center" }}>
					<input className="Field" defaultValue={value}
						placeholder={setting.placeholder}
						ref={inputRef} maxLength={128}
						onInput={e => setState(e.currentTarget.value)} />
				</div>
			</div>
		);

		case "slider": return (
			<div className="FieldContainer">
				<h4 className="FieldTitle">{formatCamelCase(name)} - {value}</h4>

				<div className="Flex" style={{ alignItems: "center" }}>
					<input className="Field ColorField" defaultValue={value}
						type="range"
						ref={inputRef}
						onInput={e => setState(parseFloat(e.currentTarget.value))}
						min={setting.min} max={setting.max} />

					{resetButton}
				</div>
			</div>
		);
	}
}

export function SettingsRenderer() {
	dispatcher.useForceUpdater(ActionTypes.UPDATE_SETTINGS);

	const { props } = Settings;

	return (
		<style>
			{`
            
			:root {
				--primary-color: ${props.accentColors.primary.value};
				--secondary-color: ${props.accentColors.secondary.value};
				
				--primary-bg: ${props.backgroundColors.primary.value};
				--secondary-bg: ${props.backgroundColors.secondary.value};
				--tertiary-bg: ${props.backgroundColors.tertiary.value};
			}
			
			`}

			{!!props.backgroundImage?.url?.value?.trim?.() && `
                .AppBackground {
                    background-image: url("${props.backgroundImage.url.value}");
                    background-position: ${props.backgroundImage.positionX.value}%
                                         ${props.backgroundImage.positionY.value}%;
                    
                    filter: blur(${props.backgroundImage.blur.value || 0}px)
                            brightness(${props.backgroundImage.brightness.value}%);
                            
                    opacity: 1;
                }
                
                footer {
                    backdrop-filter: blur(7px);
                }
                
                .SearchFieldContainer.Focused:After {
                    background-color: rgba(0,0,0, 0.2);
                    backdrop-filter: blur(5px);
                }
            ` }
		</style>
	);
}