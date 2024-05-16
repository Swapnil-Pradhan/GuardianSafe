import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, onAuthStateChanged, sendEmailVerification, OAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqYBQjIrTxd-XTmIcPkpuMILCp2w8a-nU",
    authDomain: "guardiansaf3.firebaseapp.com",
    projectId: "guardiansaf3",
    storageBucket: "guardiansaf3.appspot.com",
    messagingSenderId: "118985195476",
    appId: "1:118985195476:web:e61f94222f059ecf9ca041",
    measurementId: "G-DWXPVT0EQ5"
}, app = initializeApp(firebaseConfig), auth = getAuth(), analytics = getAnalytics(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        if (user.emailVerified) {
            location.href = location.origin;
        } else {
            confirm(`If you want to keep this account, you'll need to verify this email address: ${user.email}. Do you want to continue?`) ? sendEmailVerification(auth.currentUser).then(() => alert("Email verification mail sent.")).catch(err => alert(err.code.substring(5))) : delAcc();
        }
    } else {
        sign.style.display = "flex";

        //MNC provider login
        document.querySelectorAll(".loginBtns > button").forEach((elm) => {
            elm.addEventListener("click", () => {
                const providers = {
                    google: new GoogleAuthProvider(),
                    microsoft: new OAuthProvider("microsoft.com"),
                    github: new GithubAuthProvider(),
                    yahoo: new OAuthProvider("yahoo.com")
                };

                signInWithPopup(auth, providers[elm.id]).then(() => alert(auth.currentUser.displayName + " signed in successfully.")).catch((err) => alert(err.code.substring(5)));
            });
        });

        //manual register
        document.getElementById("createUser").addEventListener("submit", event => {
            event.preventDefault();
            const formData = new FormData(event.target);
            if (!formData.getAll("new-password").every((value, _, arr) => value === arr[0] || value == null)) {
                if (confirm("Your passwords didn't match. Do want a password-less log in?")) {
                    emailLinkLogIn(formData.get("email"));
                } else {
                    alert("Please enter the same password in both fields.")
                    document.querySelectorAll("[name='new-password']").forEach(elm => elm.value = null);
                }
            } else {
                //sign in with email & pass
                createUserWithEmailAndPassword(auth, formData.get("email"), formData.get("new-password")).then(() => {
                    changeName(formData.get("name"), false);
                    alert("User created successfully.");
                }).catch(err => alert(err.code.substring(5)));
            }
        });

        //manual login
        document.getElementById("signInUser").addEventListener("submit", event => {
            event.preventDefault();
            const formData = new FormData(event.target);
            //sign in with email & pass
            signInWithEmailAndPassword(auth, formData.get("email"), formData.get("current-password")).then(() => {
                changeName(formData.get("name"), false);
                alert("User signed in successfully.");
            }).catch(err => {
                alert(err.code.substring(5));
                confirm("Want a password-less sign in?") ? emailLinkLogIn(formData.get("email")) : null;
            });
        });

        //sign in with email link
        function emailLinkLogIn(email) {
            sendSignInLinkToEmail(auth, email, {
                url: location.href,
                handleCodeInApp: true
            }).then(() => {
                localStorage.setItem("emailForSignIn", email);
                alert("Check your email for the sign in link.");
            }).catch(err => alert(err.code.substring(5)));
        }

        //check if sign in with email link
        if (isSignInWithEmailLink(auth, window.location.href)) {
            let email = localStorage.emailForSignIn, naa = localStorage.nameForSignIn;
            if (!email) {
                email = prompt("Looks like you're logging in with a different browser. Enter your email to confirm its you.");
                naa = prompt("Enter your name");
            }
            signInWithEmailLink(auth, email, window.location.href).then(() => {
                localStorage.removeItem("emailForSignIn");
                naa ? changeName(naa, true) : null;
                localStorage.removeItem("nameForSignIn");
                window.location.href = "index.html";
            }).catch(err => alert(err.code.substring(5)));
        }
        document.getElementById("resetPassMail").addEventListener("click", () => changePass(document.getElementById("tempmail").value));
    }
});

function delAcc() {
    deleteUser(auth.currentUser).then(() => {
        localStorage.clear();
        alert(`Your account is deleted from Gradians AI.`);
        history.go(0);
    }).catch((err) => alert(err.code.substring(5)));
}