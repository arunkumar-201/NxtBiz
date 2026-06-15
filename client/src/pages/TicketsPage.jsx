import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Save } from "lucide-react";
import { api } from "../lib/api.js";

const initialTicket = {
  title: "",
  description: "",
  priority: "medium",
  status: "open"
};

export function TicketsPage() {
  const [form, setForm] = useState(initialTicket);
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading, error } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => (await api.get("/api/tickets")).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/tickets", {
      ...payload,
      issue: payload.title,
      resolution: payload.description
    })).data,
    onSuccess: () => {
      toast.success("Ticket created");
      setForm(initialTicket);
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to create ticket");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }) => (await api.put(`/api/tickets/${id}`, updates)).data,
    onSuccess: () => {
      toast.success("Ticket updated");
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to update ticket");
    }
  });

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    createMutation.mutate(form);
  }

  return (
    <section className="space-y-5">
      <div>
        <h1 className="page-title">Ticket Management</h1>
        <p className="page-subtitle">Create, triage, and update customer support work from one queue.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Create Ticket</h2>
          <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Customer cannot access invoice" required />
          <div>
            <label className="field-label">Description</label>
            <textarea
              className="field min-h-28 resize-y py-2"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="Describe the issue and expected follow-up."
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Priority" value={form.priority} onChange={(value) => updateField("priority", value)} options={["low", "medium", "high", "critical"]} />
            <Select label="Status" value={form.status} onChange={(value) => updateField("status", value)} options={["open", "in_progress", "waiting", "closed"]} />
          </div>
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={createMutation.isPending}>
            <Plus size={16} />
            {createMutation.isPending ? "Creating..." : "Create Ticket"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">Ticket List</h2>
          {isLoading && <StateMessage message="Loading tickets..." />}
          {error && <StateMessage tone="error" message="Unable to load tickets." />}
          {!isLoading && !error && tickets.length === 0 && <StateMessage message="No tickets yet." />}

          {tickets.length > 0 && (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <TicketRow
                  key={ticket._id}
                  ticket={ticket}
                  isUpdating={updateMutation.isPending}
                  onUpdate={(updates) => updateMutation.mutate({ id: ticket._id, updates })}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TicketRow({ ticket, onUpdate, isUpdating }) {
  const [status, setStatus] = useState(ticket.status ?? "open");
  const [priority, setPriority] = useState(ticket.priority ?? "medium");

  return (
    <div className="rounded border border-slate-200 p-4 dark:border-neutral-800">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="font-semibold">{ticket.title ?? ticket.issue}</h3>
          <p className="mt-1 text-sm text-steel dark:text-slate-400">{ticket.description ?? ticket.resolution ?? "No description provided."}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[140px_140px_auto]">
          <select className="field h-9" value={priority} onChange={(event) => setPriority(event.target.value)}>
            {["low", "medium", "high", "critical"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className="field h-9" value={status} onChange={(event) => setStatus(event.target.value)}>
            {["open", "in_progress", "waiting", "closed"].map((option) => <option key={option}>{option}</option>)}
          </select>
          <button className="secondary-button" onClick={() => onUpdate({ status, priority })} disabled={isUpdating}>
            <Save size={14} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, ...props }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input className="field" value={value} onChange={(event) => onChange(event.target.value)} {...props} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select className="field" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}
