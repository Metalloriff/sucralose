import { useState } from "react";
import API from "../../Classes/API";
import Database from "../../Classes/Database";
import UserStore from "../../Classes/Stores/UserStore";
import { Modals } from "../Modals";
import "./CreateBlacklistModal.scss";
import TutorialModal from "./TutorialModal";

export default function CreateBlacklistModal({ edit = null, index = null, callback = null }) {
	const [title, setTitle] = useState(edit?.name ?? "");
	const [blacklist, setBlacklist] = useState(edit?.tags ?? "");

	const events = {
		cancel: () => Modals.pop(),
		save: async () => {
			const user = UserStore.getLocalUser();
			user.blacklists = user.blacklists ?? [];

			const tags = blacklist.split("\n").map(tag => tag.toLowerCase().split(/\s+/));
			const aliases = {};
			for (const x in tags) {
				for (const y in tags[x]) {
					const tag = tags[x][y];

					if (aliases[tag]) {
						tags[x][y] = aliases[tag];

						continue;
					}

					try {
						const [{ consequent_name }] = await API.request("tag_aliases", {
							"commit": "Search",
							"search[name_matches]": tags[x][y]
						});

						aliases[tags[x][y]] = consequent_name;
						tags[x][y] = consequent_name;
					}
					catch (err) {
						console.error(err);
					}
				}
			}

			const correctedTags = tags.map(t => t.join(" ")).join("\n");

			if (index !== null) {
				user.blacklists[index] = {
					name: title,
					tags: correctedTags
				};
			}
			else {
				user.blacklists.push({
					name: title,
					tags: correctedTags
				});
			}

			Database.update(
				Database.doc("users", user.uid),
				{ blacklists: user.blacklists }
			).then(() => {
				if (!location.href.includes("/settings")) {
					window.location.reload();
				}

				callback?.();
				Modals.pop();
			});
		}
	};

	return (
		<TutorialModal title="Edit blacklist">
			<div className="CreateBlacklistModal">
				<h2>Title</h2>

				<input value={title} type="text" className="Field" placeholder="Example: Main" onChange={e => setTitle(e.target.value)} />

				<h2>Tags</h2>

				<p>
					Separate tags with spaces, and different tag sets with enter.<br />
					Example: "young rating:e" on one line will hide posts with young AND rating:e, but neither young nor rating:e on their own.
				</p>

				<textarea value={blacklist} className="Field" placeholder={"Example:\n\nyoung rating:e\nhyper\nfnaf"} onChange={e => setBlacklist(e.target.value)} />

				<div className="Footer">
					<div className="Button Red" onClick={events.cancel}>Cancel</div>
					<div className="Button" onClick={events.save}>Save</div>
				</div>
			</div>
		</TutorialModal>
	);
}