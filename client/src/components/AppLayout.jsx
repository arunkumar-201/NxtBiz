import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  Calendar,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Moon,
  Receipt,
  Settings,
  Ticket,
  Users,
  Workflow
} from "lucide-react";
import { useAuthStore } from "../stores/authStore.js";

const navItems = [
  ["/", "Dashboard", LayoutDashboard],
  ["/users", "Users", Users],
  ["/customers", "Customers", BriefcaseBusiness],
  ["/emails", "Emails", Inbox],
  ["/meetings", "Meetings", Calendar],
  ["/invoices", "Invoices", Receipt],
  ["/tickets", "Tickets", Ticket],
  ["/reports", "Reports", FileText],
  ["/crm", "CRM", Bell],
  ["/workflows", "Workflows", Workflow],
  ["/ai-control", "AI Control", Bot],
  ["/settings", "Settings", Settings]
];

export function AppLayout() {
  const [dark, setDark] = useState(false);
  const [unread, setUnread] = useState(0);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const socket = useMemo(() => io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:8000", { withCredentials: true }), []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    const events = ["new_email", "new_ticket", "invoice_created", "meeting_created", "agent_completed", "workflow_executed"];
    events.forEach((eventName) => {
      socket.on(eventName, () => {
        setUnread((count) => count + 1);
        toast.success(eventName.replaceAll("_", " "));
        queryClient.invalidateQueries();
      });
    });
    return () => socket.disconnect();
  }, [queryClient, socket]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-ink dark:bg-neutral-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 dark:border-neutral-800 dark:bg-neutral-900 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-signal text-lg font-bold text-white">N</div>
          <div>
            <div className="text-lg font-semibold">NxtBiz</div>
            <div className="text-xs text-steel dark:text-slate-400">Operations Console</div>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded px-3 text-sm ${
                  isActive ? "bg-signal text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-neutral-800"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div>
            <div className="font-semibold">NxtBiz Workspace</div>
            <div className="text-xs text-steel dark:text-slate-400">{user?.name} · {user?.role}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">{unread} unread</div>
            <button className="icon-button" onClick={() => setDark((value) => !value)} aria-label="Toggle dark mode">
              <Moon size={18} />
            </button>
            <button className="icon-button" onClick={handleLogout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main className="p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
