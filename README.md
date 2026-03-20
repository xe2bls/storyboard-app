# Storyboard — Collaborative Scene Planner

Real-time collaborative storyboard app for short film projects.  
Built with React + Firebase (Firestore, Auth, Storage) + dnd-kit.

---

## Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/) → **Add project**
2. Give it a name (e.g. `storyboard`) → create it

### 2. Enable Services

In the Firebase Console for your project:

- **Authentication** → Sign-in method → enable **Google**
- **Firestore Database** → Create database → start in **test mode**
- **Storage** → Get started → start in **test mode**

### 3. Get Your Config

Firebase Console → ⚙ Project Settings → scroll to **Your apps** → click the web icon (`</>`) → register an app → copy the `firebaseConfig` object.

Paste it into **`src/firebase.js`** replacing the empty strings.

### 4. Install & Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173` — sign in with Google, start adding scenes.

### 5. Deploy to Netlify

Option A — **Git deploy** (recommended):
1. Push the repo to GitHub
2. Netlify → New site from Git → select the repo
3. Build command: `npm run build` / Publish directory: `dist`
4. Deploy

Option B — **Manual deploy**:
```bash
npm run build
# Drag the dist folder into Netlify's deploy area
```

### 6. Add Your Netlify URL to Firebase

Firebase Console → Authentication → Settings → **Authorized domains** → add your Netlify URL (e.g. `your-app.netlify.app`).

---

## Firestore Security Rules (for production)

Replace the default test-mode rules with something tighter once you're past prototyping:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /scenes/{sceneId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

And for Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /storyboard/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19 + Vite |
| Real-time DB | Cloud Firestore |
| Auth | Firebase Auth (Google) |
| Image storage | Firebase Storage |
| Drag & drop | @dnd-kit |
| Hosting | Netlify |
