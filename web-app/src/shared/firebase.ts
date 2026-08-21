import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  getRedirectResult,
  signInWithCredential
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTKlQb9JaFs2j98VaUPozEojxgp8tOvso",
  authDomain: "coinburst-5bdc5.firebaseapp.com",
  databaseURL: "https://coinburst-5bdc5-default-rtdb.firebaseio.com",
  projectId: "coinburst-5bdc5",
  storageBucket: "coinburst-5bdc5.firebasestorage.app",
  messagingSenderId: "44180464714",
  appId: "1:44180464714:web:8bb56db76346b0b26632b3",
  measurementId: "G-6EWFMDMX7H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Google Auth provider scopes
googleProvider.addScope("profile");
googleProvider.addScope("email");

// Initialize Capacitor Native Google Auth if running on Android/iOS
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '44180464714-49os9013g7k1vrbru6nhr3grmpd0hd10.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: false,
  });
}

// Google Sign-In (Native Google Dialog on Android APK, Popup/Redirect on Web Browser)
export const signInWithGoogle = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleAuth.initialize({
        clientId: '44180464714-49os9013g7k1vrbru6nhr3grmpd0hd10.apps.googleusercontent.com',
        scopes: ['profile', 'email'],
        grantOfflineAccess: false,
      });

      const googleUser = await GoogleAuth.signIn();
      console.log("Capacitor GoogleAuth User Response:", googleUser);
      
      const idToken = googleUser?.authentication?.idToken || (googleUser as any)?.idToken;
      const accessToken = googleUser?.authentication?.accessToken || (googleUser as any)?.accessToken;

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      } else if (accessToken) {
        const credential = GoogleAuthProvider.credential(null, accessToken);
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }
    } catch (nativeErr: any) {
      console.warn("Native Google Auth error, attempting Firebase Web Auth fallback:", nativeErr);
      const rawMsg = nativeErr?.message || nativeErr?.errorMessage || (typeof nativeErr === 'string' ? nativeErr : JSON.stringify(nativeErr));
      if (rawMsg.includes('12501') || rawMsg.includes('cancel') || rawMsg.includes('CLOSED')) {
        throw new Error("Google Sign-In was cancelled.");
      }
    }
  }

  // Web Browser & Native Fallback (Popup Auth)
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    throw new Error(error.message || 'Google Authentication failed.');
  }
};

// Call this after app initialization to handle redirect result (only when web redirect occurs)
export const handleGoogleRedirectResult = async () => {
  if (!window.location.search && !window.location.hash) {
    return null;
  }
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      console.log("Google redirect sign-in success:", result.user);
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Google Redirect Result Error:", error);
    return null;
  }
};

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(result.user, { displayName: name });
    return result.user;
  } catch (error) {
    console.error("Email Sign-Up Error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error) {
    console.error("Email Sign-In Error:", error);
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
