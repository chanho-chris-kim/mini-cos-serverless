import { useState } from "react";
import { login } from "../api/auth";
import { useUserStore } from "../lib/store";
import { useNavigate } from "react-router-dom";
import { getHomeRouteFor } from "../lib/roleHome";

export default function LoginPage() {
  const navigate = useNavigate();
  const setUser = useUserStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { user, token } = await login(email, password);
      // store auth
      setUser(user, token);
      const home = getHomeRouteFor(user);
      navigate(home, { replace: true });
    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  }

  return (
    <div className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          placeholder="email"
          className="border p-2 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          className="border p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="bg-slate-900 text-white px-3 py-2 rounded w-full">
          Login
        </button>
      </form>
    </div>
  );
}
