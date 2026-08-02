// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc , getDocs, where, query, updateDoc, deleteDoc, orderBy, limit, startAfter, getDoc, initializeFirestore, persistentLocalCache} from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase config — injected via VITE_FIREBASE_* env vars (see .env.example);
// falls back to an empty object when unset.
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config";

// Services — only initialized when a real config is present. With an empty
// config getAuth() throws (auth/invalid-api-key), so src/main.js checks
// isConfigured and renders the "Firebase not configured" banner instead.
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  // db = getFirestore(app);
  db = initializeFirestore(app, {
    localCache: persistentLocalCache(),
  });
  storage = getStorage(app);
  analytics = getAnalytics(app);
}

// ✨ Export everything bundled inside an object
export default {
  isConfigured: isFirebaseConfigured,
  app,
  auth,
  db,
  storage,
  analytics,
  startAfter,
  limit,
  orderBy,
  deleteObject,
  deleteDoc,
  updateDoc,
  where,
  query,
  collection,
  getDoc,
  getDocs,
  getDownloadURL,
  uploadBytesResumable,
  ref,
  uploadBytes,
  signOut,
  onAuthStateChanged,
  addDoc,
  doc,
  setDoc,
  createUserWithEmailAndPassword,   // add functions here
  signInWithEmailAndPassword,
  updateProfile,
};