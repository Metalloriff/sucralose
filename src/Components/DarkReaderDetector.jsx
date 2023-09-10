import _ from "lodash";
import { useCallback, useEffect } from "react";
import { Modals } from "./Modals";

let hasShown = false;
export default function DarkReaderDetector() {
	const openDarkReaderNotice = useCallback(_.debounce(() => {
		if (hasShown) return;
		hasShown = true;

		Modals.push(
			<div
				className="BaseModal DarkReaderNoticeModal"
				style={{
					background: "var(--primary-bg)",
					padding: 20
				}}
			>
				<style>
					{"h1 { margin-top: 0; }"}
				</style>

				<h1>Dark reader detected!</h1>

				<p>
					This website is already respectful to your eyes, and Dark Reader may ruin the intended experience. Please disable dark reader on this site to see its intended design.
				</p>

				<h1>How?</h1>

				<p>
					Navigate to your extensions, and click the Dark Reader icon.
				</p>

				<img src="https://i.imgur.com/W6sxhj4.png" alt="1" />

				<p>
					Then press the site URI at the top-left, this will disable for only this website, keeping your eyes safe on other websites.
				</p>

				<img src="https://i.imgur.com/3ENgzRS.png" alt="2" />
			</div>
		)
	}, 200), []);

	const checkForDarkReader = useCallback(() => {
		const [html] = document.getElementsByTagName("html");

		if (Object.values(html.attributes).some(attr => attr.localName.startsWith("data-darkreader"))) {
			openDarkReaderNotice();
		}
	}, []);

	useEffect(() => {
		checkForDarkReader();

		const observer = new MutationObserver(() => {
			checkForDarkReader();
		});

		observer.observe(document.getElementsByTagName("html")[0], { attributes: true });
		return () => observer.disconnect();
	}, []);

	return null;
}