import { ToastType } from "../../Components/Toasts";
import { ActionTypes, getRandomKey } from "../Constants";
import { dispatcher } from "../Dispatcher";
import Store from "../Store";

const ToastsStoreClass = class ToastsStore extends Store {
	queue = [];
}

const ToastsStore = new ToastsStoreClass(dispatcher, {
	[ActionTypes.QUEUE_TOAST]: ({ children, toastType = ToastType.Default, life = 5, options = {} }) => {
		const { callback = null, color = null, fixedTime = false, id = getRandomKey() } = options;

		ToastsStore.queue = [
			{
				key: id,
				type: toastType,
				life, color, fixedTime, callback, children,
				remove: () => {
					dispatcher.dispatch({
						type: ActionTypes.REMOVE_TOAST,
						id
					});
				}
			},
			...ToastsStore.queue
		];
	},
	[ActionTypes.REMOVE_TOAST]: ({ id }) => {
		ToastsStore.queue = ToastsStore.queue.filter(toast => toast.key !== id);
	},
	[ActionTypes.CLEAR_TOASTS]: ({ id }) => {
		ToastsStore.queue = [];
	}
});

export default ToastsStore;