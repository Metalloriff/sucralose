import React from "react";
import * as Feather from "react-feather";
import { Loader } from "react-feather";
import { ActionTypes, getRandomKey, joinClassNames } from "../Classes/Constants";
import { dispatcher } from "../Classes/Dispatcher";
import { useEventListener, useOnUnmount } from "../Classes/Hooks";
import QueryManager from "../Classes/QueryManager";
import ErrorBoundary from "./ErrorBoundary";
import InlineLoading from "./InlineLoading";
import LinkWrapper from "./LinkWrapper";
import "./Modals.scss";
import Toasts from "./Toasts";
import Tooltip from "./Tooltip";

/**
 * Pushes a component to the modal stack.
 * @deprecated Use Modals.push(modal) instead.
 * @param modal The React component modal.
 */
export function openModal(modal) {
	Modals.push(modal);
}

/**
 * Close the last modal in the stack.
 * @deprecated Use Modals.pop() instead.
 */
export function closeModal() {
	Modals.pop().catch(console.error.bind(console, "Failed to pop modal!"));
}

/**
 * Copies the specified text to the clipboard
 * @param text The text to copy.
 * @returns {Promise<void>}
 */
export async function copyToClipboard(text) {
	try {
		await window.navigator.clipboard.writeText(text);

		Toasts.showToast(<span><b>{text.length >= 100 ? text.substr(0, 100) + "..." : text}</b> copied to clipboard</span>, "Success");
	}
	catch (e) {
		openStringModal({
			title: "Failed To Copy",
			description: "Your browser does not support copying to clipboard, you can manually copy here.",
			value: text
		});
	}
}

function ImageComponent({ image, setLoaded, setFailed, className, onClick, isPreview = false }) {
	const ref = React.useRef();
	const [loaded, _setLoaded] = React.useState(false);

	const events = {
		onLoad: () => (setLoaded?.(true), setFailed?.(false), _setLoaded(true)),
		onError: () => (setLoaded?.(true), setFailed?.(true), _setLoaded(true)),
		onClick
	};

	useOnUnmount(() => {
		if (ref.current) {
			ref.current.pause();
		}
	});

	if (!image) return null;

	return /\.webm$/.test(image.full) && !isPreview
		? <video
			ref={ref}
			src={image.full}
			controls={!className}
			loop
			muted
			autoPlay={!isPreview}
			className={className}
			{...events}
		/> : (
			<>
				<img src={image.preview} alt="Preview failed to load"
					style={{ display: loaded && !className ? "none" : null }} className={className} />

				{!className && !isPreview && <img src={image.full} alt="Image failed to load" className={className}
					style={{ display: loaded ? null : "none" }} {...events} />}

				{!isPreview && !loaded && (
					<div className="LoadingIndicator FlexCenter">
						<Loader className="Spinner" />
					</div>
				)}
			</>
		);
}

