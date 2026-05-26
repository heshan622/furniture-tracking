"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

export default function Dashboard() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(
    "System online. Awaiting telemetry configurations...",
  );
  const [stats, setStats] = useState({ totalJobs: 0, anomalies: 0 });

  const [scheduleFile, setScheduleFile] = useState(null);
  const [telemetryFile, setTelemetryFile] = useState(null);

  const executeAuditProcessing = async (sched, telem) => {
    if (!sched) return;
    setLoading(true);
    setUploadStatus("Executing cross-source data reconciliation matrices...");

    const formData = new FormData();
    formData.append("schedule_file", sched);
    if (telem) {
      formData.append("telemetry_file", telem);
    }

    try {
      const res = await fetch('/api/audit-delivery', {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      // 🎯 TIMELINE GAP MISMATCH WARNING TRIGGER
      if (data && data.status === "DATE_MISMATCH_ERROR") {
        setLoading(false);
        setTelemetryFile(null);
        document.getElementById("telem-upload").value = "";

        Swal.fire({
          title: "Check Again Sheets!",
          html: `<div style="text-align: left; font-family: monospace; font-size: 13px; color: #94a3b8; line-height: 1.6; padding: 4px;">
                  <span style="color: #f43f5e; font-weight: bold;">[LOGISTICS MISMATCH]</span> Unaligned report sheets detected.<br><br>
                  ${data.details}<br><br>
                  <span style="color: #eab308; font-weight: bold;">Notice:</span> Different month reports cannot be cross-audited. Please upload matching documents.
                 </div>`,
          icon: "warning",
          background: "#0f172a",
          color: "#f8fafc",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "Check Again Sheets!",
          customClass: {
            popup:
              "border border-slate-800 rounded-2xl shadow-2xl shadow-black/80",
          },
        });

        setUploadStatus("Audit locked: Timelines are completely mismatched.");
        return;
      }

      if (data && Array.isArray(data.records)) {
        setSchedule(data.records);
        setStats({
          totalJobs: data.records.length,
          anomalies: data.anomalies || 0,
        });
        setUploadStatus(
          telem
            ? "Reconciliation matrix compiled successfully."
            : "Schedule data loaded. Awaiting AICONIQ payload...",
        );
      } else {
        setUploadStatus(
          "Processing exception. Please verify structural alignment.",
        );
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setTelemetryFile(null);
      document.getElementById("telem-upload").value = "";

      // NETWORK DISCONNECT WARNING
      Swal.fire({
        title: "Backend Server Offline!",
        html: `<div style="text-align: left; font-family: monospace; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                <span style="color: #f43f5e; font-weight: bold;">[CONNECTION REFUSED]</span> Frontend cannot reach the analysis engine.<br><br>
                Please go to your VS Code terminal window running inside the <b style="color: #fff;">backend/</b> folder and execute:<br>
                <span style="color: #3b82f6; font-weight: bold;">python main.py</span>
               </div>`,
        icon: "error",
        background: "#0f172a",
        color: "#f8fafc",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Retry Connection",
      });

      setUploadStatus(
        "Network connection error. Ensure backend server is active.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScheduleFile(file);
    executeAuditProcessing(file, telemetryFile);
  };

  const handleTelemetryChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setTelemetryFile(file);
    executeAuditProcessing(scheduleFile, file);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-blue-600/30 selection:text-blue-200">
      {/* GLOBAL BANNER STATUS */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-8 py-2 text-xs font-mono tracking-wider text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>SECURE AUDIT PIPELINE ACTIVE</span>
        </div>
        <div className="text-slate-500 max-sm:hidden">
          <span>CONSOLE: v2.4.1</span>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto space-y-8">
        {/* EXECUTIVE HEADER PANEL */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner flex items-center justify-center">
              <img
                src="/logo.png.PNG"
                alt="FINEZ Logo"
                className="h-32 w-auto object-contain"
              />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-3xl">
                FINEZ{" "}
                <span className="text-blue-500 font-medium">
                  LOGISTICS AUDIT & COMPLIANCE PORTAL
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">
                Automated Fleet Verification & Route Telemetry Analysis Engine
              </p>
              <div className="pt-2">
                <span className="text-xs font-mono font-bold bg-slate-950 px-3 py-1 rounded-md border border-slate-800 text-yellow-400 inline-block shadow-sm">
                  ⚡ {uploadStatus}
                </span>
              </div>
            </div>
          </div>

          {/* CONTROL PORTALS */}
          <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
            {/* PORTAL 1 */}
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl relative group hover:border-blue-500/40 transition-colors w-full sm:w-64 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                  1. Master Schedule
                </span>
                {scheduleFile && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
                    READY
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                id="sched-upload"
                onChange={handleScheduleChange}
                className="hidden"
              />
              <label
                htmlFor="sched-upload"
                className="flex items-center justify-center h-10 w-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 rounded-md cursor-pointer hover:bg-slate-800 hover:text-white active:bg-slate-900 transition-all font-mono text-center"
              >
                {scheduleFile ? "Replace Sheet CSV" : "Upload Schedule CSV"}
              </label>
              {scheduleFile && (
                <p className="text-[10px] text-slate-500 font-mono mt-2 truncate max-w-full">
                  📄 {scheduleFile.name}
                </p>
              )}
            </div>

            {/* PORTAL 2 */}
            <div className="bg-slate-950/80 p-4 border border-slate-800/80 rounded-xl relative group hover:border-purple-500/40 transition-colors w-full sm:w-64 shadow-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">
                  2. AICONIQ Telemetry
                </span>
                {telemetryFile && (
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20">
                    SYNCED
                  </span>
                )}
              </div>
              <input
                type="file"
                accept=".csv"
                id="telem-upload"
                disabled={!scheduleFile}
                onChange={handleTelemetryChange}
                className="hidden"
              />
              <label
                htmlFor="telem-upload"
                className={`flex items-center justify-center h-10 w-full border text-xs font-bold rounded-md cursor-pointer transition-all font-mono text-center ${
                  scheduleFile
                    ? "bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-900"
                    : "bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed"
                }`}
              >
                {telemetryFile ? "Replace Tracker CSV" : "Upload Tracker CSV"}
              </label>
              {telemetryFile && (
                <p className="text-[10px] text-slate-500 font-mono mt-2 truncate max-w-full">
                  🛰️ {telemetryFile.name}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* ANALYTICS SCORECARDS DECK */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-800/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Audited Delivery Volume
            </p>
            <p className="text-4xl font-black text-white tracking-tight mt-3">
              {stats.totalJobs}{" "}
              <span className="text-lg font-medium text-slate-500 uppercase">
                Records Loaded
              </span>
            </p>
          </div>
          <div className="bg-slate-900/20 p-6 rounded-2xl border border-slate-800/50 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Flagged Operational Breaches
            </p>
            <p className="text-4xl font-black text-white tracking-tight mt-3">
              {stats.anomalies}{" "}
              <span className="text-lg font-medium text-slate-500 uppercase">
                Anomalies Detected
              </span>
            </p>
          </div>
        </section>

        {/* MASTER COMPLIANCE LEDGER MATRIX */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
          {loading ? (
            <div className="p-24 flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 font-mono text-xs tracking-widest uppercase">
                Reconciling datasets...
              </p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="p-24 text-center max-w-md mx-auto space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-500 text-xl font-bold font-mono shadow-inner">
                !
              </div>
              <div className="space-y-1">
                <p className="text-base text-slate-200 font-bold tracking-tight">
                  Audit Dashboard Empty
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The data ledger remains blank until configuration matrices are
                  uploaded. Inject your master Google Sheet CSV stream to
                  initialize analysis workflows.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-300 text-[10px] uppercase tracking-widest font-bold font-mono shadow-sm">
                    <th className="p-4 pl-6">Date</th>
                    <th className="p-4">Job No</th>
                    <th className="p-4">Vehicle Identity</th>
                    <th className="p-4">Client Registry</th>
                    <th className="p-4">Dropoff Terminal</th>
                    <th className="p-4 text-amber-400/90">Planned Execution</th>
                    <th className="p-4 text-cyan-400/90">Actual Departure</th>
                    <th className="p-4 text-emerald-400/90">
                      Actual Arrival (Variance)
                    </th>
                    <th className="p-4 text-indigo-400/90">Terminal Dwell</th>
                    <th className="p-4 text-purple-400/90">Transit Leg Time</th>
                    <th className="p-4 pr-6 text-center">Audit Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-xs font-medium text-slate-300">
                  {schedule.map((row, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-900/30 transition-colors group"
                    >
                      <td className="p-4 pl-6 font-mono text-slate-400 tracking-tight group-hover:text-slate-200">
                        {row["Date"]}
                      </td>
                      <td className="p-4 font-bold text-blue-400 font-mono tracking-tight group-hover:text-blue-300">
                        {row["Job No"]}
                      </td>
                      <td className="p-4">
                        <span className="bg-slate-950 text-slate-400 px-2 py-1 rounded border border-slate-800 font-mono font-bold text-[11px] group-hover:text-slate-300 group-hover:border-slate-700">
                          {row["MappedLorry"]}
                        </span>
                      </td>
                      <td className="p-4 text-white font-semibold text-sm tracking-tight">
                        {row["Customer Name"]}
                      </td>
                      <td className="p-4 text-slate-400 text-[11px] tracking-tight">
                        {row["Location"]}
                      </td>
                      <td className="p-4 font-mono text-amber-400/90 tracking-tight font-bold">
                        {row["Planned Delivery Time"]}
                      </td>
                      <td className="p-4 font-mono text-cyan-400/90 font-bold tracking-tight">
                        {row["ActualDeparture"]}
                      </td>

                      <td className="p-4 font-mono whitespace-nowrap tracking-tight">
                        <span className="text-white font-bold text-sm mr-1.5">
                          {row["ActualArrival"]}
                        </span>
                        {row["ShortDate"] && row["ActualArrival"] !== "—" && (
                          <span className="text-slate-500 font-semibold mr-2.5">
                            ({row["ShortDate"]})
                          </span>
                        )}
                        {row["TimeDiffDisplay"] && (
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[10px] tracking-wide inline-block ${
                              row["BadgeColor"] === "danger" ||
                              row["BadgeColor"] === "warning"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                            }`}
                          >
                            {row["TimeDiffType"] === "late" ? "LATE" : "EARLY"}{" "}
                            {row["TimeDiffDisplay"]}
                          </span>
                        )}
                      </td>

                      <td className="p-4 font-mono text-indigo-400 group-hover:text-indigo-300 tracking-tight">
                        {row["DurationParked"]}
                      </td>
                      <td className="p-4 font-mono text-purple-400 group-hover:text-purple-300 tracking-tight">
                        {row["RoadTime"]}
                      </td>
                      <td className="p-4 pr-6 text-center">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider inline-block border min-w-[110px] text-center shadow-sm ${
                            row["BadgeColor"] === "danger"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              : row["BadgeColor"] === "warning"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : row["BadgeColor"] === "success"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : "bg-slate-950 text-slate-500 border-slate-800"
                          }`}
                        >
                          {row["Status"]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
