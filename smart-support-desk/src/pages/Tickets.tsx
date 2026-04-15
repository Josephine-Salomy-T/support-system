import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TicketTimeline from "./TicketTimeline";
import { useToastContext } from "../context/ToastContext";
// @ts-ignore
import { authService } from "../services/auth";

import { getTickets } from "../api/tickets.api";
import { createTicket } from "../api/tickets.api";
import { updateTicket } from "../api/tickets.api";
import { deleteTicket } from "../api/tickets.api";
import { getUsers } from "../api/user.api";
import CommentThread from "../components/CommentThread.tsx";
import ConfirmModal from "../components/ConfirmModal.tsx";



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



export default function Tickets() {
    const { user } = useAuth();
    const { showToast } = useToastContext();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [agents, setAgents] = useState<{ _id: string; name: string }[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [priorityFilter, setPriorityFilter] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
    const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'conversation'>('details');

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Open",
        priority: "Medium",
        assignedTo: "",
    });

    useEffect(() => {
        getTickets(authService.getToken()!)
            .then((res) => {
                console.log("Tickets", res.data)
                setTickets(res.data);
                setFilteredTickets(res.data);
            })
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (user?.role === "admin") {
            getUsers(authService.getToken()!).then((res) => setAgents(res.data));
        }
    }, [user]);

    useEffect(() => {
        let temp = [...tickets];

        if (searchTerm)
            temp = temp.filter((t) =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

        if (statusFilter) temp = temp.filter((t) => t.status === statusFilter);
        if (priorityFilter) temp = temp.filter((t) => t.priority === priorityFilter);

        temp.sort((a, b) =>
            sortOrder === "asc"
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setFilteredTickets(temp);
    }, [tickets, searchTerm, statusFilter, priorityFilter, sortOrder]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = authService.getToken()!;

        try {
            if (editingTicket) {
                console.log("editingTicket", editingTicket._id)
                // const res = await updateTicket(editingTicket._id, form, token);
                const payload: any = {
                    title: form.title,
                    description: form.description,
                    status: form.status,
                    priority: form.priority,
                };

                // ONLY admin can send assignedTo
                if (user?.role === "admin" && form.assignedTo) {
                    payload.assignedTo = form.assignedTo;
                }

                const res = await updateTicket(editingTicket._id, payload, token);
                setTickets((t) => t.map((x) => (x._id === editingTicket._id ? res.data : x)));
                setEditingTicket(null);
                showToast("Ticket updated successfully!", "success");
            } else {
                const res = await createTicket(form, token);
                setTickets((t) => [...t, res.data]);
                setShowCreateModal(false);
                showToast("Ticket created successfully!", "success");
            }

            setForm({ title: "", description: "", status: "Open", priority: "Medium", assignedTo: "" });
        } catch (err: any) {
            console.error(err);
            showToast(err?.response?.data?.message || "Something went wrong. Please try again.", "error");
        }
    };

    const handleDelete = (id: string) => {
        setTicketToDelete(id);
    };

    const confirmDelete = async () => {
        if (!ticketToDelete) return;
        try {
            await deleteTicket(ticketToDelete, authService.getToken()!);
            setTickets((t) => t.filter((x) => x._id !== ticketToDelete));
            showToast("Ticket deleted successfully!", "warning");
        } catch (err: any) {
            console.error(err);
            showToast(err?.response?.data?.message || "Something went wrong. Please try again.", "error");
        } finally {
            setTicketToDelete(null);
        }
    };

    const cancelDelete = () => {
        setTicketToDelete(null);
    };


    if (loading) return <p style={{ padding: 40 }}>Loading tickets…</p>;

    return (
        <div style={page}>
            {/* Header */}
            <div style={header}>
                <h2>Tickets</h2>
                <button
                    style={primaryBtn}
                    onMouseOver={(e) => (e.currentTarget.style.background = "#0A5C4E")}
                    onMouseOut={(e) => (e.currentTarget.style.background = "#0E7C6B")}
                    onClick={() => setShowCreateModal(true)}
                >
                    + Create Ticket
                </button>
            </div>

            {/* Filters */}
            <div style={card}>
                <div style={filters}>
                    <input
                        placeholder="Search tickets…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={input}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0E7C6B")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE8E5")}
                    />
                    <select
                        style={{ ...input, color: "#4B6B63" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0E7C6B")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE8E5")}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option>Open</option>
                        <option>Pending</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                    </select>
                    <select
                        style={{ ...input, color: "#4B6B63" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0E7C6B")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE8E5")}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="">All Priority</option>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                    <select
                        style={{ ...input, color: "#4B6B63" }}
                        onFocus={(e) => (e.currentTarget.style.borderColor = "#0E7C6B")}
                        onBlur={(e) => (e.currentTarget.style.borderColor = "#DDE8E5")}
                        onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                    >
                        <option value="desc">Newest</option>
                        <option value="asc">Oldest</option>
                    </select>
                </div>
            </div>

            {/* Ticket List */}
            <div style={ticketListContainer}>
                {filteredTickets.length === 0 && (
                    <p style={{ textAlign: "center", padding: 20 }}>No tickets found</p>
                )}

                {filteredTickets.map((t) => (
                    <div
                        key={t._id}
                        style={ticketCard}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = "0 3px 10px rgba(14,124,107,0.08)";
                            e.currentTarget.style.borderColor = "#0E7C6B";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = "0 1px 3px rgba(14,124,107,0.04)";
                            e.currentTarget.style.borderColor = "#DDE8E5";
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
                                style={badge((statusStyles[t.status] || { background: "#F1F5F9", color: "#4B6B63" }).background, (statusStyles[t.status] || { background: "#F1F5F9", color: "#4B6B63" }).color)}
                            >
                                {t.status}
                            </span>
                            <span
                                style={badge((priorityStyles[t.priority] || { background: "#F1F5F9", color: "#4B6B63" }).background, (priorityStyles[t.priority] || { background: "#F1F5F9", color: "#4B6B63" }).color)}
                            >
                                {t.priority}
                            </span>
                            <span style={{ fontSize: 12, color: "#4B6B63" }}>
                                👤 Creator: {t.userId?.name || "Unassigned"}
                            </span>
                            <span style={{ fontSize: 12, color: "#4B6B63" }}>
                                🧑‍💼 Assigned To: {t.assignedTo?.name || "Unassigned"}
                            </span>
                        </div>


                        <div style={iconColumn}>
                            <button
                                onClick={() => {
                                    setEditingTicket(t);
                                    setForm({
                                        title: t.title || "",
                                        description: t.description || "",
                                        status: t.status || "Open",
                                        priority: t.priority || "Medium",
                                        assignedTo: t.assignedTo?._id || "",
                                    });
                                }}
                                style={iconBtn}
                                title="Edit Ticket"
                                onMouseOver={(e) => (e.currentTarget.style.color = "#0E7C6B")}
                                onMouseOut={(e) => (e.currentTarget.style.color = "#4B6B63")}
                            >
                                ✏️
                            </button>

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => handleDelete(t._id)}
                                    style={iconBtn}
                                    title="Delete Ticket"
                                    onMouseOver={(e) => (e.currentTarget.style.color = "#DC2626")}
                                    onMouseOut={(e) => (e.currentTarget.style.color = "#8FA89F")}
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {(showCreateModal || editingTicket) && (
                <Modal
                    title={editingTicket ? `Ticket #${editingTicket.ticketNumber || 'TBD'} — ${editingTicket.title}` : "Create Ticket"}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTicket(null);
                        setActiveTab("details");
                        setForm({
                            title: "",
                            description: "",
                            status: "Open",
                            priority: "Medium",
                            assignedTo: "",
                        });
                    }}
                >

                    {/* Tabs (only for edit) */}
                    {editingTicket && (
                        <div style={{ display: "flex", borderBottom: "1px solid #DDE8E5" }}>
                            {(["details", "conversation"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        borderBottom:
                                            activeTab === tab
                                                ? "2px solid #0E7C6B"
                                                : "2px solid transparent",
                                        color: activeTab === tab ? "#0E7C6B" : "#4B6B63",
                                        fontWeight: activeTab === tab ? 600 : 400,
                                        padding: "8px 16px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {tab.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* FORM (single form only) */}
                    {(!editingTicket || activeTab === "details") && (
                        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>

                            {/* Timeline */}
                            {editingTicket && (
                                <div style={timelineBox}>
                                    <TicketTimeline
                                        logs={[...(editingTicket.activityLogs || [])].reverse()}
                                    />
                                </div>
                            )}

                            <input
                                style={modalInput}
                                placeholder="Title"
                                value={form.title}
                                onChange={(e) =>
                                    setForm({ ...form, title: e.target.value })
                                }
                                required
                            />

                            <textarea
                                style={modalInput}
                                placeholder="Description"
                                value={form.description}
                                rows={3}
                                onChange={(e) =>
                                    setForm({ ...form, description: e.target.value })
                                }
                                required
                            />

                            {user?.role === "admin" && (
                                <select
                                    style={modalInput}
                                    value={form.assignedTo || ""}
                                    onChange={(e) =>
                                        setForm({ ...form, assignedTo: e.target.value })
                                    }
                                >
                                    <option value="">-- Select Agent --</option>
                                    {agents.map((agent) => (
                                        <option key={agent._id} value={agent._id}>
                                            {agent.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <select
                                style={modalInput}
                                value={form.status}
                                onChange={(e) =>
                                    setForm({ ...form, status: e.target.value })
                                }
                            >
                                <option>Open</option>
                                <option>Pending</option>
                                <option>Resolved</option>
                                <option>Closed</option>
                            </select>

                            <select
                                style={modalInput}
                                value={form.priority}
                                onChange={(e) =>
                                    setForm({ ...form, priority: e.target.value })
                                }
                            >
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>

                            <button type="submit" style={modalSaveBtn}>
                                Save
                            </button>
                        </form>
                    )}

                    {/* Conversation Tab */}
                    {editingTicket && activeTab === "conversation" && (
                        <div style={{ minHeight: 300 }}>
                            <CommentThread
                                ticketId={editingTicket._id}
                                currentUser={user}
                                ticketTitle={editingTicket.title}
                                ticketDescription={editingTicket.description}
                            />

                        </div>
                    )}
                </Modal>
            )}

            {ticketToDelete && (
                <ConfirmModal
                    title="Delete this ticket?"
                    message="This action cannot be undone. The ticket will be permanently removed."
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    );
}



const page: React.CSSProperties = {
    padding: "0 32px 32px",
    paddingTop: 0,
    background: "#F6F9F8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
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

const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #DDE8E5",
    padding: "16px 20px",
    borderRadius: 10,
    width: "100%",
    maxWidth: 1100,
    marginBottom: 20,
};

const filters: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    alignItems: "center",
};

const input: React.CSSProperties = {
    background: "#F6F9F8",
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #DDE8E5",
    width: "100%",
    boxSizing: "border-box",
    fontSize: 13,
    color: "#0F2922",
    outline: "none",
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
    gridTemplateColumns: "2fr 1fr auto",
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
    transition: "all 150ms",
};

const ticketListContainer: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    gap: 12,
};

const statusPriority: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    justifyContent: "center",
    alignItems: "flex-start",
};

const iconColumn: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    justifyContent: "center",
};

const iconBtn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
    padding: 4,
    borderRadius: 6,
    color: "#4B6B63",
    transition: "color 150ms ease-in-out",
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
    padding: 28,
    borderRadius: 12,
    width: 520,
    maxWidth: "90vw",
    display: "grid",
    gap: 16,
    boxShadow: "0 8px 32px rgba(14,124,107,0.12)",
};

const timelineBox: React.CSSProperties = {
    background: "#F6F9F8",
    borderRadius: 8,
    padding: "14px 16px",
};

const formBox: React.CSSProperties = {
    background: "#ffffff",
    padding: 0,
    borderRadius: 10,
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
    outline: "none",
    boxSizing: "border-box",
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

const modalCloseBtn: React.CSSProperties = {
    background: "transparent",
    border: "none",
    color: "#4B6B63",
    fontSize: 13,
    cursor: "pointer",
    width: "100%",
    marginTop: 8,
};



function Modal({
    children,
    title,
    onClose,
}: {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
}) {
    return (
        <div style={overlay}>
            <div style={modal}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0F2922", marginBottom: 20, borderBottom: "1px solid #DDE8E5", paddingBottom: 14 }}>{title}</h3>
                {children}
                <button
                    onClick={onClose}
                    style={modalCloseBtn}
                    onMouseOver={(e) => (e.currentTarget.style.color = "#0F2922")}
                    onMouseOut={(e) => (e.currentTarget.style.color = "#4B6B63")}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
