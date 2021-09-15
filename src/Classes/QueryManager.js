function fromEntries(entries) {
    const obj = { };
    
    for (const [key, value] of entries) {
        obj[key] = value;
    }
    
    return obj;
}

export default new class QueryManager {
    get query() {
        return fromEntries(
            new URLSearchParams(window.location.search)
        );
    }
    
    get(key, def = null) {
        return this.query[key] ?? def;
    }
    
    set(key, value, options = {}) {
        const {
            pushHistory = true
        } = options;
        
        const query = new URLSearchParams(window.location.search);
        value === null ? query.delete(key) : query.set(key, value);
        
        const url = window.location.href.replace(
            window.location.search,
            "?" + query.toString()
        );

        window.history[pushHistory ? "pushState" : "replaceState"]({ }, null, url);
        window.dispatchEvent(new Event("popstate"));
    }
}