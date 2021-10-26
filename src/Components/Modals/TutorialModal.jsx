import React from "react";
import "./TutorialModal.scss";
import * as Feather from "react-feather";
import { Modals } from "../Modals";

export default function TutorialModal({ children, title = "Help" }) {
    return (
        <div className="TutorialModal">
            <div className="ModalHeader">
                <h2>{title}</h2>
                
                <Feather.X onClick={Modals.pop.bind(Modals)}/>
            </div>
            
            <div className="ModalBody">
                { children }
            </div>
        </div>
    );
}