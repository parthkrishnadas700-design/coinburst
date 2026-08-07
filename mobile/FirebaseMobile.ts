/**
 * Firebase Mobile Integration Module for CoinBurst (React Native)
 * 
 * This module demonstrates how to configure Firebase Authentication (Google Login),
 * Realtime Database syncing, and profile management for the React Native application.
 * It uses the same Firebase project configuration as the web application.
 * 
 * -----------------------------------------------------------------------------
 * PREREQUISITES & INSTALLATION:
 * 1. Install React Native Firebase core and services:
 *    npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/database
 * 
 * 2. Install Google Sign-In for React Native:
 *    npm install @react-native-google-signin/google-signin
 * 
 * 3. Android Setup:
 *    - Add your android/app/google-services.json from the Firebase Console.
 *    - Add the Google Services plugin to your android/build.gradle and android/app/build.gradle.
 * 
 * 4. iOS Setup:
 *    - Add your ios/GoogleService-Info.plist from the Firebase Console.
 *    - Run: cd ios && pod install
 * -----------------------------------------------------------------------------
 */

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import { useFinanceStore } from '../shared/useFinanceStore';

// Initialize Google Sign-In
GoogleSignin.configure({
  // Web Client ID from your Firebase Console -> Authentication -> Sign-in Method -> Google
  webClientId: '44180464714-ol7bch8om2m5f2a15o4vdtv9j81v8sbi.apps.googleusercontent.com', // Replace with your Google OAuth client ID
  offlineAccess: true,
});

/**
 * Interface representing the authenticated mobile user
 */
export interface MobileUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

/**
 * 1. Trigger Google Sign-In on Mobile
 */
export const signInWithGoogleMobile = async (): Promise<MobileUserProfile | null> => {
  try {
    // Check if device has Google Play Services available (Android only)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    const userCredential = await auth().signInWithCredential(googleCredential);
    const user = userCredential.user;

    if (user) {
      const profile: MobileUserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Wealth Builder',
        photoURL: user.photoURL || undefined,
      };

      // Sync user profile state with local Zustand store
      // Since useFinanceStore is shared, we use the exact same action:
      await useFinanceStore.getState().setUser({
        ...profile,
        selectedTheme: useFinanceStore.getState().theme,
      });

      // Fetch latest financial ledger from Firebase Realtime Database
      await syncFirebaseToMobileStore(user.uid);
      
      return profile;
    }
    
    return null;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log('Google Login: User cancelled the login flow.');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log('Google Login: Login is already in progress.');
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.error('Google Login: Play services not available or outdated.');
    } else {
      console.error('Google Login Error:', error);
    }
    throw error;
  }
};

/**
 * 2. Log Out Mobile User
 */
export const signOutMobileUser = async () => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
    // Clear Zustand store user session
    await useFinanceStore.getState().setUser(null);
  } catch (error) {
    console.error('Mobile Sign-Out Error:', error);
    throw error;
  }
};

// Firebase RTDB returns null for missing keys, and may return objects (not arrays)
// for arrays stored sequentially. This helper normalises both cases.
const fromFirebaseArray = <T>(val: unknown): T[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val as T[];
  if (typeof val === 'object') return Object.values(val) as T[];
  return [];
};

/**
 * 3. Subscribe to Financial Data in Firebase to Hydrate Mobile Store Live
 */
export const syncFirebaseToMobileStore = async (uid: string) => {
  try {
    // Listen live in real-time to any modifications from Web or Mobile
    database().ref(`/users/${uid}`).on('value', (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        useFinanceStore.setState({
          accounts: fromFirebaseArray(data.accounts),
          transactions: fromFirebaseArray(data.transactions),
          budgets: fromFirebaseArray(data.budgets),
          theme: data.theme || 'dark',
          currency: data.currency || 'INR',
        });
        console.log('[CoinBurst Mobile] Live ledger update received from Firebase.');
      }
    });

    const snapshot = await database().ref(`/users/${uid}`).once('value');
    if (!snapshot.exists()) {
      const { theme, currency } = useFinanceStore.getState();
      await database().ref(`/users/${uid}`).set({
        theme,
        currency,
        profile: {
          displayName: auth().currentUser?.displayName || 'Wealth Builder',
          email: auth().currentUser?.email || '',
          photoURL: auth().currentUser?.photoURL || '',
        }
      });
      console.log('[CoinBurst Mobile] First-time database record created in Firebase.');
    }
  } catch (error) {
    console.error('[CoinBurst Mobile] Sync Remote Ledger to Mobile failed:', error);
  }
};

/**
 * 4. Push Mobile State Modifications to Firebase Realtime Database
 * 
 * Call this helper inside your mobile action interceptors, or subscribe to store 
 * changes in your React Native App entry point:
 * 
 * useEffect(() => {
 *   const unsubscribe = useFinanceStore.subscribe(
 *     (state) => state,
 *     (state) => {
 *       if (state.user) {
 *         saveMobileStateToFirebase(
 *           state.user.uid, 
 *           state.accounts, 
 *           state.transactions, 
 *           state.budgets, 
 *           state.theme,
 *           state.currency
 *         );
 *       }
 *     }
 *   );
 *   return () => unsubscribe();
 * }, []);
 */
export const saveMobileStateToFirebase = async (
  uid: string,
  accounts: any[],
  transactions: any[],
  budgets: any[],
  theme: string,
  currency: string
) => {
  try {
    await database().ref(`/users/${uid}`).update({
      accounts,
      transactions,
      budgets,
      theme,
      currency
    });
    console.log('Mobile ledger changes synced to Firebase.');
  } catch (error) {
    console.error('Failed syncing mobile modifications to Firebase:', error);
  }
};

/**
 * 5. Update User Profile on Firebase Auth and Realtime Database from Mobile
 */
export const updateMobileUserProfile = async (
  displayName: string,
  photoURL?: string
) => {
  const currentUser = auth().currentUser;
  if (!currentUser) return;

  try {
    // 1. Update Firebase Auth Profile
    await currentUser.updateProfile({
      displayName,
      photoURL: photoURL || null,
    });

    // 2. Sync to Zustand Local Store
    const storeUser = useFinanceStore.getState().user;
    if (storeUser) {
      useFinanceStore.getState().updateUserProfile({
        displayName,
        photoURL: photoURL || undefined,
      });
    }

    // 3. Sync to Realtime Database User Profile Node
    await database().ref(`/users/${currentUser.uid}/profile`).update({
      displayName,
      photoURL: photoURL || '',
    });

    console.log('Mobile user profile successfully updated.');
  } catch (error) {
    console.error('Failed to update mobile user profile:', error);
    throw error;
  }
};
