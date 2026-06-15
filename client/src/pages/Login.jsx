import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore.js";

export function Login() {
  const [email, setEmail] = useState("admin@nxtbiz.local");
  const [password, setPassword] = useState("Admin12345");
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Login failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">NxtBiz</h1>
        <p className="mt-1 text-sm text-steel">Sign in to the operations console.</p>
        <label className="field-label">Email</label>
        <input className="field" value={email} onChange={(event) => setEmail(event.target.value)} />
        <label className="field-label">Password</label>
        <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button className="primary-button mt-5 w-full">Log in</button>
        <Link className="mt-4 block text-center text-sm text-signal" to="/register">Create an account</Link>
      </form>
    </main>
  );
}
