import React from "react";
import { Plus } from "react-feather";
import API from "../../Classes/API";
import UserStore from "../../Classes/Stores/UserStore";
import { Modals } from "../Modals";
import SwitchItem from "../SwitchItem";
import Toasts from "../Toasts";
import "./CreateSetModal.scss";
import TutorialModal from "./TutorialModal";

export default function CreateSetModal({ postId }) {
	const ref = React.useRef();

	async function create() {
		const [name, shortname, description] = [...ref.current.getElementsByClassName("Field")]
			.map(field => field.value);
		const is_public = ref.current.querySelector(".SwitchItem > input").checked;
		const transfer_on_delete = true;
		const commit = "Create";

		const response = await API.request(
			"post_sets",
			{
				"post_set[name]": name,
				"post_set[shortname]": shortname,
				"post_set[description]": description,
				"post_set[is_public]": is_public ? 1 : 0,
				"post_set[transfer_on_delete]": transfer_on_delete ? 1 : 0,
				commit
			},
			true,
			{
				method: "POST"
			}
		);

		if (response.errors) {
			for (const category in response.errors) {
				Toasts.showToast(
					<div>
						<h4>{category} errors</h4>

						<ul style={{ textAlign: "left" }}>
							{response.errors[category].map((err, i) => (
								<li key={i}>
									{err}
								</li>
							))}
						</ul>

						<p>Click to dismiss.</p>
					</div>,
					"",
					20
				)
			}
		}
		else {
			await API.request(
				`post_sets/${response.id}/add_posts`,
				{ "post_ids[]": postId },
				true,
				{ method: "POST" }
			);

			response.post_ids.push(postId);

			const sets = await UserStore.getLocalUser().getSets();
			sets.push(response);

			Toasts.showToast("Successfully created set", "Success");
			await Modals.pop();
		}
	}

	return (
		<TutorialModal title="Create New Set">
			<div className="CreateSetModal" ref={ref}>
				<div className="FieldContainer">
					<h3>Name</h3>

					<input
						className="Field"
						placeholder="Ex - Epic Dragons"
					/>
				</div>

				<div className="FieldContainer">
					<h3>Short Name</h3>
					<div className="Note">
						The short name is used for the set's metatag name, or a unique identifier.<br />
						It can only contain letters, numbers, and underscores.
					</div>

					<input
						className="Field"
						placeholder="Ex - epic_dragons"
					/>
				</div>

				<div className="FieldContainer">
					<h3>Description</h3>

					<textarea
						className="Field"
						placeholder="Note - Follows DText markdown formatting"
					/>
				</div>

				<div className="FieldContainer">
					<SwitchItem
						title="Public"
						callback={null}
					/>

					<div className="Note">
						Public sets will be visible to anyone.<br />
						Private sets will only be visible to you.
					</div>
				</div>

				<div className="FieldContainer">
					<div className="Button" onClick={create}>
						<Plus />

						Create Set
					</div>
				</div>
			</div>
		</TutorialModal>
	);
}