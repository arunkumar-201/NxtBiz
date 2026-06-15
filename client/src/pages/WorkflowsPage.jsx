import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Play, Plus } from "lucide-react";
import { api } from "../lib/api.js";

const initialWorkflow = {
  name: "",
  trigger: "email_processed",
  condition: "negative",
  action: "create_ticket_and_notify_manager"
};

export function WorkflowsPage() {
  const [form, setForm] = useState(initialWorkflow);
  const queryClient = useQueryClient();

  const { data: workflows = [], isLoading, error } = useQuery({
    queryKey: ["workflows"],
    queryFn: async () => (await api.get("/api/workflows")).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => (await api.post("/api/workflows", {
      ...payload,
      steps: [
        { type: "trigger", label: payload.trigger },
        { type: "condition", label: payload.condition },
        { type: "action", label: payload.action }
      ],
      enabled: true
    })).data,
    onSuccess: () => {
      toast.success("Workflow created");
      setForm(initialWorkflow);
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to create workflow");
    }
  });

  const executeMutation = useMutation({
    mutationFn: async (workflow) => (await api.post(`/api/workflows/${workflow._id}/execute`, {
      trigger: workflow.trigger,
      condition: workflow.condition,
      source: "manual",
      issue: "Manual workflow execution from NxtBiz console"
    })).data,
    onSuccess: () => {
      toast.success("Workflow execution requested");
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to execute workflow");
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
        <h1 className="page-title">Workflow Management</h1>
        <p className="page-subtitle">Define operational triggers, conditions, and automated follow-up actions.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Create Workflow</h2>
          <Field label="Workflow Name" value={form.name} onChange={(value) => updateField("name", value)} placeholder="Negative Email Escalation" required />
          <Field label="Trigger Event" value={form.trigger} onChange={(value) => updateField("trigger", value)} placeholder="email_processed" required />
          <Field label="Condition" value={form.condition} onChange={(value) => updateField("condition", value)} placeholder="negative" required />
          <Field label="Action" value={form.action} onChange={(value) => updateField("action", value)} placeholder="create_ticket_and_notify_manager" required />
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={createMutation.isPending}>
            <Plus size={16} />
            {createMutation.isPending ? "Creating..." : "Create Workflow"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">Workflow Records</h2>
          {isLoading && <StateMessage message="Loading workflows..." />}
          {error && <StateMessage tone="error" message="Unable to load workflows." />}
          {!isLoading && !error && workflows.length === 0 && <StateMessage message="No workflows configured yet." />}

          {workflows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Name</th>
                    <th className="table-th">Trigger</th>
                    <th className="table-th">Condition</th>
                    <th className="table-th">Action</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Run</th>
                  </tr>
                </thead>
                <tbody>
                  {workflows.map((workflow) => (
                    <tr className="table-row" key={workflow._id}>
                      <td className="table-td font-medium">{workflow.name}</td>
                      <td className="table-td">{workflow.trigger}</td>
                      <td className="table-td">{workflow.condition}</td>
                      <td className="table-td max-w-xs truncate">{workflow.action}</td>
                      <td className="table-td">
                        <StatusBadge active={workflow.enabled !== false}>{workflow.enabled === false ? "Disabled" : "Enabled"}</StatusBadge>
                      </td>
                      <td className="table-td">
                        <button
                          className="secondary-button"
                          onClick={() => executeMutation.mutate(workflow)}
                          disabled={executeMutation.isPending}
                        >
                          <Play size={14} />
                          Execute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

function StatusBadge({ active, children }) {
  return (
    <span className={`rounded px-2 py-1 text-xs font-medium ${active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300"}`}>
      {children}
    </span>
  );
}

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}
