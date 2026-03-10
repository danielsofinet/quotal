import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();
  await syncSession(idToken);
  return result.user;
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

export async function sendMagicLink(email: string, locale?: string) {
  const res = await fetch("/api/auth/magic-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, locale }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const error = new Error(data.error || "Failed to send sign-in link");
    if (res.status === 429) {
      (error as Error & { code: string }).code = "auth/too-many-requests";
    }
    throw error;
  }

  window.localStorage.setItem("emailForSignIn", email);
}

export function isMagicLinkCallback(): boolean {
  const auth = getFirebaseAuth();
  return isSignInWithEmailLink(auth, window.location.href);
}

export function getSavedEmail(): string | null {
  return window.localStorage.getItem("emailForSignIn");
}

export async function completeMagicLink(emailOverride?: string): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;

  const email = emailOverride || window.localStorage.getItem("emailForSignIn");
  if (!email) return null;

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
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || data.error || `Session creation failed (${res.status})`);
  }
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
