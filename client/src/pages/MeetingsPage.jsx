import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CalendarPlus } from "lucide-react";
import { api } from "../lib/api.js";

const initialMeeting = {
  title: "",
  participants: "",
  date: "",
  time: ""
};

export function MeetingsPage() {
  const [form, setForm] = useState(initialMeeting);
  const queryClient = useQueryClient();

  const { data: meetings = [], isLoading, error } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => (await api.get("/api/meetings")).data
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const startTime = payload.date && payload.time ? new Date(`${payload.date}T${payload.time}`).toISOString() : null;
      return (await api.post("/api/meetings", {
        title: payload.title,
        attendees: payload.participants.split(",").map((item) => item.trim()).filter(Boolean),
        participants: payload.participants,
        startTime,
        status: "scheduled"
      })).data;
    },
    onSuccess: () => {
      toast.success("Meeting scheduled");
      setForm(initialMeeting);
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: (mutationError) => {
      toast.error(mutationError.response?.data?.message ?? "Failed to schedule meeting");
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
        <h1 className="page-title">Meeting Management</h1>
        <p className="page-subtitle">Schedule customer meetings and keep operational follow-ups visible.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <form className="panel space-y-4" onSubmit={handleSubmit}>
          <h2 className="section-title">Schedule Meeting</h2>
          <Field label="Title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Quarterly success review" required />
          <Field label="Participants" value={form.participants} onChange={(value) => updateField("participants", value)} placeholder="alex@example.com, manager@nxtbiz.local" required />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Date" type="date" value={form.date} onChange={(value) => updateField("date", value)} required />
            <Field label="Time" type="time" value={form.time} onChange={(value) => updateField("time", value)} required />
          </div>
          <button className="primary-button flex w-full items-center justify-center gap-2" disabled={createMutation.isPending}>
            <CalendarPlus size={16} />
            {createMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
          </button>
        </form>

        <div className="panel">
          <h2 className="section-title">Meeting List</h2>
          {isLoading && <StateMessage message="Loading meetings..." />}
          {error && <StateMessage tone="error" message="Unable to load meetings." />}
          {!isLoading && !error && meetings.length === 0 && <StateMessage message="No meetings scheduled yet." />}

          {meetings.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="table-head">
                  <tr>
                    <th className="table-th">Title</th>
                    <th className="table-th">Participants</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((meeting) => (
                    <tr className="table-row" key={meeting._id}>
                      <td className="table-td font-medium">{meeting.title}</td>
                      <td className="table-td max-w-xs truncate">{(meeting.attendees ?? []).join(", ") || meeting.participants || "No participants"}</td>
                      <td className="table-td">{meeting.startTime ? new Date(meeting.startTime).toLocaleString() : "Not scheduled"}</td>
                      <td className="table-td"><Badge>{meeting.status ?? "scheduled"}</Badge></td>
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

function Badge({ children }) {
  return <span className="rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{children}</span>;
}

function StateMessage({ message, tone = "muted" }) {
  return <p className={tone === "error" ? "text-sm text-red-600" : "text-sm text-steel dark:text-slate-400"}>{message}</p>;
}
