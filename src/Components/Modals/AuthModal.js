import React from "react";
import "./AuthModal.scss";
import * as Feather from "react-feather";
import { Modals } from "../Modals";
import Toasts from "../Toasts";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Database from "../../Classes/Database";
import { useEventListener } from "../../Classes/Hooks";

// TODO add password reset functionality.

export default function AuthModal() {
    const [signUpMode, setSignUpMode] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const ref = React.useRef();
    
    // Create an events object.
    const events = {
        handleSignUp: () => {
            if (busy) return;
            
            // Get the input fields.
            const [emailField, passwordField, confirmPasswordField] = ref.current.getElementsByTagName("input");
            
            // If the passwords don't match, throw an error to the user and return.
            if (confirmPasswordField.value !== passwordField.value)
                return Toasts.showToast("Passwords must match!", "Failure");
            // If the email doesn't exist, throw an error to the user and return.
            if (!emailField.value.trim())
                return Toasts.showToast("You must input an email address", "Failure");
            // If the password is empty, throw an error to the user and return.
            if (!passwordField.value.trim())
                return Toasts.showToast("You must input a password", "Failure");
            
            // Set the busy state so users don't spam the API.
            setBusy(true);
            
            // Create the user account.
            createUserWithEmailAndPassword(Database.auth, emailField.value, passwordField.value)
                // Then navigate to the settings.
                .then(() => (Modals.pop(), Toasts.showToast("Welcome to Sucralose!", "Success"), window.location.hash = "#settings"))
                // Catch any errors that may have occurred.
                .catch(e => {
                    Toasts.showToast("An unknown error has occured! Check console for details", "Failure");
                    console.error(e);
                });
        },
        handleLogIn: () => {
            if (busy) return;

            // Get the input fields.
            const [emailField, passwordField] = ref.current.getElementsByTagName("input");
            
            // Set the busy state so users don't spam the API.
            setBusy(true);
            
            // Attempt to log in.
            signInWithEmailAndPassword(Database.auth, emailField.value, passwordField.value)
                // Then reload the page because I'm lazy.
                .then(() => (Modals.pop(), window.location.reload()))
                // Catch any errors that may have occurred.
                .catch(e => {
                    let message = "Unknown";
                    
                    switch (e.code) {
                        case "auth/invalid-email":
                            message = "Invalid email address";
                            break;
                            
                        case "auth/user-not-found":
                            message = "No user with this email found";
                            break;
                            
                        case "auth/wrong-password":
                            message = "Incorrect password";
                            break;
                    }
                    
                    Toasts.showToast(`Failed to sign in! Reason - ${message}`, "Failure", 10);
                    console.error(e);
                });
        }
    };
    
    useEventListener(
        "keydown",
        e => e.key === "Enter" && (signUpMode ? events.handleSignUp() : events.handleLogIn())
    );
    
    return (
        <div className="AuthModal" ref={ref}>
            <Feather.X className="CloseButton" onClick={Modals.pop.bind(Modals)}/>
            
            { signUpMode ? (
                <React.Fragment>
                    <div className="MainSection Flex">
                        <div className="HelpSection">
                            <div className="Title">NOTE</div>

                            <div>
                                This is not your e621.net details.<br/>
                                You will have the option to enter<br/>
                                your e621.net username and API key<br/>
                                in your settings after signing up.<br/>
                            </div>
                        </div>
                        
                        <div className="Fields">
                            <h3>Sign Up</h3>

                            <div className="FieldContainer">
                                <input type="email" placeholder="Email Address"/>
                            </div>

                            <div className="FieldContainer">
                                <input type="password" placeholder="Password"/>
                            </div>

                            <div className="FieldContainer">
                                <input type="password" placeholder="Confirm Password"/>
                            </div>
                        </div>
                    </div>

                    <div className="FooterSection Flex">
                        <div className="Button" onClick={() => setSignUpMode(false)}>
                            <Feather.LogIn/>
                            <div>Log In</div>
                        </div>

                        <div className="Button" style={{ marginLeft: "auto" }} onClick={events.handleSignUp}>
                            <Feather.UserCheck/>
                            <div>Sign Up</div>
                        </div>
                    </div>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div className="MainSection Flex">
                        <div className="HelpSection">
                            <div className="Title">Why?</div>

                            <div>
                                Having an account ensures that your data<br/>
                                stays consistent across browsers and devices,<br/>
                                along with giving you access to useful features,<br/>
                                without the security risks of storing data on your device.<br/>
                            </div>
                        </div>
                        
                        <div className="Fields">
                            <h3>Login</h3>
                            
                            <div className="FieldContainer">
                                <input type="email" placeholder="Email Address"/>
                            </div>

                            <div className="FieldContainer">
                                <input type="password" placeholder="Password"/>
                            </div>
                        </div>
                    </div>
                    
                    <div className="FooterSection Flex">
                        <div className="Button" onClick={() => setSignUpMode(true)}>
                            <Feather.UserPlus/>
                            <div>Sign Up</div>
                        </div>
                        
                        <div className="Button" style={{ marginLeft: "auto" }}>
                            <Feather.Key/>
                            <div>Reset Password</div>
                        </div>
                        
                        <div className="Button" onClick={events.handleLogIn}>
                            <Feather.LogIn/>
                            <div>Log In</div>
                        </div>
                    </div>
                </React.Fragment>
            ) }
        </div>
    )
}