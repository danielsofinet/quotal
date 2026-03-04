import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut as firebaseSignOut,
  onIdTokenChanged,
  type Auth,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

function getFirebaseApp(): FirebaseApp {
  if (_app) return _app;
  _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return _app;
}

function getFirebaseAuth(): Auth {
  if (_auth) return _auth;
  _auth = getAuth(getFirebaseApp());
  return _auth;
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  const auth = getFirebaseAuth();
  const isLocalhost = window.location.hostname === "localhost";

  if (isLocalhost) {
    // Popup works fine on localhost
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    await syncSession(idToken);
    return result.user;
  }

  // Use redirect for production (avoids COOP popup issues)
  await signInWithRedirect(auth, googleProvider);
  return null;
}

// Handle redirect result on page load
export async function handleRedirectResult(): Promise<User | null> {
  const auth = getFirebaseAuth();
  const result = await getRedirectResult(auth);
  if (result?.user) {
    const idToken = await result.user.getIdToken();
    await syncSession(idToken);
    return result.user;
  }
  return null;
}

export async function sendMagicLink(email: string) {
  const auth = getFirebaseAuth();
  const actionCodeSettings = {
    url: `${window.location.origin}/sign-in?finishSignIn=true`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  window.localStorage.setItem("emailForSignIn", email);
}

export async function completeMagicLink(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;

  let email = window.localStorage.getItem("emailForSignIn");
  if (!email) {
    email = window.prompt("Please provide your email for confirmation");
    if (!email) return null;
  }

  const result = await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem("emailForSignIn");
  const idToken = await result.user.getIdToken();
  await syncSession(idToken);
  return result.user;
}

export async function signOut() {
  const auth = getFirebaseAuth();
  await fetch("/api/auth/session", { method: "DELETE" });
  await firebaseSignOut(auth);
}

async function syncSession(idToken: string) {
  await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
}

export function onTokenRefresh(callback: (user: User | null) => void) {
  const auth = getFirebaseAuth();
  return onIdTokenChanged(auth, async (user) => {
    if (user) {
      const idToken = await user.getIdToken();
      await syncSession(idToken);
    }
    callback(user);
  });
}

export { getFirebaseAuth as getAuth };
