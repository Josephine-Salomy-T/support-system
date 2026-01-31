import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TicketTimeline from "./TicketTimeline";

import {
    getTickets,
    createTicket,
    updateTicket,
    deleteTicket,
} from "../api/tickets.api";

import { getUsers } from "../api/user.api";

interface Ticket {
    _id: string;
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

    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "Open",
        priority: "Medium",
        assignedTo: "",
    });

    useEffect(() => {
        getTickets(localStorage.getItem("token")!)
            .then((res) => {
                console.log("Tickets", res.data)
                setTickets(res.data);
                setFilteredTickets(res.data);
            })
            .finally(() => setLoading(false));
    }, []);
    useEffect(() => {
        if (user?.role === "admin") {
            getUsers(localStorage.getItem("token")!).then((res) => setAgents(res.data));
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
        const token = localStorage.getItem("token")!;

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
                alert("Ticket updated successfully!");
            } else {
                const res = await createTicket(form, token);
                setTickets((t) => [...t, res.data]);
                setShowCreateModal(false);
                alert("Ticket created successfully!");
            }

            setForm({ title: "", description: "", status: "Open", priority: "Medium", assignedTo: "" });
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || "An error occurred while saving the ticket.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this ticket?")) return;

        try {
            await deleteTicket(id, localStorage.getItem("token")!);
            setTickets((t) => t.filter((x) => x._id !== id));
            alert("Ticket deleted successfully!");
        } catch (err: any) {
            console.error(err);
            alert(err?.response?.data?.message || "An error occurred while deleting the ticket.");
        }
    };


    if (loading) return <p style={{ padding: 40 }}>Loading tickets…</p>;

    return (
        <div style={page}>
            {/* Header */}
            <div style={header}>
                <h2>Tickets</h2>
                <button style={primaryBtn} onClick={() => setShowCreateModal(true)}>
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
                    />
                    <select style={input} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="">All Status</option>
                        <option>Open</option>
                        <option>Pending</option>
                        <option>Resolved</option>
                        <option>Closed</option>
                    </select>
                    <select style={input} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="">All Priority</option>
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                    <select
                        style={input}
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
                    <div key={t._id} style={ticketCard}>

                        <div>
                            <h4 style={{ margin: 0, fontSize: 17 }}>{t.title}</h4>
                            <p style={{ margin: "4px 0", color: "#555", fontSize: 15 }}>
                                {t.description}
                            </p>
                            <span style={{ color: "#999", fontSize: 13 }}>
                                {new Date(t.createdAt).toLocaleString()}
                            </span>
                        </div>


                        <div style={statusPriority}>
                            <span style={badge(statusColors[t.status])}>{t.status}</span>
                            <span style={badge(priorityColors[t.priority])}>{t.priority}</span>
                            <span style={{ fontSize: 13, color: "#64748b" }}>
                                👤 Creator: {t.userId?.name || "Unassigned"}
                            </span>
                            <span style={{ fontSize: 13, color: "#64748b" }}>
                                🧑‍💼 Assigned To: {t.assignedTo?.name || "Unassigned"}
                            </span>
                        </div>


                        <div style={iconColumn}>
                            <button
                                onClick={() => {
                                    setEditingTicket(t);
                                    setForm(t as any);
                                }}
                                style={iconBtn}
                                title="Edit Ticket"
                            >
                                ✏️
                            </button>

                            {user?.role === "admin" && (
                                <button
                                    onClick={() => handleDelete(t._id)}
                                    style={iconBtn}
                                    title="Delete Ticket"
                                >
                                    🗑️
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal for Create/Edit */}
            {(showCreateModal || editingTicket) && (
                <Modal
                    title={editingTicket ? "Edit Ticket" : "Create Ticket"}
                    onClose={() => {
                        setShowCreateModal(false);
                        setEditingTicket(null);
                        setForm({
                            title: "",
                            description: "",
                            status: "Open",
                            priority: "Medium",
                            assignedTo: "",
                        });
                    }}

                >
                    {editingTicket && (
  <div style={timelineBox}>
    <TicketTimeline
      logs={[...(editingTicket.activityLogs || [])].reverse()}
    />
  </div>
)}

                    {/* <hr style={{ margin: "16px 0", borderColor: "#e5e7eb" }} /> */}
<div style={formBox}>
                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                        <input
                            style={input}
                            placeholder="Title"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />
                        <input
                            style={input}
                            placeholder="Description"
                            value={form.description}
                            onChange={(e) =>
                                setForm({ ...form, description: e.target.value })
                            }
                            required
                        />

                        {user?.role === "admin" && (
                            <select
                                style={input}
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
                            style={input}
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option>Open</option>
                            <option>Pending</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                        </select>
                        <select
                            style={input}
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                        <button style={primaryBtn}>Save</button>
                    </form>
                    </div>
                </Modal>
            )}
        </div>
    );
}



const page: React.CSSProperties = {
    padding: 32,
    background: "#f1f5f9",
    minHeight: "100vh",
    fontFamily: "Inter, system-ui",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

const header: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    maxWidth: 1000,
    marginBottom: 20,
};

const card: React.CSSProperties = {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
    width: "100%",
    maxWidth: 1000,
    marginBottom: 20,
};

const filters: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    alignItems: "center",
};

const input: React.CSSProperties = {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
};

const primaryBtn: React.CSSProperties = {
    background: "#22c55e",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 500,
};

const badge = (bg: string): React.CSSProperties => ({
    color: "#fff",
    background: bg,
    padding: "4px 10px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center",
});

const statusColors: Record<string, string> = {
    Open: "#22c55e",
    Pending: "#f59e0b",
    Resolved: "#6b7280",
    Closed: "#ef4444",
};

const priorityColors: Record<string, string> = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#ef4444",
};

const ticketCard: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr auto",
    alignItems: "center",
    background: "#fff",
    padding: 16,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    gap: 12,
    width: "100%",
    maxWidth: 1000,
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
};

const overlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 16,
};

const modal: React.CSSProperties = {
    background: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    display: "grid",
    gap: 16,
};

const timelineBox: React.CSSProperties = {
  background: "#f8fafc", // light grey
  padding: 14,
  paddingTop: 0,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
};

const formBox: React.CSSProperties = {
  background: "#ffffff",
  padding: 16,
  borderRadius: 10,
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
                <h3 style={{ margin: 0}}>{title}</h3>
                {children}
                <button onClick={onClose} style={iconBtn}>
                    Close
                </button>
            </div>
        </div>
    );
}
