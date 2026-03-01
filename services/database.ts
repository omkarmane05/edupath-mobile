
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { UserProfile } from "../types";

const LOCAL_STORAGE_KEY = 'edupath_profile_cache';

const saveLocally = (profile: UserProfile) => {
  localStorage.setItem(`${LOCAL_STORAGE_KEY}_${profile.id}`, JSON.stringify(profile));
};

const getLocally = (userId: string): UserProfile | null => {
  const data = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${userId}`);
  return data ? JSON.parse(data) : null;
};

export const syncUserProfile = (userId: string, callback: (profile: UserProfile) => void) => {
  try {
    const userRef = doc(db, "users", userId);
    return onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        saveLocally(data);
        callback(data);
      }
    }, (error) => {
      console.warn("Firestore listener failed, using local fallback.");
      const local = getLocally(userId);
      if (local) callback(local);
    });
  } catch (e) {
    const local = getLocally(userId);
    if (local) callback(local);
    return () => {};
  }
};

export const updateUserActivity = async (userId: string, activity: any) => {
  const localProfile = getLocally(userId);
  if (localProfile) {
    const updated = { ...localProfile, activity };
    saveLocally(updated);
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { activity });
  } catch (e) {
    console.warn("Update failed. Data persists in browser storage.");
  }
};

export const initializeUser = async (userId: string, method: string) => {
  // Fix: Added missing 'recentlyViewed' property to comply with UserActivity interface definition
  const initialProfile: UserProfile = {
    id: userId,
    emailOrPhone: userId,
    activity: {
      savedJobs: [],
      appliedOpportunities: [],
      appliedJobs: [],
      recentlyViewed: [],
      lastLogin: new Date().toLocaleString(),
      loginMethod: method as any
    }
  };

  const local = getLocally(userId);
  if (local) return local;

  try {
    const userRef = doc(db, "users", userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      saveLocally(data);
      return data;
    }
    await setDoc(userRef, initialProfile);
  } catch (err) {
    console.log("Guest/Local mode initialized.");
  }

  saveLocally(initialProfile);
  return initialProfile;
};
