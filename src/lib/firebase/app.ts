import {initializeApp} from "firebase/app";
import {connectAuthEmulator, getAuth} from "firebase/auth";
import {isProd} from "../../app/env";
import {connectFirestoreEmulator, getFirestore} from "firebase/firestore";

// Surprisingly, it's recommended and OK to check this information in according
// to Firebase documentation. Huh.
const firebaseConfig = {
  apiKey: "AIzaSyBnzGRQ5XIXRjEaYFmptN_w_sPvkkyDOQ4",
  authDomain: "ynab-allocation-manager.firebaseapp.com",
  projectId: "ynab-allocation-manager",
  storageBucket: "ynab-allocation-manager.firebasestorage.app",
  messagingSenderId: "940773929018",
  appId: "1:940773929018:web:a768dceefb7b2028948503",
  measurementId: "G-H0XNLE94YN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

if (!isProd) {
  console.log("Connecting to auth emulator!");
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  console.log("Connecting to Firestore emulator!");
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
}

export{app, auth, db};
