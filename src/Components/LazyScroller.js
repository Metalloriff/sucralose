import React from "react";
import "./LazyScroller.scss";
import { joinClassNames } from "../Classes/Constants";
import EventListener from "../Classes/EventListener";

export const lazyScrollerEvents = new EventListener();

export default function({ children, className = null }) {
    const ref = React.useRef();
    
    const handleScroll = () => {
        if (!ref.current)
            return;
        
        const domChildren = ref.current.childNodes;
        
        for (let i = 0; i < domChildren.length; i++) {
            const el = domChildren[i];
            const rect = el.getBoundingClientRect();
            const isInView = rect.top >= 0 && rect.bottom <= window.innerHeight
                || rect.top < window.innerHeight && rect.bottom >= 0
                || ref.current.scrollHeight > ref.current.clientHeight;
            
            if (isInView && !el.classList.contains("LazyRendered"))
                el.classList.add("LazyRendered");
            if (!isInView && el.classList.contains("LazyRendered"))
                el.classList.remove("LazyRendered");
        }
    };
    
    React.useEffect(() => {
        handleScroll();
        lazyScrollerEvents.subscribe("update", handleScroll);
        
        setTimeout(handleScroll, 250);
        
        return () => lazyScrollerEvents.unsubscribe("update", handleScroll);
    }, [children])
    
    return (
        <div className={joinClassNames(className, "LazyScroller")} onScroll={handleScroll} ref={ref}>
            { children }
        </div>
    );
}