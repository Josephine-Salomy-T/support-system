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
        backgroundColor: ["#22c55e", "#ef4444", "#3b82f6"],
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
        backgroundColor: "#22c55e",
        barThickness: 40,
      },
      {
        label: "Closed",
        data: agents.map((a: any) => a.closed ?? 0),
        backgroundColor: "#3b82f6",
        barThickness: 40,
      },
      {
        label: "Pending",
        data: agents.map((a: any) => a.pending ?? 0),
        backgroundColor: "#ef4444",
        barThickness: 40,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };


  const page = {
    padding: "32px 40px",
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui, sans-serif",
  };

  const grid4 = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 20,
    marginTop: 24,
  };

  const card = {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  };

  const statCard = (bg: string) => ({
    ...card,
    background: bg,
    color: "#fff",
    textAlign: "center" as const,
  });

  const sectionTitle = {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 12,
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
    s === "Open" ? "#22c55e" : s === "Closed" ? "#3b82f6" : "#ef4444";

  const priorityColor = (p: string) =>
    p === "Low" ? "#22c55e" : p === "Medium" ? "#f59e0b" : "#ef4444";


  /* -------------------- UI -------------------- */

  return (
    <div style={page}>
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>Admin Dashboard</h2>

      {/* Summary */}
      <div style={grid4}>
        <div style={statCard("#ffb020")}>
          <div>Total Tickets</div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{data.totalTickets}</div>
        </div>
        <div style={statCard("#22c55e")}>
          <div>Open</div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{data.openTickets}</div>
        </div>
        <div style={statCard("#3b82f6")}>
          <div>Closed</div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{data.closedTickets}</div>
        </div>
        <div style={statCard("#ef4444")}>
          <div>Pending</div>
          <div style={{ fontSize: 30, fontWeight: 700 }}>{data.pendingTickets}</div>
        </div>
      </div>

      {/* Charts */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          marginTop: 36,
          alignItems: "center", // vertically center charts
        }}
      >
        <div style={{ ...card, paddingBottom: "50px", flex: "1 1 300px", height: 320 }}>
          <div style={sectionTitle}>Open vs Pending vs Closed</div>
          <Pie data={pieData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
              },
            }}
          />
        </div>

        <div style={{ ...card, flex: "2 1 500px", height: 320 }}>
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
