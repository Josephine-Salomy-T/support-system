import { useEffect, useState } from "react";
import { getAgentDashboard } from "../api/dashboard.api";

export default function AgentDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getAgentDashboard(token)
      .then(res => {setData(res.data); console.log("Data",res.data)})
      .catch(err => console.error("Failed to fetch agent dashboard:", err));
  }, []);

  if (!data) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  const recentTickets = data.tickets || [];

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 20,
  };

  const cardStyle: React.CSSProperties = {
    background: "#fff",
    padding: "16px 20px",
    borderRadius: 10,
    border: "1px solid #DDE8E5",
    boxShadow: "0 1px 4px rgba(14,124,107,0.05)",
    transition: "all 150ms",
  };

  const recentTicketCard: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "16px 20px",
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #DDE8E5",
    boxShadow: "0 1px 3px rgba(14,124,107,0.04)",
    gap: 12,
    marginBottom: 8,
    transition: "all 150ms",
  };

  const leftColumn: React.CSSProperties = {
    flex: 2,
    display: "flex",
    flexDirection: "column",
  };

  const middleColumn: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };

  const rightColumn: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    justifyContent: "center",
  };

  const badgeSmall = (background: string, color: string): React.CSSProperties => ({
    color,
    background,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  });

  const statusStyle = (s: string) =>
    s === "Open"
      ? { background: "#E6F4F1", color: "#0E7C6B" }
      : s === "Pending"
        ? { background: "#FEF3C7", color: "#B45309" }
        : s === "Resolved"
          ? { background: "#F0FDF4", color: "#16A34A" }
          : { background: "#F1F5F9", color: "#4B6B63" };

  const priorityStyle = (p: string) =>
    p === "Low"
      ? { background: "#F0FDF4", color: "#16A34A" }
      : p === "Medium"
        ? { background: "#FEF3C7", color: "#B45309" }
        : { background: "#FEE2E2", color: "#DC2626" };


  return (
    <div style={{ padding: "0 28px 32px", paddingTop: 0, background: "#F6F9F8", minHeight: "100vh", maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#0F2922", marginBottom: 24 }}>
        Agent Dashboard
      </h2>

      <div style={containerStyle}>
        <div
          style={{ ...cardStyle, borderLeft: "3px solid #0E7C6B", background: "#F0FAF7" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <span style={{ width: 8, height: 8, background: "#0E7C6B", borderRadius: 2, display: "inline-block", marginBottom: 4 }} />
          <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#4B6B63", marginBottom: 4 }}>Total Tickets Assigned</h3>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0F2922", fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>{data.total ?? 0}</p>
          <p style={{ marginTop: 4, fontSize: 12, color: "#8FA89F" }}>assigned to you</p>
        </div>
        <div
          style={{ ...cardStyle, borderLeft: "3px solid #2563EB" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <span style={{ width: 8, height: 8, background: "#2563EB", borderRadius: 2, display: "inline-block", marginBottom: 4 }} />
          <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#4B6B63", marginBottom: 4 }}>Open Tickets</h3>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0F2922", fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>{data.open ?? 0}</p>
          <p style={{ marginTop: 4, fontSize: 12, color: "#8FA89F" }}>currently open</p>
        </div>
        <div
          style={{ ...cardStyle, borderLeft: "3px solid #8FA89F" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <span style={{ width: 8, height: 8, background: "#8FA89F", borderRadius: 2, display: "inline-block", marginBottom: 4 }} />
          <h3 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "#4B6B63", marginBottom: 4 }}>Closed Tickets</h3>
          <p style={{ fontSize: "1.875rem", fontWeight: 700, color: "#0F2922", fontVariantNumeric: "tabular-nums", lineHeight: 1.05 }}>{(data.closed ?? 0) + (data.resolved ?? 0)}</p>
          <p style={{ marginTop: 4, fontSize: 12, color: "#8FA89F" }}>resolved tickets</p>
        </div>
      </div>

      <h3 style={{ marginTop: 24, marginBottom: 12, fontSize: 13, fontWeight: 600, color: "#0F2922", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Recent Tickets
      </h3>
      {recentTickets.length === 0 ? (
        <p>No tickets assigned yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentTickets.map((t: any) => (
            <div
              key={t._id}
              style={recentTicketCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 3px 10px rgba(14,124,107,0.08)";
                e.currentTarget.style.borderColor = "#0E7C6B";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,124,107,0.04)";
                e.currentTarget.style.borderColor = "#DDE8E5";
              }}
            >
              <div style={leftColumn}>
                <span style={{ 
                  fontSize: 11, color: '#8FA89F', 
                  fontWeight: 600, marginRight: 6 
                }}>
                  #{t.ticketNumber || 'TBD'}
                </span>
                <strong style={{ fontSize: 14, fontWeight: 600, color: "#0F2922" }}>{t.title}</strong>
                <p style={{ fontSize: 13, color: "#4B6B63", marginTop: 4 }}>
                  {t.description}
                </p>
              </div>

              <div style={middleColumn}>
                <div style={{ fontSize: 12, color: "#8FA89F" }}>
                  👤 Creator: {t.userId?.name || "Unassigned"}
                </div>
              </div>
              <div style={rightColumn}>
                <span style={badgeSmall(statusStyle(t.status).background, statusStyle(t.status).color)}>{t.status}</span>
                <span style={{ ...badgeSmall(priorityStyle(t.priority).background, priorityStyle(t.priority).color), marginTop: 6 }}>
                  {t.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
