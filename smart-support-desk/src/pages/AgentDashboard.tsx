import { useEffect, useState } from "react";
import { getAgentDashboard } from "../api/dashboard.api";

export default function AgentDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getAgentDashboard(token)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to fetch agent dashboard:", err));
  }, []);

  if (!data) return <p style={{ textAlign: "center", marginTop: 50 }}>Loading...</p>;

  const recentTickets = data.tickets || [];

  const containerStyle = {
    display: "flex",
    flexWrap: "wrap" as const,
    marginTop: 20,
  };

  const cardStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    flex: 1,
    margin: 10,
    minWidth: 150,
    textAlign: "center" as const,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const recentTicketCard: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 16px",
    background: "#fafafa",
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    gap: 12,
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

  const badgeSmall = (bg: string): React.CSSProperties => ({
    color: "#fff",
    background: bg,
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  });

  const statusColor = (s: string) =>
    s === "Open" ? "#ff9800" : s === "Closed" ? "#4caf50" : "#ef4444";

  const priorityColor = (p: string) =>
    p === "Low" ? "#22c55e" : p === "Medium" ? "#f59e0b" : "#ef4444";


  return (
    <div style={{ padding: 30, background: "#f5f5f5", minHeight: "100vh" }}>
      <h2 style={{ textAlign: "center", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        Agent Dashboard
      </h2>

      <div style={containerStyle}>
        <div style={{ ...cardStyle, background: "#4caf50", color: "#fff" }}>
          <h3>Total Tickets Assigned</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{data.total ?? 0}</p>
        </div>
        <div style={{ ...cardStyle, background: "#ff9800", color: "#fff" }}>
          <h3>Open Tickets</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{data.open ?? 0}</p>
        </div>
        <div style={{ ...cardStyle, background: "#2196f3", color: "#fff" }}>
          <h3>Closed Tickets</h3>
          <p style={{ fontSize: 24, fontWeight: "bold" }}>{data.closed ?? 0}</p>
        </div>
      </div>

      <h3 style={{ marginTop: 40 }}>Recent Tickets</h3>
      {recentTickets.length === 0 ? (
        <p>No tickets assigned yet</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {recentTickets.map((t: any) => (
            <div key={t._id} style={recentTicketCard}>
              <div style={leftColumn}>
                <strong style={{ fontSize: 16 }}>{t.title}</strong>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  {t.description}
                </p>
              </div>
              <div style={middleColumn}>
                <div style={{ fontSize: 13, color: "#64748b" }}>
                  👤 Creator: {t.userId?.name || "Unassigned"}
                </div>
              </div>
              <div style={rightColumn}>
                <span style={badgeSmall(statusColor(t.status))}>{t.status}</span>
                <span style={{ ...badgeSmall(priorityColor(t.priority)), marginTop: 6 }}>
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
