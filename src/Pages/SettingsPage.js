import React from "react";
import "./SettingsPage.scss";
import Header from "../Components/General/Header";
import { Modals } from "../Components/Modals";
import TutorialModal from "../Components/Modals/TutorialModal";
import Toasts from "../Components/Toasts";
import Database from "../Classes/Database";
import App from "../App";
import _ from "lodash";
import * as Feather from "react-feather";

import ApiKeyHelp0 from "../Help/API Key/0.png";
import ApiKeyHelp1 from "../Help/API Key/1.png";
import ApiKeyHelp2 from "../Help/API Key/2.png";
import Tooltip from "../Components/Tooltip";
import { getRandomKey } from "../Classes/Constants";

function ApiKeyTutorialModal() {
    return (
        <TutorialModal>
            <h3>
                Your API key is <b style={{ color: "var(--red)" }}>NOT</b> your pasword.
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
            <img src={ApiKeyHelp0} alt="Help"/>

            <p style={{ marginTop: 50 }}>
                <h2>Step 2</h2>
                Enter your password, and press <b>Submit</b>.
            </p>
            <img src={ApiKeyHelp1} alt="Help"/>

            <p style={{ marginTop: 50 }}>
                <h2>Step 3</h2>
                Copy the text under <b>API Key</b> to your clipboard.
            </p>
            <img src={ApiKeyHelp2} alt="Help"/>

            <p style={{ marginTop: 50 }}>
                <h2>Step 4, Final</h2>
                Now that you have the API key, simple enter your username and API key 
                into their respective fields in Sucralose.
            </p>
        </TutorialModal>
    )
}

function ApiKeySection() {
    const events = {
        saveUsername: ({ target }) => {
            if (target.value.trim() === App.userData?.username) return;
            
            if (target.length > 36)
                return Toasts.showToast("Username is too long", "Failure");
            
            Database.update({ username: target.value }, "users", App.user.uid)
                .then(() => {
                    Toasts.showToast("Username updated", "Success");
                    
                    _.merge(App.userData, { username: target.value });
                });
        },
        saveApiKey: ({ target }) => {
            if (target.value.trim() === App.userData?.apiKey) return;
            
            if (target.length > 36)
                return Toasts.showToast("Invalid API key", "Failure");

            Database.update({ apiKey: target.value }, "users", App.user.uid)
                .then(() => {
                    Toasts.showToast("API key updated", "Success");

                    _.merge(App.userData, { apiKey: target.value });
                });
        }
    }
    
    return App.user && App.userReady ? (
        <div className="Section ApiKey">
            <h1>E621 API Key</h1>

            <u onClick={() => Modals.push(<ApiKeyTutorialModal/>)}>
                What's this?
            </u>

            <div className="FieldContainer">
                <input className="Field" placeholder="Username"
                       defaultValue={App.userData.username}
                       onBlur={events.saveUsername}/>
            </div>

            <div className="FieldContainer">
                <input className="Field Confidential" placeholder="API Key"
                       defaultValue={App.userData.apiKey}
                       onBlur={events.saveApiKey}/>
            </div>
        </div>
    ) : null;
}

export default function SettingsPage() {
    const updateDeBouncer = _.debounce(() => SettingsRenderer.forceUpdate(), 200);
    const saveDeBouncer = _.debounce(Settings.save.bind(Settings), 2000);
    
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    SettingsPage.forceUpdate = forceUpdate;
    
    return (
        <div className="SettingsPage">
            <Header hasSearch={false}/>
            
            <ApiKeySection/>
            
            { Object.entries(Settings.props).map(([categoryName, props]) => (
                <div className="Section" key={categoryName}>
                    <h1>{formatCamelCase(categoryName)}</h1>
                    
                    { Object.entries(props).map(([name, setting]) => (
                        <SettingField
                            key={getRandomKey()}
                            name={name}
                            setting={setting}
                            resetValue={Settings.defaults[categoryName][name].value}
                            callback={value =>
                                (Settings.props[categoryName][name].value = value, saveDeBouncer(), updateDeBouncer())}
                        />
                    )) }
                </div>
            )) }
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
    
    props = _.merge({ }, this.defaults);
    
    async save() {
        _.merge(App.userData?.settings, this.props);

        await Database.update(App.userData, "users", App.user.uid)
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
            <Feather.RotateCcw/>
            
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
                           onInput={e => setState(e.currentTarget.value)}/>
                    
                    <input className="Field ColorField" defaultValue={value}
                           ref={inputRef}
                           style={{ borderColor: value }}
                           maxLength={64}
                           onInput={e => setState(e.currentTarget.value)}/>
                    
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
                           onInput={e => setState(e.currentTarget.value)}/>
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
                           onInput={e => setState(e.currentTarget.value)}
                           min={setting.min} max={setting.max}/>
                    
                    {resetButton}
                </div>
            </div>
        );
    }
}

export function SettingsRenderer() {
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    SettingsRenderer.forceUpdate = forceUpdate;

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
            
            { !!props.backgroundImage?.url?.value?.trim?.() && `
                .AppBackground {
                    background-image: url("${props.backgroundImage.url.value}");
                    background-position: ${props.backgroundImage.positionX.value}%
                                         ${props.backgroundImage.positionY.value}%;
                    
                    filter: blur(${props.backgroundImage.blur.value || 0}px)
                            brightness(${props.backgroundImage.brightness.value}%);
                            
                    opacity: 1;
                }
                
                .Footer {
                    background-color: rgba(0,0,0, 0.5);
                    backdrop-filter: blur(7px);
                }
            ` }
        </style>
    );
}