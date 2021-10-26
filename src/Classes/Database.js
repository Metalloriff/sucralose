import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, DocumentReference, getDoc, getDocs, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import _ from "lodash";
import React from "react";

const config = {
	apiKey: "AIzaSyDmojC5Kl5vtST4vIyW81UfCrR6B18HnKw",
	authDomain: "sucralose-74a13.firebaseapp.com",
	projectId: "sucralose-74a13",
	storageBucket: "sucralose-74a13.appspot.com",
	messagingSenderId: "43887129209",
	appId: "1:43887129209:web:7d607e00a979144af85aa8"
};


// Long story short, I fucking hate the new Firebase API. (V9)
// This is my attempt at at least making it tolerable.
export default new class Database {
	app = initializeApp(config);
	auth = getAuth();
	db = getFirestore();
	storage = getStorage();
	storageCache = {};

	constructor() {
		Object.freeze(this);
	}

	doc(...path) { return doc(this.db, path.join("/")); }
	collection(...path) { return collection(this.db, path.join("/")); }

	formatDocument(ref, snapshot) {
		return snapshot ? {
			_ref: ref,
			_snapshot: snapshot,
			id: snapshot.id,
			...snapshot.data()
		} : null;
	}

	async getDoc(ref) {
		const snapshot = await getDoc(ref);
		if (!snapshot.exists()) return null;

		return this.formatDocument(ref, snapshot);
	}

	async getDocs(ref) {
		const snapshot = await getDocs(ref);

		return snapshot.docs.map(
			doc => (
				this.formatDocument(doc.ref, doc)
			)
		);
	}

	createSnapshotListener(ref, callback, options = {}) {
		let { onReady, processor } = options;

		const unbind = onSnapshot(ref, async _snapshot => {
			let snapshot = ref instanceof DocumentReference
				? this.formatDocument(ref, _snapshot)
				: {
					changes: _snapshot.docChanges().map(change => ({
						...change,
						data: this.formatDocument(change.doc.ref, change.doc)
					})),
					items: _snapshot.docs.map(doc => this.formatDocument(doc.ref, doc))
				};

			if (snapshot) {
				snapshot._unbindListener = unbind;

				if (typeof (processor) === "function") {
					if (Array.isArray(snapshot.items)) {
						for (let i = 0; i < snapshot.items.length; i++) {
							snapshot.items[i] = await processor(snapshot.items[i]);
						}
					}
					else snapshot = await processor(snapshot);
				}
			}

			callback(snapshot);

			onReady?.(snapshot);
			onReady = null;
		}, console.error.bind(null, `Error in snapshot listener at "${ref.path ?? ref._query.path}"!`));

		return unbind;
	}

	get useSnapshot() {
		return (ref, options = {}) => {
			const { processor } = options;
			const [data, setData] = React.useState(undefined);

			React.useEffect(() => {
				return this.createSnapshotListener(ref, async data => {
					if (typeof (processor) !== "function") return setData(data);

					if (Array.isArray(data.items)) {
						for (const i in data.items) {
							data.items[i] = await processor(data.items[i]);
						}
					}
					else data = await processor(data);

					setData(data);
				}, options);
			}, []);

			return data;
		};
	}

	serializeObject(obj) {
		return _.omit({ ...obj }, [
			"_ref",
			"_snapshot",
			"_unbindListener",
			"id",
			"firebaseSerialized"
		]);
	}

	async set(ref, data) {
		return await setDoc(ref, this.serializeObject(data))
			.catch(console.error.bind(null, `Error setting doc data at "${ref.path}"!`));
	}

	async addDoc(ref, data) {
		return await addDoc(ref, this.serializeObject(data))
			.catch(console.error.bind(null, `Error adding doc data at "${ref.path}"!`));
	}

	async delete(ref) {
		return await deleteDoc(ref)
			.catch(console.error.bind(null, `Error deleting doc at "${ref.path}"!`));
	}

	async update(ref, data) {
		return await updateDoc(ref, this.serializeObject(data))
			// .catch(() => this.set(ref, data))
			.catch(console.error.bind(null, `Error updating doc data at "${ref.path}"!`));
	}

	// Storage
	async getStorageUrl(...pathSegments) {
		const path = pathSegments.join("/");
		// if (this.storageCache[path]) return this.storageCache[path];

		const ref = storageRef(this.storage, path);
		const url = await getDownloadURL(ref);

		return this.storageCache[path] = url;
	}

	uploadStorage(file, ...pathSegments) {
		const path = pathSegments.join("/");
		const ref = storageRef(this.storage, path);

		return uploadBytes(ref, file).then(async result => ({
			result,
			url: await this.getStorageUrl(...pathSegments)
		}));
	}
}