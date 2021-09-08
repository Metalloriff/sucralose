import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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
    
    async get(...path) {
        const ref = doc(this.db, ...path);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) return null;
        
        return {
            _ref: ref,
            _snapshot: snapshot,
            id: snapshot.id,
            ...snapshot.data()
        };
    }
    
    serializeObject(obj) {
        const _new = { ...obj };
        
        delete _new._ref;
        delete _new._snapshot;
        delete _new.id;
        
        return _new;
    }
    
    async set(data, ...path) {
        return await setDoc(doc(this.db, ...path), this.serializeObject(data))
            .catch(e => console.error(`Error setting doc data at "${path.join("/")}"\n${e.stack}`));
    }
    
    async update(data, ...path) {
        // TODO writing on error is very unsafe. Don't do that.
        return await updateDoc(doc(this.db, ...path), this.serializeObject(data))
            .catch(() => this.set(data, ...path))
            .catch(e => console.error(`Error updating doc data at "${path.join("/")}"\n${e.stack}`));
    }
}