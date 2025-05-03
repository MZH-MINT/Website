import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLogin() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const res = await fetch("/api/admin/check", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (err) {
      console.error("Error checking admin status:", err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
        credentials: "include",
      });
      if (res.ok) {
        setIsAdmin(true);
      } else {
        setError("Invalid user ID or password");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    setIsAdmin(false);
    setUserId("");
    setPassword("");
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegisterSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
        credentials: "include",
      });
      if (res.ok) {
        setRegisterSuccess("Admin registered successfully! You can now log in.");
        setShowRegister(false);
        setUserId("");
        setPassword("");
      } else {
        const data = await res.json();
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
          <div>
            <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
              Admin Dashboard
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              You are logged in as an admin
            </p>
          </div>
          <Button
            onClick={handleLogout}
            className="w-full"
            variant="destructive"
          >
            Logout
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {showRegister ? "Admin Register" : "Admin Login"}
          </h2>
        </div>
        {registerSuccess && (
          <div className="text-green-600 text-sm text-center">{registerSuccess}</div>
        )}
        {showRegister ? (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <Input
                  type="text"
                  required
                  placeholder="User ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-2"
              onClick={() => { setShowRegister(false); setError(""); setRegisterSuccess(""); }}
            >
              Back to Login
            </Button>
          </form>
        ) : (
          <>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <Input
                    type="text"
                    required
                    placeholder="User ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={() => { setShowRegister(true); setError(""); setRegisterSuccess(""); }}
            >
              Register
            </Button>
          </>
        )}
      </div>
    </div>
  );
} 