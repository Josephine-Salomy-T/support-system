import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import Navbar from "./pages/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import EmployeePortal from "./pages/EmployeePortal";
import Toast from "./components/Toast";
import useToast from "./hooks/useToast";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";


function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: 0 }}>{children}</div>
    </>
  );
}

export default function App() {
  const { toast, showToast, hideToast } = useToast();

  return (
    <ToastProvider value={{ showToast }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <ProtectedLayout>
                <AdminDashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute role="agent">
              <ProtectedLayout>
                <AgentDashboard />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/tickets"
          element={
            <ProtectedRoute role="admin">
              <ProtectedLayout>
                <Tickets />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-tickets"
          element={
            <ProtectedRoute role="agent">
              <ProtectedLayout>
                <Tickets />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee-portal"
          element={
            <ProtectedRoute role="employee">
              <ProtectedLayout>
                <EmployeePortal />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        </Routes>
      </BrowserRouter>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={hideToast} />
      )}
    </ToastProvider>
  );
}
