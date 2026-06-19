import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card"; // 1. Import the new Card component

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in!");
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithPopup(auth, provider);
      toast.success("Google login successful!");
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    // 2. Use the Card component
    <Card title="Login">
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" />
        </div>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <button type="submit" className="btn">Login</button>
          <button type="button" onClick={handleGoogle} className="btn btn-secondary">Login with Google</button>
        </div>
      </form>
      <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
        Don't have an account? <Link to="/register" style={{color: 'var(--color-accent)'}}>Sign Up</Link>
      </p>
    </Card>
  );
}
