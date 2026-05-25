import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, Users, History, Play, Database, RefreshCw, 
  Loader2, CheckCircle2, UserCheck, AlertTriangle, UserX, Trash2, Edit2
} from "lucide-react";
import { api } from "../api";
import { User, ScrapingLog, Business } from "../types";
import { CITIES } from "../cities";

interface AdminPanelProps {
  currentUser: { email: string; role: "admin" | "user" };
  onRefreshData: () => void;
  toast: (message: string, type: "success" | "error") => void;
}

export default function AdminPanel({
  currentUser,
  onRefreshData,
  toast
}: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ScrapingLog[]>([]);
  
  // Scraping progress states
  const [isScraping, setIsScraping] = useState(false);
  const [currentScrapeCity, setCurrentScrapeCity] = useState("");
  const [scrapeProgress, setScrapeProgress] = useState(0); // 0 to 100%
  const [scrapeLogsAdded, setScrapeLogsAdded] = useState<ScrapingLog[]>([]);

  // Loading indicators
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Load Admin Data on mount
  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const u = await api.getUsers();
      setUsers(u);
    } catch (err) {
      toast("Failed to load registered users database", "error");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const l = await api.getScrapingLogs();
      setLogs(l);
    } catch (err) {
      toast("Failed to retrieve scraping log indexes", "error");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Toggle user role (Admin / User)
  const handleToggleRole = async (userId: string, email: string) => {
    if (email === "admin@example.com") {
      toast("The primary administrator account can't be demoted.", "error");
      return;
    }
    if (email === currentUser.email) {
      toast("You can't change your own authorization role.", "error");
      return;
    }
    try {
      await api.toggleUserRole(userId);
      toast(`Successfully changed role status for ${email}!`, "success");
      loadUsers();
    } catch (err: any) {
      toast(err.message || "Failed to switch role", "error");
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId: string, email: string) => {
    if (email === "admin@example.com") {
      toast("The primary administrator account can't be suspended.", "error");
      return;
    }
    if (email === currentUser.email) {
      toast("You can't suspend your own logged-in session.", "error");
      return;
    }
    try {
      await api.toggleUserStatus(userId);
      toast(`Successfully toggled account access status for ${email}!`, "success");
      loadUsers();
    } catch (err: any) {
      toast(err.message || "Failed to switch status", "error");
    }
  };

  // Seed 50+ Iraqi businesses
  const handleSeedData = async () => {
    if (window.confirm("Do you want to re-seed the storage database? This will revert the business index to the 50+ curated mock Iraqi businesses.")) {
      try {
        await api.seedAllData();
        toast("Verified local database has been successfully re-seeded with 50+ Iraqi companies!", "success");
        onRefreshData();
        loadLogs();
      } catch (err) {
        toast("Failed to seed database.", "error");
      }
    }
  };

  // Scraping simulation
  const handleTriggerScrape = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setScrapeProgress(0);
    setCurrentScrapeCity("");
    setScrapeLogsAdded([]);

    try {
      const totalCitiesCount = CITIES.length;
      let processed = 0;

      const completionLogs = await api.simulateScrape((city) => {
        setCurrentScrapeCity(city);
        processed++;
        setScrapeProgress(Math.floor((processed / totalCitiesCount) * 100));
      });

      // Filter logs created with record increments
      const addedItems = completionLogs.filter(l => l.recordsAdded > 0);
      const itemsCountStr = completionLogs.reduce((acc, current) => acc + current.recordsAdded, 0);

      toast(`Simulation completed! Traversed all 19 Iraqi cities. Newly indexed ${itemsCountStr} unique business nodes!`, "success");
      onRefreshData();
      loadLogs();
    } catch (err) {
      toast("An error occurred during simulated scrape traversal.", "error");
    } finally {
      setIsScraping(false);
      setCurrentScrapeCity("");
      setScrapeProgress(100);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Simulation Controllers (Scrape + Seeding) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scraper Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
              <Play className="h-5 w-5 text-amber-500 fill-amber-500" />
              Simulated Iraqi Web Scraper
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Trigger an automated mock scraper that sequentially crawls verified directory registries for all 19 cities. Unique non-duplicate nodes are automatically saved.
            </p>

            {isScraping && (
              <div className="mt-5 space-y-3 bg-amber-50/50 p-4 border border-amber-100 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-800 flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                    Crawl: {currentScrapeCity}...
                  </span>
                  <span className="font-mono text-amber-700 font-bold">{scrapeProgress}% finished</span>
                </div>
                {/* Custom active progressbar */}
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full transition-all duration-150 ease-out"
                    style={{ width: `${scrapeProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 italic">Reading business indexes from municipal government directories...</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={handleTriggerScrape}
              disabled={isScraping}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isScraping ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  Scraping Iraq (19 Cities)...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Trigger Web Crawl (Simulation)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database Seeding Control */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 font-display flex items-center gap-2">
              <Database className="h-5 w-5 text-indigo-500" />
              Sovereign Registry DB Reset
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provides direct authority controls to reset and populate the company index with 50+ curated high-fidelity Iraqi businesses. Overwrites existing custom local nodes.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">Reset sets name, city, and phone number parameters for all 19 cities.</span>
            
            <button
              onClick={handleSeedData}
              disabled={isScraping}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-indigo-100 hover:text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Seed 50+ Curated Businesses
            </button>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4.5 bg-slate-50/75 border-b border-slate-100 flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-500" />
          <div>
            <h3 className="font-bold text-slate-800 text-base font-display">User Access Controls</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Edit credentials, permissions, and session locks for intelligence analysts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Analyst Email</th>
                <th className="px-6 py-3">Security clearance</th>
                <th className="px-6 py-3">Account status</th>
                <th className="px-6 py-3 text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-350" />
                    <span className="text-xs block mt-2 text-slate-400 font-medium">Fetching active personnel...</span>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isPrimaryAdmin = u.email === "admin@example.com";
                  const isSelf = u.email === currentUser.email;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/30 transition-all">
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-900 font-mono text-xs">{u.email}</span>
                        {isSelf && (
                          <span className="ml-2 text-[10px] bg-slate-200 text-slate-650 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-100 text-xs px-2.5 py-0.5 rounded-full font-bold">
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full">
                            Regular Analyst
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        {u.status === "active" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                            Authenticated (Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-750 bg-rose-50 border border-rose-100 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                            Suspended (Offline)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Role Button */}
                          <button
                            onClick={() => handleToggleRole(u.id, u.email)}
                            disabled={isPrimaryAdmin || isSelf}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isPrimaryAdmin || isSelf
                                ? "opacity-30 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-200"
                                : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300"
                            }`}
                          >
                            <UserCheck className="h-3 w-3" />
                            Toggle Role
                          </button>

                          {/* Toggle Status Lock */}
                          <button
                            onClick={() => handleToggleStatus(u.id, u.email)}
                            disabled={isPrimaryAdmin || isSelf}
                            className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                              isPrimaryAdmin || isSelf
                                ? "opacity-30 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-200"
                                : u.status === "active"
                                ? "text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 hover:border-rose-300"
                                : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-250 hover:border-emerald-350"
                            }`}
                          >
                            <UserX className="h-3 w-3" />
                            {u.status === "active" ? "Suspend Account" : "Activate Account"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scraping Log History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4.5 bg-slate-50/75 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-550" />
            <div>
              <h3 className="font-bold text-slate-800 text-base font-display">Log Registry of System Scrapes</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Verification traces of sequential web scrapes across city nodes</p>
            </div>
          </div>
          
          <button
            onClick={loadLogs}
            className="p-1 px-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Refresh Logs
          </button>
        </div>

        <div className="overflow-y-auto max-h-72">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-2.5">Traversed municipality</th>
                <th className="px-6 py-2.5">Added Records Count</th>
                <th className="px-6 py-2.5">Crawl Date / Timestamp</th>
                <th className="px-6 py-2.5 text-right">Status Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-mono text-[12px] text-slate-650">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-slate-400">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-300" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-6 text-center text-slate-400 font-sans italic">
                    Log index is completely empty. Initiate simulated scrape to populate.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-2.5 font-bold text-slate-755">{log.city}</td>
                    <td className="px-6 py-2.5">
                      {log.recordsAdded > 0 ? (
                        <span className="text-amber-805 font-bold">+{log.recordsAdded} new records</span>
                      ) : (
                        <span className="text-slate-400">0 added (duplicate filters kept)</span>
                      )}
                    </td>
                    <td className="px-6 py-2.5 text-xs text-slate-500">{new Date(log.date).toLocaleString()}</td>
                    <td className="px-6 py-2.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold font-sans text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3" />
                        COMPLETED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
