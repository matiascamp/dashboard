"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {      
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Response is not JSON:", await res.text());
        setError("Error del servidor");
        return;
      }
  
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        login(data.token)
        router.push("/");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="border p-2 rounded" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Contraseña" className="border p-2 rounded" />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
