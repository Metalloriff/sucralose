import React from "react";
import App from "../App";

/**
 * A setInterval hook for React components.
 * @param callback The function to call for the interval.
 * @param delay The delay between each call.
 * @param callInstantly Whether or not the callback will call instantly upon registering the hook.
 * @param deps The dependencies array for the hook.
 */
export function useInterval(callback, delay, callInstantly = false, deps = []) {
    // Create side effect
    React.useEffect(() => {
        // Create interval based on delay
        const interval = setInterval(callback, delay);
        // If call instantly is truthy, run the callback
        callInstantly && callback();

        // On unmount, clear the interval
        return () => clearInterval(interval);
    }, deps);
}

export function useMounted() {
    const state = React.createRef(false);

    React.useEffect(() => {
        state.current = true;

        return () => state.current = false;
    }, []);

    return state;
}

const promiseCache = {};
export function usePromise(promise, useCache = true, deps = []) {
    const [value, setValue] = React.useState(useCache ? promiseCache[promise] : null);
    const isMounted = useMounted();

    React.useEffect(() => {
        !value && promise().then(v => (isMounted.current && setValue(v), promiseCache[promise] = v));
    }, deps);

    return value;
}

export function useEventListener(eventType, callback, options = {}) {
    const {
        target = document,
        dependencies = [],
        init = false
    } = options;

    React.useEffect(() => {
        target.addEventListener(eventType, callback);
        init && callback();

        return () => target.removeEventListener(eventType, callback);
    }, dependencies);
}

export function useOnMount(callback) {
    React.useEffect(() => {
        callback();
    }, []);
}

export function useOnUnmount(callback) {
    React.useEffect(() => {
        return callback;
    }, []);
}

// Sucralose-specific hooks