export function ImageModal({ url, getSources, buttons }) {
	// Get the sources or create a single-item array
	const sources = typeof (getSources) === "function" ? getSources().filter(u => u) : [url];

	const ref = React.useRef();
	const container = React.useRef();

	// Create a state based on the index of the current url
	const [index, _setIndex] = React.useState(sources.findIndex(f => f.full === url));
	function setIndex(index) {
		// We don't talk about this in my job interview.
		document.querySelector(`[src="${sources[index].preview}"]`)?.scrollIntoView();

		_setIndex(index);
	}

	// Handle the modal state query.
	const modalStateQuery = QueryManager.useState(() => QueryManager.get("modalState"));
	const [modalState, setModalState] = React.useState(false);

	// Handle the modal state.
	React.useEffect(() => {
		if (modalStateQuery !== "open") {
			if (!modalState) {
				setModalState(true);

				QueryManager.set("modalState", "open");
			}
			else {
				Modals.pop();
			}
		}
	}, [modalStateQuery]);

	// Handle the history state.
	React.useEffect(() => {
		return () => {
			setTimeout(() => {
				if (QueryManager.get("modalState") === "open") {
					window.history.back();

					dispatcher.dispatch({
						type: ActionTypes.UPDATE_PAGE
					});
				}
			}, 0);
		};
	}, []);

	React.useEffect(() => {
		container && container.current.style.setProperty("--translation", "0");
	}, [container, index]);

	// Create a navigate function to handle safely navigating images
	const nav = dir =>
		sources[index + dir]
			? (setLoaded(false), setFailed(false), setIndex(index + dir))
			: Toasts.showToast("No more images in this direction!", "Failure");
	// Create an expanded state based on the serialized settings state
	const [expanded, setExpandedState] = React.useState(true);

	// These are placeholders, I'm too lazy to add them
	const [loaded, setLoaded] = React.useState(false);
	const [failed, setFailed] = React.useState(false);

	// Handle keyboard navigation/controls.
	useEventListener("keydown", ({ key }) => {
		switch (key) {
			case "Escape": return Modals.pop();
			case "ArrowLeft": case "a": return nav(-1);
			case "ArrowRight": case "d": return nav(1);
			// This is bad practice. Don't do this.
			case "ArrowUp": case "w": return window.currentModalEvents?.vote(1);
			case "ArrowDown": case "s": return window.currentModalEvents?.vote(-1);
			case "f": return window.currentModalEvents?.favorite();
		}
	}, { dependencies: [index] });

	// Handle touch controls
	const mobileEvents = {
		onTouchStart: e => {
			const tapX = e.touches[0].clientX;
			const tapY = e.touches[0].clientY;

			let translation = 0;

			const handler = e => {
				const alias = 50;
				translation = e.touches[0].clientX - tapX;

				if (Math.abs(translation) < alias) return;
				if (translation < 0) translation += alias;
				else translation -= alias;

				translation /= window.innerWidth;
				translation *= 100;

				container.current.style.setProperty(
					"--translation",
					translation
				);
			};

			document.addEventListener("touchmove", handler);

			let remove;
			document.addEventListener("touchend", remove = () => {
				setTimeout(() => {
					const translation = parseFloat(container.current.style.getPropertyValue("--translation"));
					container.current.style.setProperty(
						"--translation",
						translation > 5
							? "100"
							: translation < -5
								? "-100"
								: "0"
					);

					document.removeEventListener("touchmove", handler);
					document.removeEventListener("touchend", remove);

					setTimeout(() => {
						if (!container.current) return;

						const translation = parseFloat(container.current.style.getPropertyValue("--translation"));
						if (translation >= 75) {
							nav(-1);
						}
						else if (translation <= -75) {
							nav(1);
						}
					}, 200);
				}, 100);
			});
		}
	};

	// Render bender
	return (
		<div ref={container} className="ImageModal" onClick={e => e.target === e.currentTarget && Modals.pop()} {...mobileEvents}>
			<div className={joinClassNames("ImageContainer", [expanded, "Expanded"])}>
				<ImageComponent
					key={getRandomKey()}
					image={sources[index - 1]}
					setLoaded={setLoaded}
					setFailed={setFailed}

					className="Previous"
					onClick={() => nav(-1)}
					isPreview
				/>

				<ImageComponent
					key={getRandomKey()}
					image={sources[index]}
					setLoaded={setLoaded}
					setFailed={setFailed}
				/>

				<ImageComponent
					key={getRandomKey()}
					image={sources[index + 1]}
					setLoaded={setLoaded}
					setFailed={setFailed}

					className="Next"
					onClick={() => nav(1)}
					isPreview
				/>
			</div>

			<div className="Footer">
				<div className={joinClassNames("Button Arrow Left",
					[!sources.length || !index, "Disabled"])} onClick={() => nav(-1)}>
					<Feather.ChevronLeft />
					<Tooltip>Previous Image</Tooltip>
				</div>

				<div className="Divider" />

				{buttons?.(index) ?? (
					<>
						<div className="Button" onClick={() => (setExpandedState(!expanded))}>
							{expanded ? <Feather.Minimize /> : <Feather.Maximize />}
							<Tooltip>{expanded ? "Compress" : "Expand"}</Tooltip>
						</div>

						<div className="Button">
							<Feather.Clipboard />
							<Tooltip>Copy URL</Tooltip>
						</div>

						<LinkWrapper className="Button" style={{ display: "block", color: "white" }}
							href={sources[index].full}>
							<Feather.ExternalLink />
							<Tooltip>Open In New Tab</Tooltip>
						</LinkWrapper>
					</>
				)}

				<div className="Divider" />

				<div className={joinClassNames("Button Arrow Right",
					[!sources.length || index + 1 >= sources.length, "Disabled"])} onClick={() => nav(1)}>
					<Feather.ChevronRight />
					<Tooltip>Next Image</Tooltip>
				</div>
			</div>
		</div>
	);
}

/**
 * Pushes an image modal to the modal stack.
 * @param url The URI for the image to focus.
 * @param getSources? An option callback function that returns an array of URIs.
 */
export function openImageModal(url, getSources = null, options = {}) {
	Modals.push(<ImageModal url={url} getSources={getSources} {...options} />);
}

/**
 * Displays a two-choice modal to the user.
 * @param title
 * @param description
 * @param yesText
 * @param noText
 * @param yesColor
 * @param noColor
 * @returns {Promise<boolean>}
 */
