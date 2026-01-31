import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Tickets from "./pages/Tickets";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./pages/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AgentDashboard from "./pages/AgentDashboard";


function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar /> 
      {children}
    </>
  );
}

export default function App() {
  return (
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
            <ProtectedRoute>
              <ProtectedLayout>
                <Tickets />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-tickets"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Tickets />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
