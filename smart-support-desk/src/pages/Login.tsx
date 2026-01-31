import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginRequest({ email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else navigate("/agent-dashboard");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const formContainer = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "15px",
    width: "350px",
    margin: "80px auto",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
    background: "#ffffff",
    fontFamily: "Inter, sans-serif",
  };

  const inputStyle = {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none" as const,
    transition: "border 0.2s",
  };

  const inputFocus = {
    border: "1px solid #3b82f6",
  };

  const buttonStyle = {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 600,
    fontSize: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <form onSubmit={handleSubmit} style={formContainer}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#111827" }}>Login</h2>
      <input
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onFocus={(e) => (e.currentTarget.style.border = inputFocus.border)}
        onBlur={(e) => (e.currentTarget.style.border = inputStyle.border)}
      />
      <input
        type="password"
        style={inputStyle}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onFocus={(e) => (e.currentTarget.style.border = inputFocus.border)}
        onBlur={(e) => (e.currentTarget.style.border = inputStyle.border)}
      />
      <button
        type="submit"
        style={buttonStyle}
        onMouseOver={(e) => (e.currentTarget.style.background = "#2563eb")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#3b82f6")}
      >
        Login
      </button>
    </form>
  );
}
