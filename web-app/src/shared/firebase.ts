import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
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
export const googleProvider = new GoogleAuthProvider();

// Google Auth provider scopes & custom parameters (Prompt account selector dialog)
googleProvider.addScope("profile");
googleProvider.addScope("email");
googleProvider.setCustomParameters({
  prompt: "select_account"
});

// Initialize Capacitor Native Google Auth if running on Android/iOS
if (Capacitor.isNativePlatform()) {
  GoogleAuth.initialize({
    clientId: '44180464714-49os9013g7k1vrbru6nhr3grmpd0hd10.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
    grantOfflineAccess: false,
  });
}

// Google Sign-In (Native Google Dialog on Android APK, Popup / Redirect on Web Browser & WebView)
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
      } else {
        throw new Error("No Google ID token received from device.");
      }
    } catch (nativeErr: any) {
      console.error("Native Google Auth error:", nativeErr);
      const rawMsg = nativeErr?.message || nativeErr?.errorMessage || (typeof nativeErr === 'string' ? nativeErr : JSON.stringify(nativeErr));
      if (rawMsg.includes('12501') || rawMsg.includes('cancel') || rawMsg.includes('CLOSED') || rawMsg.includes('user canceled')) {
        throw new Error("Google Sign-In was cancelled.");
      }
      // Never fall back to popup web browser in native APK!
      throw new Error(rawMsg || "Google Sign-In failed on device.");
    }
  }

  // Web Browser ONLY (In-App Popup Auth with Redirect Fallback for desktop/mobile browsers)
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Google Sign-In error:", error);
    if (
      error.code === 'auth/popup-closed-by-user' || 
      error.code === 'auth/popup-blocked' || 
      error.code === 'auth/cancelled-popup-request'
    ) {
      console.log("Popup blocked or closed by WebView/browser, falling back to signInWithRedirect...");
      try {
        await signInWithRedirect(auth, googleProvider);
        return null;
      } catch (redirectErr: any) {
        console.error("Google Redirect Error:", redirectErr);
        throw new Error("Google Sign-In popup was closed or blocked. Redirecting for authentication...");
      }
    }
    throw error;
  }
};

// Call this after app initialization to handle redirect result (only when web redirect occurs)
export const handleGoogleRedirectResult = async () => {
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
    const cleanEmail = email.trim().toLowerCase();
    const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    await updateProfile(result.user, { displayName: name.trim() });
    return result.user;
  } catch (error) {
    console.error("Email Sign-Up Error:", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    return result.user;
  } catch (error) {
    console.error("Email Sign-In Error:", error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      try {
        await GoogleAuth.signOut();
      } catch (e) {
        console.warn("GoogleAuth signOut error:", e);
      }
    }
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};

export { updateProfile };
