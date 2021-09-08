import React from "react";
import "./TagItem.scss";
import * as Feather from "react-feather";
import ContextMenu from "../ContextMenuHandler";
import SearchField from "../General/SearchField";
import Database from "../../Classes/Database";
import Toasts from "../Toasts";
import App from "../../App";
import LinkWrapper from "../LinkWrapper";

/* TODO
    
    Replace tagInfo event with custom modal.
    
 */

export default function TagItem({ children }) {
    return (
        <ContextMenu.Wrapper menu={<TagItemContextMenu tag={children}/>} wrapperClassName="TagItemContextMenuWrapper">
            <LinkWrapper className="TagItem" onClick={() => SearchField.handleSearch(children)}
                         href={`?search=${children}#posts`}>
                {children}
            </LinkWrapper>
        </ContextMenu.Wrapper>
    )
}

export function TagItemContextMenu({ tag }) {
    const events = {
        appendToSearch: () =>
            SearchField.handleSearch(SearchField.value.trim() + " " + tag),
        subscribe: () => {
            App.userData.subscriptions.push(tag);
            
            Database.update(App.userData, "users", App.user.uid)
                .then(() => Toasts.showToast(<span>Added <b>{tag}</b> to subscribed tags</span>))
                .catch(err => (console.error(err), Toasts.showToast("An unknown error occurred", "Failure")));
        },
        unsubscribe: () => {
            
        },
        blacklist: () => {
            
        },
        tagInfo: () => {
            window.open(`https://e621.net/wiki_pages/${tag}`, "_blank");
        }
    };
    
    return (
        <ContextMenu>
            <ContextMenu.Item
                autoClose
                icon={<Feather.Plus/>}
                onClick={events.appendToSearch}
            >Append To Search Tags</ContextMenu.Item>
            
            <ContextMenu.Divider/>
            
            { App.userData && (
                <React.Fragment>
                    { ~App.userData.subscriptions.indexOf(tag.toLowerCase()) ? (
                        <ContextMenu.Item
                            autoClose
                            icon={<Feather.BellOff/>}
                            onClick={events.unsubscribe}
                        >Unsubscribe</ContextMenu.Item>
                    ) : (
                        <ContextMenu.Item
                            autoClose
                            icon={<Feather.Bell/>}
                            onClick={events.subscribe}
                        >Subscribe</ContextMenu.Item>
                    ) }

                    <ContextMenu.Item
                        autoClose
                        icon={<Feather.EyeOff/>}
                        onClick={events.blacklist}
                    >Blacklist</ContextMenu.Item>

                    <ContextMenu.Divider/>
                </React.Fragment>
            ) }
            
            <ContextMenu.Item
                autoClose
                icon={<Feather.HelpCircle/>}
                onClick={events.tagInfo}
            >Tag Info</ContextMenu.Item>
        </ContextMenu>
    );
}