import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore.js";

export function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Viewer" });
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await register(form);
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Registration failed");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Join NxtBiz</h1>
        <label className="field-label">Name</label>
        <input className="field" value={form.name} onChange={(event) => update("name", event.target.value)} />
        <label className="field-label">Email</label>
        <input className="field" value={form.email} onChange={(event) => update("email", event.target.value)} />
        <label className="field-label">Password</label>
        <input className="field" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} />
        <button className="primary-button mt-5 w-full">Register</button>
        <Link className="mt-4 block text-center text-sm text-signal" to="/login">Back to login</Link>
      </form>
    </main>
  );
}
