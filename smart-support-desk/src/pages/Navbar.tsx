import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../api/notifications.api";
import { authService } from "../services/auth";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  ticket?: { _id: string; title: string };
  type?: string;
}

const navStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 100,
  background: "#ffffff",
  borderBottom: "1px solid #DDE8E5",
  height: "56px",
  padding: "0 28px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const primaryNavButtonStyle: CSSProperties = {
  background: "#0E7C6B",
  color: "white",
  border: "none",
  borderRadius: "6px",
  padding: "8px 16px",
  fontWeight: 600,
  fontSize: "13px",
  cursor: "pointer",
};

const logoutNavButtonStyle: CSSProperties = {
  background: "transparent",
  border: "1px solid #DDE8E5",
  color: "#4B6B63",
  borderRadius: "6px",
  padding: "8px 16px",
  fontSize: "13px",
  cursor: "pointer",
};

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openDropdown, setOpenDropdown] = useState(false);

  const token = authService.getToken();
  const user = authService.getUser();

  const handleLogout = () => {
    authService.logout();
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

  const isAgentDashboard = location.pathname === "/agent-dashboard";
  const isTicketsPage =
    location.pathname === "/tickets" || location.pathname === "/agent-tickets";

  const displayName = user?.name?.trim() || "User";
  const initial = displayName.charAt(0).toUpperCase() || "?";
  const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "agent" ? "Agent" : "Employee";

  const primaryLabel = isTicketsPage
    ? "Dashboard"
    : isAgentDashboard
      ? "My Tickets"
      : "All Tickets";

  useEffect(() => {
    if (!token) return;

    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications(token);
        if (!isMounted) return;
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    // initial fetch
    fetchNotifications();

    // polling every 5 seconds
    const intervalId = window.setInterval(fetchNotifications, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationRead(id, token);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read", err);
    }
  };

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter(n => !n.read).length
    : 0;

  const dropdownStyle: CSSProperties = {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "360px",
    background: "#ffffff",
    border: "1px solid #DDE8E5",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(14,124,107,0.12)",
    zIndex: 200,
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const listBodyStyle: CSSProperties = {
    maxHeight: 360,
    overflowY: "auto",
  };

  const notifItemStyle = (read: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "flex-start",
    padding: "12px 16px",
    borderBottom: "1px solid #F6F9F8",
    background: read ? "#ffffff" : "#F0FAF7",
    cursor: "pointer",
    transition: "background 150ms ease-in-out",
  });

  const getTypeDotColor = (type?: string) => {
    switch (type) {
      case "reassigned":
        return "#F59E0B";
      case "assigned":
        return "#0E7C6B";
      case "status_changed":
        return "#2563EB";
      case "resolved":
        return "#16A34A";
      default:
        return "#8FA89F";
    }
  };

  return (
    <nav style={navStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "#0E7C6B",
            color: "#ffffff",
            fontSize: "13px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {initial}
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#0F2922" }}>
            {displayName}
          </div>
          <div style={{ fontSize: "11px", color: "#4B6B63" }}>{roleLabel}</div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <button
          type="button"
          aria-label="Notifications"
          style={{
            position: "relative",
            cursor: "pointer",
            color: "#4B6B63",
            fontSize: 18,
            lineHeight: 1,
            border: "none",
            background: "transparent",
            padding: 0,
          }}
          onClick={() => setOpenDropdown(prev => !prev)}
        >
          🔔
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                backgroundColor: "#DC2626",
                color: "#ffffff",
                borderRadius: "50%",
                width: "16px",
                height: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {openDropdown && (
          <div style={dropdownStyle}>
            <div
              style={{
                padding: "14px 16px",
                borderBottom: "1px solid #DDE8E5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#0F2922",
                }}
              >
                Notifications
              </span>
              <button
                type="button"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#0E7C6B",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
                onClick={markAllAsRead}
              >
                Mark all as read
              </button>
            </div>

            {!Array.isArray(notifications) || notifications.length === 0 ? (
              <div
                style={{
                  padding: "32px 16px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#8FA89F",
                }}
              >
                No notifications yet
              </div>
            ) : (
              <div style={listBodyStyle} className="notif-scroll">
                {notifications.map(n => {
                  const read = n.read;
                  const typeColor = getTypeDotColor(n.type);
                  return (
                    <div
                      key={n._id}
                      style={notifItemStyle(read)}
                      onClick={() => markAsRead(n._id)}
                      onMouseOver={e => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          "#F6F9F8";
                      }}
                      onMouseOut={e => {
                        (e.currentTarget as HTMLDivElement).style.background =
                          read ? "#ffffff" : "#F0FAF7";
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: typeColor,
                          marginRight: 10,
                          marginTop: 4,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#0F2922",
                            fontWeight: read ? 400 : 600,
                            lineHeight: 1.4,
                          }}
                        >
                          {n.message}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#8FA89F",
                            marginTop: 3,
                          }}
                        >
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!read && (
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "#0E7C6B",
                            marginLeft: 8,
                            marginTop: 6,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {(user?.role === "admin" || user?.role === "agent") && (
          <button type="button" style={primaryNavButtonStyle} onClick={handleToggle}>
            {primaryLabel}
          </button>
        )}

        <button
          type="button"
          onClick={handleLogout}
          style={logoutNavButtonStyle}
          onMouseOver={e => {
            e.currentTarget.style.background = "var(--bg-hover, #EFF5F3)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
