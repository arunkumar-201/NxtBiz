import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login.jsx";
import { Register } from "./pages/Register.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import { ModulePage } from "./pages/ModulePage.jsx";
import { AppLayout } from "./components/AppLayout.jsx";
import { useAuthStore } from "./stores/authStore.js";
import { AIControlPage } from "./pages/AIControlPage.jsx";
import { EmailsPage } from "./pages/EmailsPage.jsx";
import { MeetingsPage } from "./pages/MeetingsPage.jsx";
import { InvoicesPage } from "./pages/InvoicesPage.jsx";
import { TicketsPage } from "./pages/TicketsPage.jsx";
import { ReportsPage } from "./pages/ReportsPage.jsx";
import { CRMPage } from "./pages/CRMPage.jsx";
import { WorkflowsPage } from "./pages/WorkflowsPage.jsx";

function Protected({ children }) {
  const user = useAuthStore((state) => state.user);
  return user ? children : <Navigate to="/login" replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="users" element={<ModulePage title="User Management" endpoint="/api/users" />} />
          <Route path="customers" element={<ModulePage title="Customers" endpoint="/api/customers" />} />
          <Route path="customers/:id" element={<ModulePage title="Customer 360" endpoint="/api/customers" />} />
          <Route path="emails" element={<EmailsPage />} />
          <Route path="meetings" element={<MeetingsPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="crm" element={<CRMPage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="ai-control" element={<AIControlPage />} />
          <Route path="settings" element={<ModulePage title="Runtime Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
