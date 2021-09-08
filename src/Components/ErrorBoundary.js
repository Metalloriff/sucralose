import React from "react";
import "./ErrorBoundary.scss";
import { closeModal, openModal } from "./Modals";

export default class ErrorBoundary extends React.Component {
    state = { error: null, errorInfo: null, moreInfo: false };
    
    constructor(props) {
        super(props);
    }
    
    componentDidCatch(error, errorInfo) {
        // console.error(error, errorInfo);
        
        this.setState({ error, errorInfo });
    }
    
    showErrorInfo() {
        const { error, errorInfo } = this.state;
        
        openModal(
            <div className="ErrorInfoModal PrimaryBg" onClick={() => closeModal()}>
                <h1>{error.message}</h1>
                { errorInfo.componentStack.split("\n").slice(0, 10).map((msg, i) => <h2 key={i}>{msg}</h2>) }
            </div>
        );
    }
    
    renderError() {
        const { moreInfo } = this.state;
        
        return (
            <div className="ErrorBoundaryHandler">
                <h1>There was an error with this component!</h1>
                <h2>This is due to a plugin error or application error.</h2>
                
                <div className="ErrorBoundaryFooter">
                    <div className="ErrorBoundaryButton TertiaryBg" onClick={() => this.showErrorInfo()}>More Info</div>
                    <div className="ErrorBoundaryButton BackgroundDanger" onClick={() => this.setState({ error: null })}>Retry</div>
                </div>
            </div>
        );
    }

    render() {
        if (this.state.error)
            return this.renderError();
        
        return this.props.children;
    }
}