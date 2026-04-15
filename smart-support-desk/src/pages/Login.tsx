import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../api/auth.api";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import { authService } from "../services/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const { showToast } = useToastContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginRequest({ email, password });
      authService.login(res.data.token, res.data.user);
      login(res.data.user, res.data.token);

      if (res.data.user.role === "admin") navigate("/admin-dashboard");
      else if (res.data.user.role === "agent") navigate("/agent-dashboard");
      else if (res.data.user.role === "employee") navigate("/employee-portal");
      else navigate("/login");
    } catch (err) {
      showToast("Invalid credentials", "error");
    }
  };

  const pageStyle: React.CSSProperties = {
    background: "#F6F9F8",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  };

  const formContainer = {
    display: "flex",
    flexDirection: "column" as const,
    width: "400px",
    maxWidth: "90vw",
    padding: "40px 36px",
    borderRadius: "12px",
    border: "1px solid #DDE8E5",
    boxShadow: "0 4px 24px rgba(14,124,107,0.08)",
    background: "#ffffff",
  };

  const inputStyle = {
    background: "#F6F9F8",
    border: "1px solid #DDE8E5",
    borderRadius: "6px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#0F2922",
    width: "100%",
    marginBottom: "16px",
    outline: "none" as const,
    transition: "all 150ms",
  };

  const inputFocus = {
    border: "1px solid #0E7C6B",
    boxShadow: "0 0 0 3px rgba(14,124,107,0.08)",
  };

  const buttonStyle = {
    background: "#0E7C6B",
    color: "white",
    width: "100%",
    padding: "11px",
    borderRadius: "6px",
    border: "none",
    fontWeight: 600,
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 150ms",
    marginTop: "4px",
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: "#4B6B63",
    marginBottom: "6px",
    display: "block",
  };

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit} style={formContainer}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "#0E7C6B",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 18,
            fontWeight: 700,
            color: "white",
          }}
        >
          T
        </div>
        <p style={{ fontSize: 13, color: "#4B6B63", textAlign: "center", marginBottom: 24 }}>TicketDesk</p>

        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0F2922", textAlign: "center", marginBottom: 6 }}>
          Welcome back
        </h2>
        <p style={{ fontSize: 13, color: "#8FA89F", textAlign: "center", marginBottom: "28px" }}>
          Sign in to your account
        </p>

        <label style={fieldLabel}>Email address</label>
        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.style.border = inputFocus.border;
            e.currentTarget.style.boxShadow = inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = inputStyle.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <label style={fieldLabel}>Password</label>
        <input
          type="password"
          style={inputStyle}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={(e) => {
            e.currentTarget.style.border = inputFocus.border;
            e.currentTarget.style.boxShadow = inputFocus.boxShadow;
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = inputStyle.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="submit"
          style={buttonStyle}
          onMouseOver={(e) => (e.currentTarget.style.background = "#0A5C4E")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#0E7C6B")}
        >
          Login
        </button>
      </form>
    </div>
  );
}
