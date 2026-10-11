import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signOut,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential
} from "firebase/auth";
import { getDatabase } from "firebase/database";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

// Configure Google Sign-In with Web Client ID from google-services.json
GoogleSignin.configure({
  webClientId: "44180464714-49os9013g7k1vrbru6nhr3grmpd0hd10.apps.googleusercontent.com",
  offlineAccess: true,
});

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  await updateProfile(result.user, { displayName: name });
  return result.user;
};

export const signInWithEmail = async (email: string, pass: string) => {
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const signInWithGoogle = async () => {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken || (response as any).idToken;
  if (!idToken) {
    throw new Error('Google Sign-In failed: No ID Token retrieved');
  }
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
};

export const signOutUser = async () => {
  try {
    await GoogleSignin.signOut();
  } catch (e) {
    // Ignore if not signed in with Google
  }
  await signOut(auth);
};

export { updateProfile };

