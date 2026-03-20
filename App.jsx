import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import Storyboard from "./components/Storyboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const msg = err.code === "auth/invalid-credential"
        ? "Wrong email or password."
        : err.code === "auth/email-already-in-use"
        ? "Account already exists — sign in instead."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : err.message;
      setError(msg);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--orange-600)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 8h2" /><path d="M7 11h4" />
              <rect x="14" y="7" width="4" height="5" rx="0.5" />
            </svg>
          </div>
          <h1>Storyboard</h1>
          <p>Collaborative scene planning for your short film.</p>
          <div className="login-form" >
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
            />
            {error && <p className="login-error">{error}</p>}
            <button className="login-btn" onClick={handleSubmit}>
              {isSignUp ? "Create account" : "Sign in"}
            </button>
            <button
              className="login-toggle"
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            >
              {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Storyboard user={user} />;
}
