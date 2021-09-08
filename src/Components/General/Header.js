import React from "react";
import "./Header.scss";
import SearchField from "./SearchField";
import { NavigationButtonsComponent } from "../../Pages/Home";

export default function Header({
    searchPlaceholder = null,
    hasSearch = true
}) {
    return (
        <div className="Header">
            <div>
                { hasSearch && <SearchField placeholder={searchPlaceholder}/> }
                
                <NavigationButtonsComponent className="NavigationButtons"
                                            tooltipMode/>
            </div>
        </div>
    )
}