import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import { api } from "../lib/api.js";

const initialActivity = {
  type: "note",
  title: "",
  body: ""
};

export function CRMPage() {
  const [form, setForm] = useState(initialActivity);
  const queryClient = useQueryClient();

  const { data: activities = [], isLoading, error } = useQuery({
    queryKey: ["crm"],
    queryFn: async () => (await api.get("/api/crm")).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/crm/activity", payload)).data,
    onSuccess: () => {
      toast.success("CRM activity added");
      setForm(initialActivity);
      queryClient.invalidateQueries({ queryKey: ["crm"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to add CRM activity");
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
        <h1 className="page-title">CRM Management</h1>
        <p className="page-subtitle">Capture notes, calls, and follow-ups in a durable customer timeline.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Add CRM Activity</h2>
          <div>
            <label className="field-label">Activity Type</label>
            <select className="field" value={form.type} onChange={(event) => updateField("type", event.target.value)}>
              <option value="note">Notes</option>
              <option value="call">Calls</option>
              <option value="follow_up">Follow-ups</option>
            </select>
          </div>
          <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Customer renewal discussion" required />
          <div>
            <label className="field-label">Details</label>
            <textarea
              className="field min-h-32 resize-y py-2"
              value={form.body}
              onChange={(event) => updateField("body", event.target.value)}
              placeholder="Record the activity details and next action."
              required
            />
          </div>
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={createMutation.isPending}>
            <Plus size={16} />
            {createMutation.isPending ? "Adding..." : "Add Activity"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">CRM Timeline</h2>
          {isLoading && <StateMessage message="Loading CRM timeline..." />}
          {error && <StateMessage tone="error" message="Unable to load CRM timeline." />}
          {!isLoading && !error && activities.length === 0 && <StateMessage message="No CRM activities yet." />}

          {activities.length > 0 && (
            <ol className="relative space-y-4 border-l border-slate-200 pl-5 dark:border-neutral-800">
              {activities.map((activity) => (
                <li key={activity._id} className="relative">
                  <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-signal ring-4 ring-white dark:ring-neutral-900" />
                  <div className="rounded border border-slate-200 p-4 dark:border-neutral-800">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="font-semibold">{activity.title}</h3>
                      <Badge>{activity.type}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-steel dark:text-slate-400">{activity.body}</p>
                    <p className="mt-3 text-xs text-slate-400">{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "Just now"}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
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

function Badge({ children }) {
  return <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-neutral-800 dark:text-slate-300">{children}</span>;
}

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}
