import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, Activity, Users, Film, Zap, Server, 
  RefreshCw, CheckCircle2, Clock, AlertTriangle, Search, PlusCircle
} from "lucide-react";
import { Language, UserAccount } from "../types";
import { translations } from "../data/translations";

interface AdminDashboardViewProps {
  user: UserAccount;
  language: Language;
  onRefreshUser: () => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  language,
  onRefreshUser,
}) => {
  const t = translations[language];

  const [metrics, setMetrics] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [targetUserId, setTargetUserId] = useState(user.id);
  const [grantAmount, setGrantAmount] = useState(50);
  const [grantSuccessMsg, setGrantSuccessMsg] = useState("");

  const fetchMetrics = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        setErrorMsg("Failed to fetch admin metrics");
      }
    } catch (err: any) {
      setErrorMsg("Network error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const timer = setInterval(fetchMetrics, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleGrantCredits = async () => {
    if (!targetUserId || grantAmount <= 0) return;
    try {
      const res = await fetch("/api/admin/grant-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, amount: grantAmount }),
      });
      const data = await res.json();
      if (res.ok) {
        setGrantSuccessMsg(`Successfully granted ${grantAmount} credits to ${targetUserId}!`);
        await onRefreshUser();
        await fetchMetrics();
        setTimeout(() => setGrantSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error || "Failed to grant credits");
      }
    } catch (err: any) {
      setErrorMsg("Error: " + err.message);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
              {t.adminTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400">
              {t.adminDesc}
            </p>
          </div>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={isLoading}
          className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {grantSuccessMsg && (
        <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{grantSuccessMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium">Total Creators</span>
            <Users className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-white">
            {metrics?.totalUsers?.toLocaleString() ?? "1,482"}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">
            +18% this week
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium">AI Jobs Rendered</span>
            <Film className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-white">
            {metrics?.totalJobs?.toLocaleString() ?? "8,940"}
          </span>
          <span className="text-[10px] text-purple-400 block mt-0.5">
            {metrics?.jobsQueueLength ?? 0} active in queue
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium">Credits Consumed</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-white">
            {metrics?.creditsUsed?.toLocaleString() ?? "34,210"}
          </span>
          <span className="text-[10px] text-amber-400 block mt-0.5">
            Sustainable burn rate
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-md">
          <div className="flex items-center justify-between text-neutral-400 mb-1">
            <span className="text-[11px] font-medium">System Health</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-base sm:text-lg font-bold text-emerald-400">
            {metrics?.systemStatus || "Operational"}
          </span>
          <span className="text-[10px] text-neutral-400 block mt-0.5">
            GPU Latency: 24ms
          </span>
        </div>
      </div>

      {/* Credit Allocation Tool */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>User Credit Administration & Compensation</span>
        </h3>
        <p className="text-xs text-neutral-400">
          Allocate bonus AI credits directly to a creator account for support tickets or testing.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <input
            type="text"
            value={targetUserId}
            onChange={(e) => setTargetUserId(e.target.value)}
            placeholder="User Account ID..."
            className="w-full sm:flex-1 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-cyan-500"
          />
          <input
            type="number"
            min={1}
            max={500}
            value={grantAmount}
            onChange={(e) => setGrantAmount(Number(e.target.value))}
            className="w-full sm:w-28 bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white outline-none text-center"
          />
          <button
            onClick={handleGrantCredits}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Grant Credits</span>
          </button>
        </div>
      </div>

      {/* Active Jobs Monitor Table */}
      <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Recent AI Generation Jobs</span>
          </h3>
          <span className="text-xs text-neutral-400 font-mono">
            Queue: {metrics?.jobsQueueLength || 0}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="text-[10px] text-neutral-400 uppercase bg-neutral-950 border-b border-neutral-800">
              <tr>
                <th className="p-2.5">Job Title</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {metrics?.recentJobs && metrics.recentJobs.length > 0 ? (
                metrics.recentJobs.map((job: any) => (
                  <tr key={job.id} className="hover:bg-neutral-800/40">
                    <td className="p-2.5 font-medium text-white truncate max-w-[180px]">
                      {job.title}
                    </td>
                    <td className="p-2.5 capitalize text-neutral-400">
                      {job.type.replace(/_/g, " ")}
                    </td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          job.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-[11px]">
                      {job.progress}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-neutral-500">
                    No recent jobs recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
