import { useEffect, useState } from "react";
import { getAdminDashboard } from "../api/dashboard.api";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getAdminDashboard(token)
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) {
    return <p style={{ textAlign: "center", marginTop: 80 }}>Loading dashboard…</p>;
  }

  const agents = data.agents || [];
  const recentTickets = data.recentTickets || [];

  /* -------------------- Charts -------------------- */

  const pieData = {
    labels: ["Open", "Pending", "Closed"],
    datasets: [
      {
        data: [
          data.openTickets ?? 0,
          data.pendingTickets ?? 0,
          data.closedTickets ?? 0
        ],
        backgroundColor: ["#0E7C6B", "#F59E0B", "#8FA89F"],
        borderWidth: 0,
      },
    ],
  };

  const agentBarData = {
    labels: agents.map((a: any) => a.name || "Agent"),
    datasets: [
      {
        label: "Open",
        data: agents.map((a: any) => a.open ?? 0),
        backgroundColor: "#0E7C6B",
        barThickness: 40,
        borderRadius: 4,
        borderSkipped: "bottom" as const,
      },
      {
        label: "Closed",
        data: agents.map((a: any) => a.closed ?? 0),
        backgroundColor: "#8FA89F",
        barThickness: 40,
        borderRadius: 4,
        borderSkipped: "bottom" as const,
      },
      {
        label: "Pending",
        data: agents.map((a: any) => a.pending ?? 0),
        backgroundColor: "#F59E0B",
        barThickness: 40,
        borderRadius: 4,
        borderSkipped: "bottom" as const,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "var(--text-2)", font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: "#FFFFFF",
        borderColor: "var(--border)",
        borderWidth: 1,
        cornerRadius: 8,
        titleColor: "var(--text-1)",
        bodyColor: "var(--accent)",
        padding: 10,
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: "var(--text-2)", font: { size: 12 } },
        grid: { color: "#DDE8E5", borderDash: [4, 4] },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: { color: "var(--text-2)", font: { size: 12 } },
        grid: { color: "#DDE8E5", borderDash: [4, 4] },
      },
    },
  };


  const page = {
    padding: "0 28px 32px",
    paddingTop: 0,
    background: "#F6F9F8",
    minHeight: "100vh",
    maxWidth: 1200,
    margin: "0 auto",
  };

  const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  };

  const card = {
    background: "#ffffff",
    padding: 20,
    borderRadius: 10,
    border: "1px solid #DDE8E5",
    boxShadow: "0 1px 4px rgba(14,124,107,0.05)",
  };

  const statCard = (accent: string) => ({
    ...card,
    borderTop: "1px solid #DDE8E5",
    borderRight: "1px solid #DDE8E5",
    borderBottom: "1px solid #DDE8E5",
    borderLeft: `3px solid ${accent}`,
    transition: "box-shadow 150ms",
  });

  const sectionTitle = {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-1)",
    marginBottom: 16,
  };


  const recentTicketCard: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "12px 16px",
    background: "#f8fafc",
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
    s === "Open" ? "#0E7C6B" : s === "Closed" ? "#8FA89F" : "#F59E0B";

  const priorityColor = (p: string) =>
    p === "Low" ? "#057A55" : p === "Medium" ? "#F59E0B" : "#DC2626";

  const totalCount = (data.openTickets ?? 0) + (data.pendingTickets ?? 0) + (data.closedTickets ?? 0) + (data.resolvedTickets ?? 0);
  const percent = (count: number) => (totalCount ? Math.round((count / totalCount) * 100) : 0);


  /* -------------------- UI -------------------- */

  return (
    <div style={page}>
      <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-1)" }}>Admin Dashboard</h2>
      <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 28 }}>
        Ticket operations and team workload overview
      </p>

      {/* Summary */}
      <div style={grid4}>
        <div
          style={statCard("#0E7C6B")}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-2)", marginBottom: 8 }}>
            Total Tickets
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {data.totalTickets}
          </div>
          <span style={{ display: "inline-flex", marginTop: 10, padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "var(--accent-light)", color: "var(--accent)" }}>
            Total
          </span>
        </div>
        <div
          style={statCard("#2563EB")}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-2)", marginBottom: 8 }}>
            Open
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {data.openTickets}
          </div>
          <span style={{ display: "inline-flex", marginTop: 10, padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "#E6F4F1", color: "#0E7C6B" }}>
            Open
          </span>
        </div>
        <div
          style={statCard("#8FA89F")}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-2)", marginBottom: 8 }}>
            Closed
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {(data.closedTickets ?? 0) + (data.resolvedTickets ?? 0)}
          </div>
          <span style={{ display: "inline-flex", marginTop: 10, padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "#F1F5F9", color: "#4B6B63" }}>
            Closed
          </span>
        </div>
        <div
          style={statCard("#F59E0B")}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(14,124,107,0.10)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 1px 4px rgba(14,124,107,0.05)")}
        >
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-2)", marginBottom: 8 }}>
            Pending
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--text-1)", fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
            {data.pendingTickets}
          </div>
          <span style={{ display: "inline-flex", marginTop: 10, padding: "3px 10px", borderRadius: 20, fontSize: 11, background: "#FEF3C7", color: "#B45309" }}>
            Pending
          </span>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 24,
        }}
      >
        <div style={{ ...card, height: 320 }}>
          <div style={sectionTitle}>Open vs Pending vs Closed</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, height: 250 }}>
            <div style={{ flex: 1, minWidth: 180, height: 230 }}>
              <Pie
                data={pieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: "60%",
                  plugins: { legend: { display: false } },
                }}
              />
            </div>
            <div style={{ width: 150, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#0E7C6B", display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text-1)" }}>Open</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{data.openTickets ?? 0}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{percent(data.openTickets ?? 0)}%</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text-1)" }}>Pending</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{data.pendingTickets ?? 0}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{percent(data.pendingTickets ?? 0)}%</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#8FA89F", display: "inline-block" }} />
                  <span style={{ fontSize: 13, color: "var(--text-1)" }}>Closed</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{(data.closedTickets ?? 0) + (data.resolvedTickets ?? 0)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)" }}>{percent((data.closedTickets ?? 0) + (data.resolvedTickets ?? 0))}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ ...card, height: 320 }}>
          <div style={sectionTitle}>Agent Ticket Distribution</div>
          <Bar data={agentBarData} options={barOptions} />
        </div>
      </div>

      {/* Recent Tickets */}
      <div style={{ ...card, marginTop: 36 }}>
        <div style={sectionTitle}>Recent Tickets</div>

        {recentTickets.length === 0 ? (
          <p>No recent tickets</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentTickets.map((t: any) => (
              <div key={t._id} style={recentTicketCard}>

                <div style={leftColumn}>
                  <span style={{ 
                    fontSize: 11, color: '#8FA89F', 
                    fontWeight: 600, marginRight: 6 
                  }}>
                    #{t.ticketNumber || 'TBD'}
                  </span>
                  <strong style={{ fontSize: 16 }}>{t.title}</strong>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    {t.description}
                  </p>
                </div>


                <div style={middleColumn}>
                  <div style={{ fontSize: 13, color: "#64748b" }}>
                    👤 Creator: {t.userId?.name || "Unassigned"}
                  </div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    🧑‍💼 Assigned To: {t.assignedTo?.name || "Unassigned"}
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


    </div>
  );
}
