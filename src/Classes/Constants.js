import Toasts from "../Components/Toasts";

export function joinClassNames() {
	let final = "";

	for (let i = 0; i < arguments.length; i++) {
		switch (typeof (arguments[i])) {
			case (Array.isArray(arguments[i]) && typeof (arguments[i][0]) === "boolean" && "object"):
				if (arguments[i][0] === true)
					final += arguments[i][1];
				else if (arguments[i][2])
					final += arguments[i][2];
				break;

			default:
				final += arguments[i];
				break;
		}

		final += " ";
	}

	return final.trim();
}

export function openFileDialog(options = {}) {
	return new Promise(r => {
		const { type = "*", multiple = false } = options;
		const input = _.assign(document.createElement("input"), {
			type: "file",
			accept: type,
			style: "display:none",
			multiple,
			onchange: () => (
				r(input.files),

				document.body.removeChild(input)
			)
		});

		document.body.appendChild(input);
		input.click();
	});
}

export function download(uri) {
	return fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(uri)}`)
		.then(res => res.blob())
		.then(blob => {
			const a = Object.assign(document.createElement("a"), {
				style: { display: "none" },
				href: URL.createObjectURL(blob),
				download: uri.split("/")[uri.split("/").length - 1]
			});

			document.body.appendChild(a);
			a.click();

			window.URL.revokeObjectURL(a.href);
			a.remove();
		})
		.catch(err => (console.error(err), Toasts.showToast("Failed to save image!", "Failure")));
}

export function getRandomKey() { return Math.random().toString(36).substr(7); }

/**
 * Converts a number of bytes into a user-readable string.
 * Totally not stolen from stackoverflow and tweaked because I've written this exact function 50 times and still can't remember how to do it because fuck math.
 * @param bytes
 * @param decimals
 * @returns {string}
 */
export function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return "N/A";

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = [" bytes", "KB", "MB", "GB", "TB"];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return (bytes / Math.pow(k, i)).toFixed(dm).toLocaleString() + (sizes[i] ?? sizes[sizes.length - 1]);
}

export const ActionTypes = {
	UPDATE_ROUTE: "UPDATE_ROUTE",
	UPDATE_PAGE: "UPDATE_PAGE",
	UPDATE_QUERY: "UPDATE_QUERY",
	UPDATE_USER: "UPDATE_USER",
	UPDATE_LOCAL_USER: "UPDATE_LOCAL_USER",
	UPDATE_SETTINGS: "UPDATE_SETTINGS",
};