export async function openBoolModal({
	title = "",
	description = "",
	yesText = "Yes",
	noText = "No",
	yesColor = "#ff6666",
	noColor = ""
}) {
	const response = await new Promise(resolve => {
		Modals.push(
			<div className="BoolModal PrimaryBg">
				<div className="Title" dangerouslySetInnerHTML={{ __html: title }} />
				<div className="Description" dangerouslySetInnerHTML={{ __html: description }} />

				<div className="Footer">
					<div className="Button TertiaryBg" onClick={() => resolve(false)} style={{ backgroundColor: noColor }}>{noText}</div>
					<div className="Button TertiaryBg" onClick={() => resolve(true)} style={{ backgroundColor: yesColor }}>{yesText}</div>
				</div>
			</div>
		);
	});

	Modals.pop();

	return response;
}

/**
 * Displays a string choice modal to the user.
 * @param options
 * @returns {Promise<string | null>}
 */
export async function openStringModal(options = {}) {
	const { async = false } = options;

	const response = await new Promise(resolve => {
		Modals.push(
			<StringModal resolve={resolve} {...options} />
		);
	});

	!async && Modals.pop();

	return response;
}

export class Modals extends React.Component {
	static instance;

	/**
	 * Pushes a component to the modal stack.
	 * @param modal The React component modal.
	 */
	static push(modal) {
		this.instance.setState({ stack: [...this.instance.state.stack, modal] });
	}

	/**
	 * Closes the last modal in the stack.
	 * @returns {Promise<void>}
	 */
	static async pop() {
		// Destructure the instance state
		const { stack, closing } = this.instance.state;
		const modal = stack[stack.length - 1];

		// If there is nothing to close, return
		if (!stack.length || !modal) return;

		// Push the modal to the closing state, activating the transition
		this.instance.setState({ closing: [...closing, modal] });

		// Wait for the transition
		await new Promise(r => setTimeout(r, 150));

		// Set the new state, removing the modal from both stack states
		this.instance.setState({
			stack: this.instance.state.stack.filter(m => m !== modal),
			closing: this.instance.state.closing.filter(m => m !== modal)
		});
	}

	state = { stack: [], closing: [] };

	componentDidMount() {
		// Assign the static instance variable
		Modals.instance = this;
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		document.documentElement.style.overflowY = this.state.stack.length ? "hidden" : null;
		document.documentElement.style.marginRight = this.state.stack.length ? "5px" : null;
	}

	handleBackdropClick(e) {
		// Ensure that we're actually clicking the modal background
		if (e.target !== e.currentTarget) return;

		// If the modal has an on backdrop click prop, run it and return
		const { stack } = this.state;
		if (stack[stack.length - 1] && typeof (stack[stack.length - 1].props?.onBackdropClick) === "function")
			return stack[stack.length - 1].props.onBackdropClick();

		// K I L L
		Modals.pop().catch(console.error.bind(console, "Failed to pop modal!"));
	}

	render() {
		const { stack, closing } = this.state;

		return (
			<div className={"ModalStack" + (stack.length > closing.length ? " Active" : "")}>
				{stack.map((modal, id) => (
					<ErrorBoundary>
						<div className={"ModalContainer" +
							(~closing.indexOf(modal) || id < stack.length - 1 ? " Closing" : "")}
							key={id}
							onMouseDown={this.handleBackdropClick.bind(this)}
							style={{ zIndex: id * 10 }}>{modal}</div>
					</ErrorBoundary>
				))}
			</div>
		);
	}
}

export function StringModal(props) {
	const { title = "", description = "", yesText = "Confirm", noText = "Cancel", yesColor = "", noColor = "", value = "", onChange = null, rich = false, resolve, id } = props;
	const [no, setNoState] = React.useState(false);
	const [yes, setYesState] = React.useState(false);

	return (
		<div className="StringModal PrimaryBg">
			<div className="Title" dangerouslySetInnerHTML={{ __html: title }} />
			<div className="Description" dangerouslySetInnerHTML={{ __html: description }} />

			<input id={id} className="Field TertiaryBg" defaultValue={value} onChange={onChange} />

			<div className="Footer">
				<div className="Button TertiaryBg" onClick={() => (resolve(null), setNoState(true))} style={{ backgroundColor: noColor }}>{no ? <InlineLoading /> : noText}</div>
				<div className="Button TertiaryBg" onClick={() => (resolve(document.getElementById(id).value), setYesState(true))} style={{ backgroundColor: yesColor }}>{yes ? <InlineLoading /> : yesText}</div>
			</div>
		</div>
	);
}