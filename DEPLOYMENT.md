# How to Deploy Your App to Vercel from GitHub

This guide will walk you through the process of deploying your Next.js application to Vercel, using your GitHub repository. Vercel is a platform specifically designed for hosting modern web applications and is highly recommended for Next.js projects.

## Prerequisites

1.  **GitHub Account**: Your application's code must be in a GitHub repository.
2.  **Vercel Account**: You will need a Vercel account. You can sign up for free using your GitHub account.
3.  **Firebase Project**: Your application is already configured to use Firebase. Make sure you have access to your Firebase project console.
4.  **Google AI API Key**: You need a Gemini API key for the AI Assistant feature. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

---

## Step-by-Step Deployment Guide

### Step 1: Sign Up / Log In to Vercel

- Go to the [Vercel website](https://vercel.com) and sign up or log in. The easiest way is to use the "Continue with GitHub" option.

### Step 2: Import Your Project

1.  From your Vercel dashboard, click the **"Add New..."** button and select **"Project"**.
2.  The "Import Git Repository" screen will appear. Vercel will automatically list your GitHub repositories.
3.  Find your application's repository in the list and click the **"Import"** button next to it.
    - If you don't see your repository, you may need to grant Vercel access to it via the "Adjust GitHub App Permissions" link.

### Step 3: Configure Your Project

Vercel is very smart and will automatically detect that you are deploying a Next.js application.

- **Framework Preset**: This should be automatically set to "Next.js". You don't need to change anything here.
- **Build and Output Settings**: You can leave these as their default values. Vercel knows how to build a Next.js app.

### Step 4: Add Environment Variables (Crucial Step)

This is the most important part of the configuration. Your application needs API keys and other secrets to connect to Firebase and Google AI. These should **not** be stored directly in your code.

1.  Expand the **"Environment Variables"** section in Vercel's project configuration page.
2.  You will need to add the following variables one by one. These can be found in your project's `.env` file (for Firebase) and your Google AI Studio dashboard (for Gemini).

| Name                                | Value                                  |
| ----------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_FIREBASE_API_KEY`      | *Your Firebase API Key*                |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`  | *Your Firebase Auth Domain*            |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`   | *Your Firebase Project ID*             |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| *Your Firebase Storage Bucket*        |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | *Your Firebase Messaging Sender ID* |
| `NEXT_PUBLIC_FIREBASE_APP_ID`       | *Your Firebase App ID*                 |
| `GEMINI_API_KEY`                    | *Your Google AI (Gemini) API Key*      |

**To add each variable:**
- Enter the **Name** exactly as shown above.
- Paste the corresponding **Value** from your Firebase config or Google AI Studio.
- Click the **"Add"** button.
- Repeat for all required variables.

### Step 5: Deploy

- Once all the environment variables have been added, click the **"Deploy"** button.
- Vercel will start the build process. You can watch the logs in real-time. This process usually takes a few minutes.
- Once completed, you'll get a confirmation message and a URL for your live site (e.g., `your-project-name.vercel.app`). Congratulations!

---

## Step 6: Post-Deployment Configuration (Important!)

For Google Sign-In to work on your newly deployed site, you must add your new Vercel domain to the list of authorized domains in your Firebase project.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project.
3.  In the left-hand navigation menu, go to **Authentication**.
4.  Click on the **"Settings"** tab.
5.  Under the "Authorized domains" section, click **"Add domain"**.
6.  Enter the domain Vercel gave you (e.g., `your-project-name.vercel.app`) and click **"Add"**.

Your application is now fully deployed and configured! Vercel will automatically re-deploy your site every time you push a new change to your GitHub repository's main branch.
