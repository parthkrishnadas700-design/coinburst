import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signOut,
  updateProfile,
  signInAnonymously
} from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAsGuc2CyNEoGk1ToTxU6p4U0iLK81XUmY",
  authDomain: "coinburst-5bdc5.firebaseapp.com",
  databaseURL: "https://coinburst-5bdc5-default-rtdb.firebaseio.com",
  projectId: "coinburst-5bdc5",
  storageBucket: "coinburst-5bdc5.firebasestorage.app",
  messagingSenderId: "44180464714",
  appId: "1:44180464714:android:21e33181419d46ec6632b3",
  measurementId: "G-6EWFMDMX7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

// 1-Click Anonymous / Guest Sign-In
export const signInAsGuest = async (displayName?: string) => {
  try {
    const userCredential = await signInAnonymously(auth);
    const resolvedName = displayName?.trim() || "Wealth Builder";
    await updateProfile(userCredential.user, { displayName: resolvedName });
    return userCredential.user;
  } catch (error) {
    console.error("Guest Sign-In Error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};

export { updateProfile };
