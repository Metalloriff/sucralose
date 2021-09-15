import React from "react";
import "./SwitchItem.scss";

export default function SwitchItem({ title, defaultValue, callback }) {
    return (
        <div className="SwitchItem">
            <h3 style={{ margin: 0 }}>{title}</h3>
            
            <input className="Switch"
                   type="checkbox"
                   defaultChecked={defaultValue}
                   onInput={e => callback?.(e.currentTarget.checked)}/>
        </div>
    );
}