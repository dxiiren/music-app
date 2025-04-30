// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, doc, setDoc , getDocs, where, query, updateDoc, deleteDoc, orderBy, limit, startAfter, getDoc, initializeFirestore, persistentLocalCache} from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase config
const firebaseConfig = {};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Services
const auth = getAuth(app);
// const db = getFirestore(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

const storage = getStorage(app);
const analytics = getAnalytics(app);

// ✨ Export everything bundled inside an object
export default {
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