"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/authProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        console.error("Response is not JSON:", await res.text());
        const msg = "Error del servidor";
        setError(msg);
        toast.error(msg);
        return;
      }

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        toast.error(data.error);
      } else {
        toast.success("Sesión iniciada");
        login(data.token);
        router.push("/");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      const msg = "Error de conexión";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          disabled={isSubmitting}
          className="border p-2 rounded disabled:opacity-60"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          disabled={isSubmitting}
          className="border p-2 rounded disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white p-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span>Ingresando...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
