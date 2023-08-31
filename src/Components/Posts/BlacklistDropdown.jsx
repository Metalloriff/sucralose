import { ActionTypes, getRandomKey } from "../../Classes/Constants";
import Database from "../../Classes/Database";
import { dispatcher } from "../../Classes/Dispatcher";
import UserStore from "../../Classes/Stores/UserStore";
import Dropdown, { DropdownItem } from "../Dropdown";
import { Modals } from "../Modals";
import CreateBlacklistModal from "../Modals/CreateBlacklistModal";

export default function BlacklistDropdown({ forceUpdate }) {

	const onChangeBlacklist = selection => {
		if (selection.startsWith("action.")) {
			switch (selection) {
				case "action.create":
					Modals.push(<CreateBlacklistModal />);
					break;

				case "action.edit":
					dispatcher.dispatch({
						type: ActionTypes.UPDATE_ROUTE,
						path: "/settings"
					});
					break;
			}

			return forceUpdate();
		}

		UserStore.getLocalUser().currentBlacklist = selection;

		Database.update(
			Database.doc("users", UserStore.getLocalUser().uid),
			{ currentBlacklist: selection }
		);

		dispatcher.dispatch({
			type: ActionTypes.UPDATE_LOCAL_USER,
			user: UserStore.getLocalUser()
		});
	};

	return UserStore.getLocalUser() && (
		<div className="Blacklists FlexCenter">
			<h2 className="Label">Blacklist</h2>

			<Dropdown value={UserStore.getLocalUser().currentBlacklist} onChange={onChangeBlacklist} key={getRandomKey()}>
				<DropdownItem value="defaults.none">None</DropdownItem>

				{(UserStore.getLocalUser().blacklists ?? []).map(({ name, tags }, index) => (
					<DropdownItem key={index} value={index}>{name}</DropdownItem>
				))}

				<DropdownItem value="action.none" />
				<DropdownItem value="action.edit">EDIT BLACKLISTS</DropdownItem>
				<DropdownItem value="action.create">CREATE NEW BLACKLIST</DropdownItem>
			</Dropdown>
		</div>
	)
}