import React, { useState, useEffect } from "react";
import { 
  Building, Compass, PlusCircle, Shield, 
  MapPin, Loader2, RefreshCw, Smartphone, CheckSquare, 
  Settings, AlertTriangle, AlertCircle, CheckCircle2, X
} from "lucide-react";
import { api } from "./api";
import { Business, AuthSession } from "./types";
import { CITIES, CATEGORIES, CITY_TO_GOVERNORATE } from "./cities";
import DashboardTable from "./components/DashboardTable";
import UploadBusiness from "./components/UploadBusiness";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [session, setSession] = useState<AuthSession>({
    token: "data-collector-token",
    user: {
      email: "mahdialmuntadhar1@gmail.com",
      role: "admin"
    }
  });
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "upload" | "admin">("dashboard");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);

  // Editing state for administration modal editing
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWebsite, setEditWebsite] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editFacebook, setEditFacebook] = useState("");
  const [editWhatsApp, setEditWhatsApp] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Custom styled visual toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Show customized alert toast
  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Initialize DB and authenticate session if already stored
  useEffect(() => {
    const bootstrap = async () => {
      try {
        await api.initDb();
      } catch (err) {
        triggerToast("Failed to initialize system cluster.", "error");
      } finally {
        setIsInitializing(false);
      }
    };
    bootstrap();
  }, []);

  // Fetch businesses on mount
  useEffect(() => {
    fetchBusinessesAndSync();
  }, []);

  const fetchBusinessesAndSync = async () => {
    setIsLoadingBusinesses(true);
    try {
      const data = await api.getBusinesses();
      setBusinesses(data);
    } catch (err) {
      triggerToast("Error retrieving geographic business registries.", "error");
    } finally {
      setIsLoadingBusinesses(false);
    }
  };

  // Delete business handler (Admin only)
  const handleDeleteBusiness = async (id: string) => {
    try {
      const success = await api.deleteBusiness(id);
      if (success) {
        triggerToast("Successfully deleted company record from directory.", "success");
        fetchBusinessesAndSync();
      } else {
        triggerToast("Company record was already deleted or missing.", "error");
      }
    } catch (err: any) {
      triggerToast(err.message || "Failed to delete item", "error");
    }
  };

  // Edit Business Setup details
  const handleOpenEditModal = (business: Business) => {
    setEditingBusiness(business);
    setEditName(business.name);
    setEditCity(business.city);
    setEditCategory(business.category);
    setEditPhone(business.phone);
    setEditWebsite(business.website || "");
    setEditInstagram(business.instagram || "");
    setEditFacebook(business.facebook || "");
    setEditWhatsApp(business.whatsApp);
    setEditAddress(business.address || "");
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBusiness) return;
    setEditError(null);

    if (!editName.trim()) {
      setEditError("Business Name is required");
      return;
    }
    if (!editPhone.trim()) {
      setEditError("Phone number is required");
      return;
    }

    setIsSavingEdit(true);

    const updatedNode: Business = {
      ...editingBusiness,
      name: editName.trim(),
      city: editCity,
      governorate: CITY_TO_GOVERNORATE[editCity] || editCity,
      category: editCategory,
      phone: editPhone.trim(),
      website: editWebsite.trim() ? editWebsite.trim() : undefined,
      instagram: editInstagram.trim() ? editInstagram.trim() : undefined,
      facebook: editFacebook.trim() ? editFacebook.trim() : undefined,
      whatsApp: editWhatsApp,
      address: editAddress.trim() ? editAddress.trim() : undefined,
    };

    try {
      await api.updateBusiness(updatedNode);
      triggerToast(`Successfully modified details for "${editName.trim()}"`, "success");
      setEditingBusiness(null);
      fetchBusinessesAndSync();
    } catch (err: any) {
      const msg = err.message || "Failed to update node.";
      setEditError(msg);
      triggerToast(msg, "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Loading Splash Screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-300">
        <Compass className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <h3 className="text-lg font-bold font-display text-white">Iraq Business Intelligence Services</h3>
        <p className="text-xs text-slate-500 mt-1">Bootstrapping persistent data layer schemas...</p>
      </div>
    );
  }

  const isAdmin = session.user.role === "admin";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Top Main Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Branding Logo */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-md shadow-amber-500/10">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight font-display flex items-baseline">
                  Iraq Business Intelligence <span className="text-[9px] bg-slate-100 text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-1.5">PROTOTYPE</span>
                </h1>
                <p className="text-[10px] text-slate-450 -mt-0.5 font-semibold font-mono">19 Iraqi Cities Hub</p>
              </div>
            </div>

            {/* Menu Tabs Navigation */}
            <nav className="hidden md:flex space-x-1 bg-slate-100/50 p-1.5 rounded-xl border border-slate-150">
              <button
                onClick={() => { setActiveTab("dashboard"); setEditingBusiness(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "dashboard"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard Directory
              </button>
              <button
                onClick={() => { setActiveTab("upload"); setEditingBusiness(null); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "upload"
                    ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Upload Business
              </button>
              {isAdmin && (
                <button
                  onClick={() => { setActiveTab("admin"); setEditingBusiness(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "admin"
                      ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Admin Control Panel
                </button>
              )}
            </nav>

            {/* Session Actions (Right Side) */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-bold font-mono text-slate-800">{session.user.email}</div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase flex items-center justify-end gap-1">
                  {isAdmin ? (
                    <>
                      <Shield className="h-3 w-3 text-red-500 shrink-0" />
                      Administrator
                    </>
                  ) : (
                    "Regular Analyst Access"
                  )}
                </div>
              </div>

              {/* Reset database refresh icon */}
              <button
                onClick={fetchBusinessesAndSync}
                className="p-1 px-2 hover:bg-slate-50 hover:text-slate-900 rounded-lg text-slate-450 transition-all cursor-pointer"
                title="Sync database node connection"
              >
                <RefreshCw className="h-4.5 w-4.5 animate-transition" />
              </button>

            </div>

          </div>
        </div>
      </header>

      {/* Tab Navigation for mobile view */}
      <div className="md:hidden bg-white border-b border-slate-150 p-2 overflow-x-auto whitespace-nowrap">
        <div className="flex gap-1.5">
          <button
            onClick={() => { setActiveTab("dashboard"); setEditingBusiness(null); }}
            className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold ${
              activeTab === "dashboard" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-750"
            }`}
          >
            Directory
          </button>
          <button
            onClick={() => { setActiveTab("upload"); setEditingBusiness(null); }}
            className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold ${
              activeTab === "upload" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-755"
            }`}
          >
            Upload
          </button>
          {isAdmin && (
            <button
              onClick={() => { setActiveTab("admin"); setEditingBusiness(null); }}
              className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-bold ${
                activeTab === "admin" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-755"
              }`}
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area Wrap */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Syncing/Loading indication row */}
        {isLoadingBusinesses && businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-3" />
            <span className="text-sm text-slate-500">Connecting to Cloudflare Database simulator node...</span>
          </div>
        ) : (
          <div className="animate-fade-in">
            {activeTab === "dashboard" && (
              <DashboardTable
                businesses={businesses}
                currentUser={session.user}
                onEditClick={handleOpenEditModal}
                onDeleteClick={handleDeleteBusiness}
                toast={triggerToast}
              />
            )}

            {activeTab === "upload" && (
              <UploadBusiness
                currentUser={session.user}
                onUploadSuccess={() => {
                  fetchBusinessesAndSync();
                  setActiveTab("dashboard");
                }}
                toast={triggerToast}
              />
            )}

            {isAdmin && activeTab === "admin" && (
              <AdminPanel
                currentUser={session.user}
                onRefreshData={fetchBusinessesAndSync}
                toast={triggerToast}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer System info */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <div>
            Built with <strong>React</strong> + <strong>Tailwind CSS</strong>. Persistent local schema architecture.
          </div>
          <div>
            Iraq Business Intelligence prototype indices.
          </div>
        </div>
      </footer>

      {/* ADMIN INLINE EDITING NODE MODAL */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-150 transform transition-all">
            <div className="px-6 py-4.5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold font-display flex items-center gap-1.5">
                  <Shield className="h-5 w-5 text-amber-500 shrink-0" />
                  Administrative Node Refactor
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Directly modifying database registry values for {editingBusiness.name}</p>
              </div>
              <button 
                onClick={() => setEditingBusiness(null)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {editError && (
                  <div className="rounded-xl bg-rose-50 p-3.5 border border-rose-100 flex items-start gap-2 text-rose-850">
                    <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="text-xs">{editError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name field */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Business Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Phone</label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center space-x-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 self-end h-10">
                    <input
                      type="checkbox"
                      id="editWhatsApp"
                      checked={editWhatsApp}
                      onChange={(e) => setEditWhatsApp(e.target.checked)}
                      className="h-4.5 w-4.5 text-amber-600 focus:ring-amber-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="editWhatsApp" className="text-xs font-bold text-slate-705 cursor-pointer">
                      WhatsApp Enabled
                    </label>
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">City Location</label>
                    <select
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    >
                      {CITIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-705">Sector Category</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                      {/* Add current category if it's custom and not in standard lists */}
                      {!CATEGORIES.includes(editCategory) && (
                        <option value={editCategory}>{editCategory} (Custom)</option>
                      )}
                    </select>
                  </div>

                  {/* Website */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Website URL (Optional)</label>
                    <input
                      type="url"
                      value={editWebsite}
                      onChange={(e) => setEditWebsite(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Instagram Handle (Optional)</label>
                    <input
                      type="text"
                      value={editInstagram}
                      onChange={(e) => setEditInstagram(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 font-mono"
                    />
                  </div>

                  {/* Facebook */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Facebook Page (Optional)</label>
                    <input
                      type="text"
                      value={editFacebook}
                      onChange={(e) => setEditFacebook(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
                    />
                  </div>

                  {/* Address */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Detailed Address (Optional)</label>
                    <textarea
                      rows={2}
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="px-4.5 py-2 bg-slate-205 hover:bg-slate-300 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingEdit ? "Saving Node..." : "Commit Refactored details"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-time notification layer overlay */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-55 max-w-sm rounded-2xl p-4 shadow-xl flex items-start gap-3 bg-white border border-slate-100 text-slate-800 animate-fade-in">
          {toastType === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-300 hover:text-slate-550 shrink-0 select-none cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
