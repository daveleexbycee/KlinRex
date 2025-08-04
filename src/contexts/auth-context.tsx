// src/contexts/auth-context.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile as updateFirebaseAuthProfile,
  type User as FirebaseUser, // Renamed to avoid conflict
  type AuthError
} from 'firebase/auth';
import { auth, storage, db } from '@/lib/firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { requestNotificationPermission } from '@/lib/firebase/messaging';


// Extended User type
export interface KlinRexUser extends FirebaseUser {
  bloodGroup?: string;
  bloodType?: string;
  emergencyContact?: string;
  address?: string;
  fcmToken?: string;
}

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface UserProfileUpdateData {
  displayName?: string;
  photoFile?: File | null;
  bloodGroup?: string;
  bloodType?: string;
  emergencyContact?: string;
  address?: string;
}

interface AuthContextType {
  user: KlinRexUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (credentials: EmailPasswordCredentials) => Promise<boolean>;
  signUpWithEmailPassword: (credentials: EmailPasswordCredentials) => Promise<boolean>;
  updateUserProfile: (data: UserProfileUpdateData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<KlinRexUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch custom profile data from Firestore
        const userProfileRef = doc(db, "userProfiles", firebaseUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        let customData = {};
        if (userProfileSnap.exists()) {
          customData = userProfileSnap.data();
        }
        const combinedUser = { ...firebaseUser, ...customData } as KlinRexUser
        setUser(combinedUser);
        // Once user is loaded, try to get notification permission
        if (combinedUser && !combinedUser.fcmToken) {
           console.log("Requesting notification permission on login...");
           requestNotificationPermission(combinedUser.uid);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthSuccess = (uid: string) => {
    toast({ title: "Success", description: "Logged in successfully!" });
    router.push('/dashboard');
  };

  const handleAuthError = (error: AuthError, defaultMessage: string) => {
    console.error("Authentication error:", error.code, error.message);
    let message = defaultMessage;
    if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No user found with this email.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                message = 'This email address is already in use by another account.';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak. It should be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                message = 'The email address is not valid.';
                break;
            case 'auth/operation-not-allowed':
                message = 'Sign-in method is not enabled. Please check your Firebase project settings (Authentication > Sign-in method) to ensure Google Sign-In (and Email/Password) is enabled.';
                break;
            case 'auth/popup-closed-by-user':
                message = 'Google Sign-In popup was closed before completing. Please try again.';
                break;
            case 'auth/popup-blocked':
                message = 'Google Sign-In popup was blocked by the browser. Please check your browser settings and disable any popup blockers for this site.';
                break;
            case 'auth/cancelled-popup-request':
                 message = 'Google Sign-In was cancelled. Please try again.';
                 break;
            case 'auth/network-request-failed':
                 message = 'A network error occurred. Please check your internet connection and try again.';
                 break;
            case 'auth/unauthorized-domain':
                 message = 'This domain is not authorized for OAuth operations for your Firebase project. Check your Firebase console authorized domains.';
                 break;
            default:
                message = error.message || defaultMessage;
        }
    }
    toast({
      title: "Authentication Failed",
      description: message,
      variant: "destructive",
    });
  }

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      handleAuthSuccess(result.user.uid);
    } catch (error) {
      handleAuthError(error as AuthError, "Could not sign in with Google. Please try again.");
    } finally {
      // setLoading(false); // onAuthStateChanged will set loading to false
    }
  };

  const loginWithEmailPassword = async ({ email, password }: EmailPasswordCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      handleAuthSuccess(result.user.uid);
      return true;
    } catch (error) {
      handleAuthError(error as AuthError, "Could not sign in with email/password. Please try again.");
      setLoading(false); // Ensure loading is false on error
      return false;
    }
  };

  const signUpWithEmailPassword = async ({ email, password }: EmailPasswordCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create an empty profile in Firestore for the new user
      const userProfileRef = doc(db, "userProfiles", userCredential.user.uid);
      await setDoc(userProfileRef, { email: userCredential.user.email });
      handleAuthSuccess(userCredential.user.uid);
      return true;
    } catch (error) {
      handleAuthError(error as AuthError, "Could not create account. Please try again.");
      setLoading(false); // Ensure loading is false on error
      return false;
    }
  };

  const updateUserProfile = async (data: UserProfileUpdateData): Promise<boolean> => {
    const currentFirebaseUser = auth.currentUser;
    if (!currentFirebaseUser) {
      toast({ title: "Error", description: "No user logged in.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    try {
      const { displayName, photoFile, bloodGroup, bloodType, emergencyContact, address } = data;
      
      const authProfileUpdates: { displayName?: string; photoURL?: string | null } = {};
      if (displayName !== undefined) {
        authProfileUpdates.displayName = displayName;
      }
      
      let newPhotoURL = currentFirebaseUser.photoURL;
      if (photoFile) {
        const fileRef = storageRef(storage, `profile_pictures/${currentFirebaseUser.uid}/${photoFile.name}`);
        await uploadBytes(fileRef, photoFile);
        newPhotoURL = await getDownloadURL(fileRef);
        authProfileUpdates.photoURL = newPhotoURL;
      }

      if (Object.keys(authProfileUpdates).length > 0) {
        await updateFirebaseAuthProfile(currentFirebaseUser, authProfileUpdates);
      }

      const userProfileRef = doc(db, "userProfiles", currentFirebaseUser.uid);
      const customProfileDataToUpdate: Record<string, any> = {};
      if (bloodGroup !== undefined) customProfileDataToUpdate.bloodGroup = bloodGroup;
      if (bloodType !== undefined) customProfileDataToUpdate.bloodType = bloodType;
      if (emergencyContact !== undefined) customProfileDataToUpdate.emergencyContact = emergencyContact;
      if (address !== undefined) customProfileDataToUpdate.address = address;

      if (Object.keys(customProfileDataToUpdate).length > 0) {
        await setDoc(userProfileRef, customProfileDataToUpdate, { merge: true });
      }
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          displayName: displayName !== undefined ? displayName : prevUser.displayName,
          photoURL: newPhotoURL !== undefined ? newPhotoURL : prevUser.photoURL,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : prevUser.bloodGroup,
          bloodType: bloodType !== undefined ? bloodType : prevUser.bloodType,
          emergencyContact: emergencyContact !== undefined ? emergencyContact : prevUser.emergencyContact,
          address: address !== undefined ? address : prevUser.address,
        } as KlinRexUser;
      });

      toast({ title: "Success", description: "Profile updated successfully!" });
      return true;
    } catch (error) {
      console.error("Profile update error:", error);
      toast({ title: "Error", description: "Could not update profile. Please try again.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      toast({ title: "Success", description: "Logged out successfully." });
      router.push('/');
    } catch (error) {
       handleAuthError(error as AuthError, "Could not sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmailPassword, signUpWithEmailPassword, updateUserProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
