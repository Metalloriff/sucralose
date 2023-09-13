import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { AlertCircle, CheckCircle, HelpCircle, Info, XCircle } from "react-feather/dist";
import { ActionTypes, joinClassNames } from "../Classes/Constants";
import { dispatcher } from "../Classes/Dispatcher";
import ToastsStore from "../Classes/Stores/ToastsStore";
import Timer from "../Classes/TimerClass";
import "./Toasts.scss";

export const ToastType = {
	Default: {
		icon: <Info />,
		color: "#5b86c3"
	},
	Success: {
		icon: <CheckCircle />,
		color: "#5bc386"
	},
	Failure: {
		icon: <XCircle />,
		color: "#ff5353"
	},
	Error: {
		icon: <XCircle />,
		color: "#ff5353"
	},
	Warning: {
		icon: <AlertCircle style={{ strokeWidth: 3 }} />,
		color: "#d3c051"
	},
	Help: {
		icon: <HelpCircle />,
		color: "var(--cf-purple)"
	}
};

export function Toast({ id, children, type = ToastType.Default, life, remove, callback, color, fixedTime = false, style = {}, onMount = null }) {
	// Handle deprecated string type
	if (typeof (type) === "string") {
		type = ToastType[type];
	}

	const [closing, setClosing] = useState(false);
	const timer = useMemo(() => new Timer(() => {
		setClosing(true);

		setTimeout(remove, 500);
	}, life * 1000, false), [id, remove]);
	const progressBar = useRef();

	const handleMouseEnter = useCallback(() => {
		timer.pause();
		// @ts-ignore
		progressBar.current.style.animationPlayState = "paused";
	}, [timer]);

	const handleMouseLeave = useCallback(() => {
		timer.resume();
		// @ts-ignore
		progressBar.current.style.animationPlayState = "running";
	}, [timer]);

	useEffect(() => {
		const handleFocus = () => !fixedTime && handleMouseLeave();
		const handleBlur = () => !fixedTime && handleMouseEnter();

		window.addEventListener("focus", handleFocus);
		window.addEventListener("blur", handleBlur);

		(fixedTime || document.hasFocus()) && handleMouseLeave();

		onMount?.();

		return () => {
			window.removeEventListener("focus", handleFocus);
			window.removeEventListener("blur", handleBlur);

			timer.destroy();
		};
	}, []);

	return (
		<div className={joinClassNames("Toast", [closing, "Closing"])}
			onMouseEnter={fixedTime ? null : handleMouseEnter}
			onMouseLeave={fixedTime ? null : handleMouseLeave}
			onClick={e => { callback?.(e); timer.end(); }}
			style={{
				cursor: callback ? "pointer" : null,
				backgroundColor: color ?? type?.color,
				...style
			}}>
			{type?.icon && (
				<div className="Icon">
					{type?.icon}
				</div>
			)}

			<div className="Contents">
				{children}
			</div>

			<div className="ProgressBarContainer">
				<div ref={progressBar} className="ProgressBar" style={{ animationDuration: life + "s" }} />
			</div>
		</div>
	);
}

export default function Toasts() {
	const ref = useRef(null);
	const queue = ToastsStore.useState(() => ToastsStore.queue);
	const [, forceUpdate] = useReducer(x => x + 1, 0);

	const getBottomOffset = useCallback(index => {
		if (!ref) return 0;

		const toasts = [...ref.current.getElementsByClassName("Toast")];
		let offset = 0;

		for (let i = 0; i < index; i++) {
			const toastHeight = toasts[i]?.offsetHeight ?? 0;
			offset += toastHeight + 7;
		}

		return offset;
	}, [ref]);

	return (
		<div className="ToastsContainer Bottom Left" ref={ref}>
			{queue.map((toast, index) => (
				<Toast
					key={toast.key}
					id={toast.key}
					style={{
						bottom: getBottomOffset(index)
					}}
					{...toast}
					onMount={forceUpdate}
				/>
			))}

			<div
				className={joinClassNames("ClearButton", [!!queue?.length, "Visible"])}
				onClick={() => dispatcher.dispatch({ type: ActionTypes.CLEAR_TOASTS })}
			>
				Close All
			</div>
		</div>
	);
}

Toasts.showToast = (children, toastType = ToastType.Default, life = 5, options = {}) => dispatcher.dispatch({
	type: ActionTypes.QUEUE_TOAST,
	children, toastType, life, options
});