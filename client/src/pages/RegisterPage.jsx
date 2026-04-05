import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    adminSecret: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(form);
      navigate("/movies", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to register.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell items-center justify-center py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-lg rounded-[2rem] p-8 shadow-glow"
      >
        <p className="mb-3 text-xs uppercase tracking-[0.35em] text-amber-200/70">Register</p>
        <h1 className="title-font text-4xl font-semibold">Build your ticket identity</h1>
        <p className="mt-3 text-sm leading-7 text-white/65">
          Create a user account for booking, or switch to admin mode if you want to publish movies and shows.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4">
          <input type="text" placeholder="Full name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50" />
          <input type="email" placeholder="Email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50" />
          <input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50" />
          <select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          {form.role === "admin" ? (
            <input type="password" placeholder="Admin secret" value={form.adminSecret} onChange={(event) => setForm((current) => ({ ...current, adminSecret: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none transition focus:border-amber-300/50" />
          ) : null}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-amber-300 px-4 py-3 font-semibold text-black transition hover:bg-amber-200 disabled:opacity-60">
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-white/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-amber-200">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default RegisterPage;
