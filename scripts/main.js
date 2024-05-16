import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-analytics.js";
import { getStorage, ref } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-storage.js";
import { getFirestore, collection, onSnapshot, setDoc, doc, getDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, sendPasswordResetEmail, deleteUser } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDqYBQjIrTxd-XTmIcPkpuMILCp2w8a-nU",
    authDomain: "guardiansaf3.firebaseapp.com",
    projectId: "guardiansaf3",
    storageBucket: "guardiansaf3.appspot.com",
    messagingSenderId: "118985195476",
    appId: "1:118985195476:web:e61f94222f059ecf9ca041",
    measurementId: "G-DWXPVT0EQ5"
}, app = initializeApp(firebaseConfig), auth = getAuth(), analytics = getAnalytics(app), db = getFirestore(app), storage = getStorage();

onAuthStateChanged(auth, async user => {
    if (user && user.emailVerified) {
        document.getElementById("userEmail").innerHTML = user.email;
        const userRef = doc(db, "userData", user.uid), emergency = collection(db, "Emergency"), emergence = document.getElementById("emergency"), allSafe = document.getElementById("allSafe"), piAdd = document.getElementById("addPi"), deleteAcc = document.getElementById("deleteAcc");

        //change pass
        document.getElementById("changePass").addEventListener("click", () => confirm("Do you want to change pasword of " + user.email) ? sendPasswordResetEmail(auth, user.email).then(() => {
            alert(`Password reset mail sent to ${user.email}`);
            auth.signOut().then(() => alert("Sign in here again after changing your password.")).catch((err) => alert(err.code.substring(5)));
        }).catch(err => alert(err.code.substring(5))) : null);

        //sign out
        document.getElementById("signOut").onclick = () => confirm(`Do you want to sign out of ${auth.currentUser.email}`) ? auth.signOut().then(() => {
            alert("You're signed out of GuardianSafe successfully.");
            localStorage.clear();
            history.go(0);
        }).catch((err) => alert(err.code.substring(5))) : null;

        //delete Acc
        deleteAcc.onclick = () => confirm("Do want to delete " + user.email) ? deleteUser(auth.currentUser).then(() => {
            localStorage.clear();
            alert(`Your account is deleted from Gradians AI.`);
            history.go(0);
        }).catch((err) => alert(err.code.substring(5))) : null;

        function addPi(para) {
            setDoc(userRef, {
                Raspi: prompt("Add your Raspberry Pi serial No. (comma separated)", para).split(",")
            });
        }

        function theme(bool) {
            const root = document.documentElement.style, status = document.getElementById("statusTxt"), icon = document.getElementById("icon");
            if (bool) {
                const properties = {
                    "--primary-bg": "#032f05",
                    "--secondary-bg": "#0e2b2b",
                    "--tertiary-bg": "mediumspringgreen",
                    "--text": "#d4fbd6",
                    "--anime": "pulse  1.69s ease-in-out infinite alternate"
                };
                Object.keys(properties).forEach(property => root.setProperty(property, properties[property]));
                status.innerHTML = "No one is in danger.";
                allSafe.classList.add("scale0");
                icon.href = "logos\GuardianSafe.svg"
            } else {
                const properties = {
                    "--primary-bg": "#380611",
                    "--secondary-bg": "#250000",
                    "--tertiary-bg": "crimson",
                    "--text": "#ffd7c8",
                    "--anime": "vibrate 2s cubic-bezier(.36, .07, .19, .97) infinite alternate"
                };
                Object.keys(properties).forEach(property => root.setProperty(property, properties[property]));
                status.innerHTML = "Save them ASAP!";
                allSafe.classList.remove("scale0");
                icon.href = "logos\GuardianSafe_red.svg"
            }
        }

        function addElm(x, y, z, id) {
            const dynamicData = x.data(), staticData = y.data(), fieldset = document.createElement("fieldset");
            ["details", "container"].forEach(className => fieldset.classList.add(className));
            fieldset.id = id;
            fieldset.style.animationDelay = 0.1 * z + "s";
            fieldset.innerHTML = `<legend>
                            <h1>${staticData.Name}</h1>
                          </legend>
                          <div>
                            <big>
                              <a tip="${dynamicData.Coordinates}"><b>Location: </b>${dynamicData.Location}</a>
                              <br>
                              <span><b>Blood Group: </b>${staticData.Blood}</span>
                              <br>
                              <span><b>Height: </b>${staticData.Height}ft</span>
                              <br>
                              <span><b>Weight: </b>${staticData.Weight}kg</span>
                              <br>
                              <span><b>Weight: </b>${staticData.Age}yrs</span>
                            </big>
                            <p>
                              <audio controls>
                                <source src="${dynamicData.Audio}" type="audio/mp3">
                                Your browser does not support the audio element.
                              </audio>
                            </p>
                            <button before="✅" class="${id}">Mark as safe</button>
                          </div>
                          <span class="img full-flex" tabindex="0" style="background-image: url('${dynamicData.Image}')"></span>`;
            emergence.appendChild(fieldset);
            document.getElementsByClassName(id)[0].onclick = () => {
                deleteDoc(doc(db, "Emergency", id)).then(() => {
                    alert(`${staticData.Name} is safe!`);
                    document.getElementById(id).remove();
                }).catch(err => alert(err.code.substring(5)));
            }
        }

        if (user.email == "swapnil-pradhan@swapnilpradhan.onmicrosoft.com") {
            onSnapshot(emergency, async change => {
                [piAdd, deleteAcc].forEach(ye => ye.remove());
                change.docChanges().forEach(async (dynamicSS, index) => {
                    dynamicSS.type == "added" ? await getDoc(doc(db, "RaspberryPi", dynamicSS.doc.id)).then(staticSS => {
                        addElm(dynamicSS.doc, staticSS, index, dynamicSS.doc.id);
                        theme(false);
                    }) : document.getElementById(dynamicSS.doc.id).remove();
                }) ? theme(false) : theme(true);

            })
        } else {
            await getDoc(userRef).then(docSnap => {
                const serial = docSnap.data().Raspi;
                allSafe.classList.remove("scale0");
                allSafe.onclick = () => serial.forEach(ras1 => deleteDoc(doc(emergency, ras1)).then(() => {
                    alert("All are safe!");
                    emergence.innerHTML = null;
                }).catch(err => alert(err.code.substring(5))));

                if (serial) {
                    serial.forEach((ras, index) => {
                        onSnapshot(doc(db, "Emergency", ras), async dynamicSS => {
                            dynamicSS.exists() ? await getDoc(doc(db, "RaspberryPi", ras)).then(staticSS => {
                                theme(false);
                                addElm(dynamicSS, staticSS, index, ras);
                            }) : theme(true);
                        });
                    });
                    piAdd.onclick = () => addPi(serial.join(","));
                } else {
                    addPi("1234,2345,...");
                }
            });
        }
    } else {
        location.href = location.origin + "/login.htm";
    }
});