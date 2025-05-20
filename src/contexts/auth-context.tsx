
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
  updateProfile,
  type User,
  type AuthError
} from 'firebase/auth';
import { auth, storage } from '@/lib/firebase/config';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export interface UserProfileUpdateData {
  displayName?: string;
  photoFile?: File | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (credentials: EmailPasswordCredentials) => Promise<boolean>;
  signUpWithEmailPassword: (credentials: EmailPasswordCredentials) => Promise<boolean>;
  updateUserProfile: (data: UserProfileUpdateData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
      await signInWithPopup(auth, provider);
      toast({ title: "Success", description: "Logged in successfully with Google!" });
    } catch (error) {
      handleAuthError(error as AuthError, "Could not sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmailPassword = async ({ email, password }: EmailPasswordCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "Success", description: "Logged in successfully!" });
      return true;
    } catch (error) {
      handleAuthError(error as AuthError, "Could not sign in with email/password. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmailPassword = async ({ email, password }: EmailPasswordCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({ title: "Success", description: "Account created and logged in successfully!" });
      return true;
    } catch (error) {
      handleAuthError(error as AuthError, "Could not create account. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async ({ displayName, photoFile }: UserProfileUpdateData): Promise<boolean> => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({ title: "Error", description: "No user logged in.", variant: "destructive" });
      return false;
    }
    setLoading(true);
    try {
      // Determine the displayName to be set in Firebase.
      // If `displayName` from input is undefined, use the current user's displayName.
      // If `displayName` from input is an empty string, it means user wants to clear it, so pass null or empty string.
      const newDisplayName = displayName === undefined ? currentUser.displayName : displayName;

      // Determine the photoURL to be set in Firebase.
      let newPhotoURL = currentUser.photoURL; // Start with the current photoURL
      if (photoFile) {
        const fileRef = storageRef(storage, `profile_pictures/${currentUser.uid}/${photoFile.name}`);
        await uploadBytes(fileRef, photoFile);
        newPhotoURL = await getDownloadURL(fileRef); // Get the URL of the newly uploaded file
      }

      // Update Firebase Auth profile
      await updateProfile(currentUser, {
        displayName: newDisplayName,
        photoURL: newPhotoURL,
      });
      
      // Manually update the local user state to reflect changes immediately
      // because auth.currentUser might not update instantly.
      setUser(prevUser => {
        if (!prevUser) return null; // Should not happen if currentUser was defined above
        return {
          ...prevUser, // Spread all existing properties of the current user in state
          displayName: newDisplayName, // Apply the new display name
          photoURL: newPhotoURL,     // Apply the new photo URL
        } as User; // Cast to User, assuming all other properties of User are still valid
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

    
