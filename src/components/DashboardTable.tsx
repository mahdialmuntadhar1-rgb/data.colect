import React, { useState, useMemo } from "react";
import { 
  Search, Filter, SlidersHorizontal, Download, Phone, 
  Globe, MessageSquare, MapPin, Eye, Edit2, Trash2, 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw
} from "lucide-react";
import { Business } from "../types";
import { CITIES, GOVERNORATES, CATEGORIES } from "../cities";

interface DashboardTableProps {
  businesses: Business[];
  currentUser: { email: string; role: "admin" | "user" };
  onEditClick: (business: Business) => void;
  onDeleteClick: (id: string) => void;
  toast: (message: string, type: "success" | "error") => void;
}

export default function DashboardTable({
  businesses,
  currentUser,
  onEditClick,
  onDeleteClick,
  toast
}: DashboardTableProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGovernorate, setSelectedGovernorate] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [whatsAppFilter, setWhatsAppFilter] = useState<"All" | "Yes" | "No">("All");

  // Filter application trigger states (only apply filters when "Apply Filters" is clicked, except live inputs if desired. But prompt says: '“Apply Filters” button. Filters should update the table and pagination.')
  // To handle the "Apply Filters" requirement precisely, we'll keep a "staged" state and apply it to an "active" state that actually gates the filtering logic.
  const [activeSearch, setActiveSearch] = useState("");
  const [activeGovernorate, setActiveGovernorate] = useState("");
  const [activeCity, setActiveCity] = useState("");
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeWhatsApp, setActiveWhatsApp] = useState<"All" | "Yes" | "No">("All");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState<25 | 50 | 100>(25);

  // Selected for viewing details in a modal helper
  const [selectedDetail, setSelectedDetail] = useState<Business | null>(null);

  // Category Multi-select toggle
  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Apply filters
  const handleApplyFilters = () => {
    setActiveSearch(searchTerm);
    setActiveGovernorate(selectedGovernorate);
    setActiveCity(selectedCity);
    setActiveCategories(selectedCategories);
    setActiveWhatsApp(whatsAppFilter);
    setCurrentPage(1); // Reset to page 1 on search filter
    toast("Filters successfully applied", "success");
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedGovernorate("");
    setSelectedCity("");
    setSelectedCategories([]);
    setWhatsAppFilter("All");

    setActiveSearch("");
    setActiveGovernorate("");
    setActiveCity("");
    setActiveCategories([]);
    setActiveWhatsApp("All");
    setCurrentPage(1);
    toast("Filters reset to default", "success");
  };

  // Business filtering logic based on "active" filters
  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      // Name or Phone Search
      if (activeSearch) {
        const term = activeSearch.toLowerCase().trim();
        const matchesName = b.name.toLowerCase().includes(term);
        const matchesPhone = b.phone.toLowerCase().includes(term);
        if (!matchesName && !matchesPhone) return false;
      }

      // Governorate Filter
      if (activeGovernorate && b.governorate !== activeGovernorate) {
        return false;
      }

      // City Filter
      if (activeCity && b.city !== activeCity) {
        return false;
      }

      // Multi-select Categories Filter (matches if list is empty or business category matches any in selection)
      if (activeCategories.length > 0 && !activeCategories.includes(b.category)) {
        return false;
      }

      // WhatsApp Available Filter
      if (activeWhatsApp !== "All") {
        const wantsWhatsApp = activeWhatsApp === "Yes";
        if (b.whatsApp !== wantsWhatsApp) return false;
      }

      return true;
    });
  }, [businesses, activeSearch, activeGovernorate, activeCity, activeCategories, activeWhatsApp]);

  // Pagination Calculations
  const totalResults = filteredBusinesses.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / limitPerPage));
  const startIndex = (currentPage - 1) * limitPerPage;
  const endIndex = Math.min(startIndex + limitPerPage, totalResults);

  const paginatedBusinesses = useMemo(() => {
    return filteredBusinesses.slice(startIndex, endIndex);
  }, [filteredBusinesses, startIndex, endIndex]);

  // Export to CSV Function
  const handleExportCSV = () => {
    if (filteredBusinesses.length === 0) {
      toast("No records available to export.", "error");
      return;
    }

    const headers = ["Business Name", "City", "Governorate", "Category", "Phone", "Website", "Instagram", "Facebook", "WhatsApp Enabled", "Address", "Created By", "Created At"];
    const rows = filteredBusinesses.map(b => [
      `"${b.name.replace(/"/g, '""')}"`,
      `"${b.city}"`,
      `"${b.governorate}"`,
      `"${b.category}"`,
      `"${b.phone}"`,
      `"${(b.website || "").replace(/"/g, '""')}"`,
      `"${b.instagram || ""}"`,
      `"${b.facebook || ""}"`,
      b.whatsApp ? "Yes" : "No",
      `"${(b.address || "").replace(/"/g, '""')}"`,
      `"${b.createdBy}"`,
      `"${b.createdAt}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `iraq_intelligence_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Successfully exported ${totalResults} businesses to CSV!`, "success");
  };

  const isAdmin = currentUser.role === "admin";

  return (
    <div className="space-y-6">
      {/* Search and Filters Bento Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-slate-800 font-display">Intelligence Filter Array</h3>
          </div>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Selected ({totalResults}) to CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Search Box */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Node</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search business name or phone..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Governorate Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Governorate</label>
            <select
              value={selectedGovernorate}
              onChange={(e) => {
                setSelectedGovernorate(e.target.value);
                setSelectedCity(""); // Reset city selection if governorate changes
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
            >
              <option value="">All Governorates (Entire Iraq)</option>
              {GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">City Node (19 Cities)</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
            >
              <option value="">All Cities</option>
              {CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories Multi-Select Section */}
        <div className="mt-5 space-y-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Category Sectors</label>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50">
            {CATEGORIES.map(category => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium border transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* WhatsApp Toggle Buttons */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">WhatsApp Line:</span>
            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
              {(["All", "Yes", "No"] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setWhatsAppFilter(option)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    whatsAppFilter === option
                      ? "bg-white text-amber-700 shadow-xs border border-slate-100"
                      : "text-slate-550 hover:text-slate-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetFilters}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-605 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Filter className="h-4 w-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/55">
          <div>
            <h3 className="font-bold text-slate-800 text-lg font-display">Scraped Business Directory</h3>
            <p className="text-xs text-slate-500 mt-0.5">Showing verified company registry data across selected geographic nodes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">Records per page:</span>
            <select
              value={limitPerPage}
              onChange={(e) => {
                setLimitPerPage(Number(e.target.value) as 25 | 50 | 100);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1 text-xs font-semibold border border-slate-250 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Business / Hub</th>
                <th className="px-6 py-3.5">Category Sector</th>
                <th className="px-6 py-3.5">Geographic Location</th>
                <th className="px-6 py-3.5">Primary Contact</th>
                <th className="px-6 py-3.5 text-center">WhatsApp Link</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {paginatedBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold">No nodes correspond to active search parameters.</p>
                    <p className="text-xs text-slate-450 mt-1">Try resetting the geographic filters or category selectors.</p>
                  </td>
                </tr>
              ) : (
                paginatedBusinesses.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/15 transition-all">
                    {/* Name + Address */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{b.name}</div>
                      {b.address && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[240px]">{b.address}</span>
                        </div>
                      )}
                    </td>
                    {/* Category pill */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100">
                        {b.category}
                      </span>
                    </td>
                    {/* Geographics */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-slate-800 font-medium">{b.city}</div>
                      <div className="text-xs text-slate-450 font-mono text-[10px]">{b.governorate} Gov.</div>
                    </td>
                    {/* Contact detail / Icons */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs text-slate-700 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        {b.phone}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-slate-400">
                        {b.website && (
                          <a href={b.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 transition-colors" title="Website link">
                            <Globe className="h-3.5 w-3.5" />
                          </a>
                        )}
                        {b.instagram && (
                          <span className="hover:text-amber-601 text-[10px]" title={`Instagram: @${b.instagram}`}>
                            ig: @{b.instagram}
                          </span>
                        )}
                        {b.facebook && (
                          <span className="hover:text-amber-601 text-[10px]" title={`Facebook: ${b.facebook}`}>
                            fb: {b.facebook}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* WhatsApp */}
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {b.whatsApp ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-150 rounded-lg text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 border border-slate-150 rounded-lg text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          No
                        </span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedDetail(b)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="View complete hub node information"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {isAdmin ? (
                          <>
                            <button
                              onClick={() => onEditClick(b)}
                              className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 hover:text-amber-800 transition-colors cursor-pointer"
                              title="Edit business database node"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete "${b.name}"?`)) {
                                  onDeleteClick(b.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Remove business from index"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          b.createdBy === currentUser.email && (
                            <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                              Your Upload
                            </span>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-550">
            {totalResults > 0 ? (
              <>
                Showing <span className="font-semibold text-slate-800">{startIndex + 1}</span>–
                <span className="font-semibold text-slate-800">{endIndex}</span> of{" "}
                <span className="font-semibold text-slate-800">{totalResults}</span> business nodes
              </>
            ) : (
              "No nodes to display"
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || totalResults === 0}
              className="inline-flex items-center justify-center p-2 border border-slate-200 bg-white hover:bg-slate-55 text-slate-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-semibold text-slate-700">
              Page <span className="text-amber-700 font-bold">{currentPage}</span> of {totalPages}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalResults === 0}
              className="inline-flex items-center justify-center p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Node Detail Spotlight Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-150 transform transition-all">
            <div className="px-6 py-5 bg-amber-500 text-white flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-600 text-amber-50 px-2.5 py-1 rounded-full">{selectedDetail.category}</span>
                <h4 className="text-xl font-bold font-display mt-2">{selectedDetail.name}</h4>
              </div>
              <button 
                onClick={() => setSelectedDetail(null)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide">City Location</span>
                  <span className="font-semibold text-slate-800 text-sm mt-1 block">{selectedDetail.city}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide">Governorate Zone</span>
                  <span className="font-semibold text-slate-800 text-sm mt-1 block">{selectedDetail.governorate}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Phone Hotline:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedDetail.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">WhatsApp Availability:</span>
                  <span className={`font-semibold ${selectedDetail.whatsApp ? "text-emerald-600" : "text-slate-400"}`}>
                    {selectedDetail.whatsApp ? "Yes (Active)" : "No"}
                  </span>
                </div>
                {selectedDetail.website && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Official Website:</span>
                    <a href={selectedDetail.website} target="_blank" rel="noopener noreferrer" className="text-amber-650 hover:underline inline-flex items-center gap-1 truncate max-w-[200px]">
                      {selectedDetail.website}
                    </a>
                  </div>
                )}
              </div>

              {selectedDetail.address && (
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide mb-1">Detailed Address</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    "{selectedDetail.address}"
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Sourcing node</span>
                  <span className="font-semibold text-slate-700 truncate block">{selectedDetail.createdBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Scraped At</span>
                  <span className="font-semibold text-slate-705 block">{new Date(selectedDetail.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetail(null)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-350 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Node Spotlight
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
