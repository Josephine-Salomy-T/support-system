interface ActivityLog {
  _id: string;
  action: string;
  field: string;
  oldValue?: string;
  newValue?: string;
  performedBy?: {
    name: string;
    role: string;
  };
  createdAt: string;
}

export default function TicketTimeline({
  logs,
}: {
  logs: ActivityLog[];
}) {
  if (!logs || logs.length === 0) {
    return (
      <p style={{ fontSize: 12, color: "#8FA89F" }}>
        No activity yet
      </p>
    );
  }

  return (
    <div style={{ marginTop: 0 }}>
      <h4
        style={{
          marginBottom: 10,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "#4B6B63",
          fontWeight: 600,
        }}
      >
        Latest Activity
      </h4>

      <div
        style={{
          borderLeft: "2px solid #DDE8E5",
          paddingLeft: 14,
        }}
      >
        {logs.map((log, idx) => (
          <div
            key={`${log.createdAt}-${log.action}-${idx}`}
            style={{
              marginBottom: 18,
              position: "relative",
            }}
          >
            {/* Timeline dot */}
            <span
              style={{
                position: "absolute",
                left: -9,
                top: 4,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: getColor(log.action),
              }}
            />

            <div style={{ fontSize: 13, color: "#0F2922", marginLeft: 4 }}>
              <strong>{getMessage(log)}</strong>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#8FA89F",
                marginTop: 2,
              }}
            >
              {log.performedBy?.name || "System"}{" "}
              {log.performedBy?.role && (
                <span
                  style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    background: "#E6F4F1",
                    color: "#0E7C6B",
                    borderRadius: 20,
                    marginLeft: 6,
                    fontWeight: 500,
                  }}
                >
                  {log.performedBy.role}
                </span>
              )}
              {" · "}
              {new Date(log.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Helpers ---------- */

function getMessage(log: any) {
  switch (log.action) {
    case "STATUS_CHANGED":
      return `Status changed from ${log.oldValue} → ${log.newValue}`;
    case "PRIORITY_CHANGED":
      return `Priority changed from ${log.oldValue} → ${log.newValue}`;
    case "ASSIGNED":
      return `Assigned to ${log.newValue}`;
    case "CREATED":
      return "Ticket created";
    default:
      return "Ticket updated";
  }
}

function getColor(action: string) {
  switch (action) {
    case "STATUS_CHANGED":
      return "#f59e0b";
    case "PRIORITY_CHANGED":
      return "#ef4444";
    case "ASSIGNED":
      return "#3b82f6";
    case "CREATED":
      return "#22c55e";
    default:
      return "#64748b";
  }
}
