import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import { authService } from "../services/auth";
import { getTickets, createTicket } from "../api/tickets.api";
import CommentThread from "../components/CommentThread.tsx";

interface Ticket {
  _id: string;
  ticketNumber?: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  userId?: {
    _id: string;
    name: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
  };
  activityLogs?: any[];
}


export default function EmployeePortal() {
  const { user } = useAuth();
  const { showToast } = useToastContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRaiseModal, setShowRaiseModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'conversation'>('details');
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    const token = authService.getToken()!;
    getTickets(token)
      .then((res) => {
        setTickets(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleRaise = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = authService.getToken()!;
    try {
      const res = await createTicket(form, token);
      setTickets((t) => [res.data, ...t]);
      setShowRaiseModal(false);
      setForm({ title: "", description: "" });
      showToast("Ticket raised successfully!", "success");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Something went wrong.", "error");
    }
  };

  const closeRaise = () => {
    setShowRaiseModal(false);
    setForm({ title: "", description: "" });
  };

  const openView = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveTab("details");
  };

  const closeView = () => {
    setSelectedTicket(null);
    setActiveTab("details");
  };

  const total = tickets.length;
  const openPending = tickets.filter((t) => t.status === "Open" || t.status === "Pending").length;
  const resolvedClosed = tickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  if (loading) {
    return <p style={{ padding: 40, textAlign: "center" }}>Loading tickets…</p>;
  }

  const page: React.CSSProperties = {
    padding: "0 32px 32px",
    paddingTop: 0,
    background: "#F6F9F8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  };

  const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 1100,
    marginBottom: 20,
  };

  const primaryBtn: React.CSSProperties = {
    background: "#0E7C6B",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  };

  const statsContainer: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    width: "100%",
    maxWidth: 1100,
    marginBottom: 24,
  };

  const statCardStyle = (color: string) => ({
    background: "#fff",
    border: "1px solid #DDE8E5",
    borderRadius: 10,
    padding: "16px 20px",
    borderLeft: `3px solid ${color}`,
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
  });

  const getTicketBorderColor = (status: string): string => {
    switch (status) {
      case "Open": return "#0E7C6B";
      case "Pending": return "#F59E0B";
      case "Resolved": return "#22C55E";
      case "Closed": return "#8FA89F";
      default: return "transparent";
    }
  };

  const statLabelStyle = {
    fontSize: 11,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#4B6B63",
    fontWeight: 500,
    marginTop: 8
  };



  const statValueStyle = {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0F2922",
    marginTop: 4
  };

  const badge = (background: string, color: string): React.CSSProperties => ({
    color,
    background,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
    textAlign: "center",
    display: "inline-flex",
    alignItems: "center",
  });

  const statusStyles: Record<string, { background: string; color: string }> = {
    Open: { background: "#E6F4F1", color: "#0E7C6B" },
    Pending: { background: "#FEF3C7", color: "#B45309" },
    Closed: { background: "#F1F5F9", color: "#4B6B63" },
    Resolved: { background: "#F0FDF4", color: "#16A34A" },
  };

  const priorityStyles: Record<string, { background: string; color: string }> = {
    High: { background: "#FEE2E2", color: "#DC2626" },
    Medium: { background: "#FEF3C7", color: "#B45309" },
    Low: { background: "#F0FDF4", color: "#16A34A" },
  };

  const ticketCard: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "3fr 1fr auto",
    alignItems: "center",
    background: "#fff",
    border: "1px solid #DDE8E5",
    padding: "16px 20px",
    borderRadius: 10,
    boxShadow: "0 1px 3px rgba(14,124,107,0.04)",
    gap: 12,
    width: "100%",
    maxWidth: 1100,
    marginBottom: 8,
    transition: "all 200ms ease",
  };

  const statusPriority: React.CSSProperties = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    justifyContent: "center",
    alignItems: "flex-start",
  };

  const iconColumn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    justifyContent: "center",
  };

  const viewBtn: React.CSSProperties = {
    ...primaryBtn,
    padding: "6px 12px",
    fontSize: 13,
  };

  const ticketListContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    width: "100%",
    gap: 12,
  };

  const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 41, 34, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
  };

  const modal: React.CSSProperties = {
    background: "#fff",
    // padding: 0,
    borderRadius: 16,
    width: 560,
    maxWidth: "90vw",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(14,124,107,0.12)",
    padding: '12px 15px'
  };

  const modalHeader: React.CSSProperties = {
    background: "linear-gradient(135deg, #0E7C6B, #0A5C4E)",
    padding: "24px 28px",
    color: "white"
  };

  const ticketNumBadge: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    background: "rgba(255,255,255,0.15)",
    padding: "3px 10px",
    borderRadius: 20,
    display: "inline-block",
    marginBottom: 8
  };

  const modalTitleWhite: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: "white",
    margin: 0
  };

  const modalBody: React.CSSProperties = {
    padding: "0px 15px"
  };

  const modalTitleStyle = {
    margin: 0,
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#0F2922",
    marginBottom: 20,
    borderBottom: "1px solid #DDE8E5",
    paddingBottom: 14
  };

  const modalCloseBtnStyle = {
    background: "transparent",
    border: "none",
    color: "#4B6B63",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
    marginTop: 8,
  };

  const modalInput: React.CSSProperties = {
    background: "#F6F9F8",
    border: "1px solid #DDE8E5",
    borderRadius: 6,
    padding: "10px 14px",
    fontSize: 13,
    color: "#0F2922",
    width: "100%",
    marginBottom: 12,
    outline: "none" as const,
    boxSizing: "border-box" as const,
  };

  const modalSaveBtn: React.CSSProperties = {
    background: "#0E7C6B",
    color: "#fff",
    borderRadius: 6,
    padding: "10px",
    width: "100%",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    marginTop: 4,
    transition: "background 150ms",
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: "#4B6B63",
    marginBottom: 6,
    display: "block" as const,
  };

  const tabStyle = (active: boolean): React.CSSProperties => ({
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #0E7C6B" : "2px solid transparent",
    color: active ? "#0E7C6B" : "#8FA89F",
    fontWeight: active ? 600 : 400,
    padding: "8px 16px",
    cursor: "pointer",
  });

  const emptyStyle: React.CSSProperties = {
    textAlign: "center" as const,
    padding: "60px 20px",
    color: "#4B6B63",
  };

  return (
    <div style={page}>
      <div style={header}>
        <h2>My Tickets</h2>
        <button
          style={primaryBtn}
          onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0A5C4E")}
          onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0E7C6B")}
          onClick={() => setShowRaiseModal(true)}
        >
          + Raise a Ticket
        </button>
      </div>

      <div style={statsContainer}>
        <div style={statCardStyle("#0E7C6B")}>
          <span style={statLabelStyle}>
            Total Raised
          </span>
          <div style={statValueStyle}>
            {total.toString()}
          </div>
        </div>
        <div style={statCardStyle("#2563EB")}>
          <span style={statLabelStyle}>
            Open/Pending
          </span>
          <div style={statValueStyle}>
            {openPending.toString()}
          </div>
        </div>
        <div style={statCardStyle("#22C55E")}>
          <span style={statLabelStyle}>
            Resolved/Closed
          </span>
          <div style={statValueStyle}>
            {resolvedClosed.toString()}
          </div>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div style={emptyStyle}>
          <h3 style={{ fontSize: 24, marginBottom: 8, margin: 0 }}>No tickets yet</h3>
          <p style={{ fontSize: 14, marginBottom: 20 }}>Raise your first ticket to get support.</p>
          <button
            style={primaryBtn}
            onClick={() => setShowRaiseModal(true)}
            onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0A5C4E")}
            onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0E7C6B")}
          >
            + Raise a Ticket
          </button>
        </div>
      ) : (
        <div style={ticketListContainer}>
          {tickets.map((t) => (
            <div
              key={t._id}
              style={{
                ...ticketCard,
                borderLeft: `3px solid ${getTicketBorderColor(t.status)}`
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.boxShadow = "0 6px 20px rgba(14,124,107,0.15)";
                target.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget as HTMLDivElement;
                target.style.boxShadow = "0 1px 3px rgba(14,124,107,0.04)";
                target.style.transform = "translateY(0)";
              }}
            >
              <div>
                <span style={{
                  fontSize: 11, color: '#8FA89F',
                  fontWeight: 600, marginRight: 6
                }}>
                  #{t.ticketNumber || 'TBD'}
                </span>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#0F2922" }}>{t.title}</h4>
                <p style={{ margin: "4px 0", color: "#4B6B63", fontSize: 13 }}>
                  {t.description}
                </p>
                <span style={{ color: "#8FA89F", fontSize: 12 }}>
                  {new Date(t.createdAt).toLocaleString()}
                </span>
              </div>


              <div style={statusPriority}>
                <span
                  style={badge(
                    statusStyles[t.status]?.background || "#F1F5F9",
                    statusStyles[t.status]?.color || "#4B6B63"
                  )}
                >
                  {t.status}
                </span>
              </div>

              <div style={iconColumn}>
                <button
                  style={viewBtn}
                  onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0A5C4E")}
                  onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#0E7C6B")}
                  onClick={() => openView(t)}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRaiseModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={modalTitleStyle}>
              Raise a Ticket
            </h3>
            <form onSubmit={handleRaise} style={{ display: "grid", gap: 12 }}>
              <input
                style={modalInput}
                placeholder="Ticket title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                style={{ ...modalInput, minHeight: 120, resize: "vertical" }}
                placeholder="Describe your issue in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
              />
              <button type="submit" style={modalSaveBtn}>
                Raise Ticket
              </button>
            </form>
            <button
              onClick={closeRaise}
              style={modalCloseBtnStyle}
              onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#0F2922")}
              onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#4B6B63")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedTicket && (
        <div style={overlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <span style={ticketNumBadge}>
                #{selectedTicket.ticketNumber || 'TBD'}
              </span>
              <h3 style={modalTitleWhite}>
                {selectedTicket.title}
              </h3>
            </div>

            <div style={{
              display: "flex",
              borderBottom: "1px solid #DDE8E5",
              marginBottom: 20
            }}>
              {(["details", "conversation"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  style={tabStyle(activeTab === tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "details" && (
              <div style={modalBody}>
                {/* Description Card */}
                <div style={{
                  background: '#F6F9F8',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16
                }}>
                  <div style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.07em',
                    color: '#8FA89F',
                    marginBottom: 6
                  }}>
                    Description
                  </div>
                  <div style={{
                    fontSize: 13,
                    color: '#0F2922',
                    lineHeight: 1.6
                  }}>
                    {selectedTicket.description}
                  </div>
                </div>

                {/* 2-column grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginBottom: 16
                }}>
                  {/* Status */}
                  <div style={{
                    background: '#F6F9F8',
                    borderRadius: 8,
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8FA89F',
                      marginBottom: 8
                    }}>
                      Status
                    </div>
                    <span
                      style={badge(
                        statusStyles[selectedTicket.status]?.background || "#F1F5F9",
                        statusStyles[selectedTicket.status]?.color || "#4B6B63"
                      )}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>

                  {/* Priority */}
                  <div style={{
                    background: '#F6F9F8',
                    borderRadius: 8,
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8FA89F',
                      marginBottom: 8
                    }}>
                      Priority
                    </div>
                    <span
                      style={badge(
                        priorityStyles[selectedTicket.priority]?.background || "#F1F5F9",
                        priorityStyles[selectedTicket.priority]?.color || "#4B6B63"
                      )}
                    >
                      {selectedTicket.priority}
                    </span>
                  </div>

                  {/* Created */}
                  <div style={{
                    background: '#F6F9F8',
                    borderRadius: 8,
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8FA89F',
                      marginBottom: 6
                    }}>
                      Created
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#0F2922',
                      fontWeight: 500
                    }}>
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Assigned To */}
                  <div style={{
                    background: '#F6F9F8',
                    borderRadius: 8,
                    padding: '12px 16px'
                  }}>
                    <div style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      color: '#8FA89F',
                      marginBottom: 6
                    }}>
                      Assigned To
                    </div>
                    <div style={{
                      fontSize: 13,
                      color: '#0F2922',
                      fontWeight: 500
                    }}>
                      {selectedTicket.assignedTo?.name || (
                        <span style={{ color: '#8FA89F', fontStyle: 'italic' }}>
                          Being assigned...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "conversation" && (
              <div style={{ minHeight: 300, margin: '0px 10px', }}>
                <CommentThread ticketId={selectedTicket._id} currentUser={user} ticketTitle={selectedTicket.title} ticketDescription={selectedTicket.description} />

              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <button
                onClick={closeView}
                style={{
                  background: "transparent",
                  border: "1px solid #DDE8E5",
                  color: "#4B6B63",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontSize: 13,
                  cursor: "pointer",
                  fontWeight: 500,
                  margin: "10px 15px"
                }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#0F2922";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#0E7C6B";
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "#4B6B63";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "#DDE8E5";
              }}
              >
              Close
            </button>
          </div>
        </div>
        </div>
  )
}
    </div >
  );
}

