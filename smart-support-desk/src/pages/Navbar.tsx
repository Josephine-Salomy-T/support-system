import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  ticket?: { _id: string; title: string };
}

export default function Navbar() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const token = localStorage.getItem("token"); // assumes token is stored here

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggle = () => {
    if (user?.role === "admin") {
      if (location.pathname === "/admin-dashboard") navigate("/tickets");
      else navigate("/admin-dashboard");
    } else if (user?.role === "agent") {
      if (location.pathname === "/agent-dashboard") navigate("/agent-tickets");
      else navigate("/agent-dashboard");
    }
  };

  // --- Fetch notifications ---
  useEffect(() => {
    if (!token) return;
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();
  }, [token]);

  // --- Mark notification as read ---
  const markAsRead = async (id: string) => {
    try {
      await axios.post(`/notifications/read/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = Array.isArray(notifications)
  ? notifications.filter(n => !n.read).length
  : 0;


  // --- Styles ---
  const navStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 30px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 100,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const buttonStyle = {
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    marginLeft: 10,
    fontWeight: 500,
    transition: "all 0.2s ease-in-out",
  };

  const logoutButtonStyle = { ...buttonStyle, backgroundColor: "#ef4444" };
  const userStyle = { fontWeight: "bold", fontSize: 16, color: "#1f2937" };

  const dropdownStyle = {
    position: "absolute" as const,
    top: "50px",
    right: "20px",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "8px",
    width: "300px",
    maxHeight: "400px",
    overflowY: "auto" as const,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    zIndex: 200,
  };

  const notifItemStyle = (read: boolean) => ({
    padding: "10px 12px",
    borderBottom: "1px solid #eee",
    backgroundColor: read ? "#f9f9f9" : "#e0f2fe",
    cursor: "pointer",
  });

  return (
    <nav style={navStyle}>
      <div style={userStyle}>Welcome, {user?.name}</div>

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {/* Notifications Bell */}
        <div style={{ position: "relative", cursor: "pointer", marginRight: 10 }} onClick={() => setOpenDropdown(prev => !prev)}>
          🔔
          {unreadCount > 0 && (
            <span style={{
              position: "absolute",
              top: "-5px",
              right: "-5px",
              backgroundColor: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
            }}>
              {unreadCount}
            </span>
          )}
        </div>

        {/* Notifications Dropdown */}
        {openDropdown && (
  <div style={dropdownStyle}>
    {!Array.isArray(notifications) || notifications.length === 0 ? (
      <div style={{ padding: "10px" }}>No notifications</div>
    ) : (
      notifications.map(n => (
        <div
          key={n._id}
          style={notifItemStyle(n.read)}
          onClick={() => markAsRead(n._id)}
        >
          {n.message}
          <div style={{ fontSize: "11px", color: "#666" }}>
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))
    )}
  </div>
)}

        {/* Toggle and Logout Buttons */}
        {(user?.role === "admin" || user?.role === "agent") && (
          <button
            style={buttonStyle}
            onClick={handleToggle}
            onMouseOver={e => (e.currentTarget.style.backgroundColor = "#2563eb")}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = "#3b82f6")}
          >
            {location.pathname.includes("tickets") ? "Dashboard" : user?.role === "admin" ? "All Tickets" : "My Tickets"}
          </button>
        )}

        <button
          onClick={handleLogout}
          style={logoutButtonStyle}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = "#ef4444")}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
