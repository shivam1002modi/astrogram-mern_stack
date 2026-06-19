import { useState } from "react";
import { createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "../firebase";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await setPersistence(auth, browserSessionPersistence);
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created!");
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Card title="Register">
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="you@example.com" />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-input" placeholder="••••••••" />
        </div>
        <button type="submit" className="btn">Sign Up</button>
      </form>
      <p style={{textAlign: 'center', marginTop: '1.5rem'}}>
        Already have an account? <Link to="/login" style={{color: 'var(--color-accent)'}}>Login</Link>
      </p>
    </Card>
  );
}
