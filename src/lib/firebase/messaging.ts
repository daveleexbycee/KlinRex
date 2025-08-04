// src/lib/firebase/messaging.ts
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app, db } from "./config";
import { doc, setDoc } from "firebase/firestore";

const FCM_VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export const initializeFCM = () => {
  if (typeof window !== "undefined") {
    return getMessaging(app);
  }
  return null;
};

export const requestNotificationPermission = async (userId: string) => {
  const messaging = initializeFCM();
  if (!messaging) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      await saveMessagingDeviceToken(userId);
    } else {
      console.log("Unable to get permission to notify.");
    }
  } catch (error) {
    console.error("An error occurred while requesting permission ", error);
  }
};

export const saveMessagingDeviceToken = async (userId: string) => {
  const messaging = initializeFCM();
  if (!messaging || !FCM_VAPID_KEY) return;
  
  try {
    const currentToken = await getToken(messaging, { vapidKey: FCM_VAPID_KEY });
    if (currentToken) {
      console.log("FCM Token:", currentToken);
      const userProfileRef = doc(db, "userProfiles", userId);
      await setDoc(userProfileRef, { fcmToken: currentToken }, { merge: true });
      console.log("FCM token saved for user:", userId);
    } else {
      console.log("No registration token available. Request permission to generate one.");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token. ", error);
  }
};

export const onMessageListener = () => {
    const messaging = initializeFCM();
    if (!messaging) return new Promise(() => {});

    return new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            console.log("Foreground message received. ", payload);
            resolve(payload);
        });
    });
};
