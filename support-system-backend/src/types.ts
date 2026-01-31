export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "Open" | "Pending" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  createdAt: Date;
  updatedAt: Date;
}
