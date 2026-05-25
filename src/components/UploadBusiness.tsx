import React, { useState, useEffect } from "react";
import { PlusCircle, Compass, FileText, CheckCircle, AlertCircle, Phone, Info } from "lucide-react";
import { api } from "../api";
import { CITIES, CATEGORIES, CITY_TO_GOVERNORATE } from "../cities";

interface UploadBusinessProps {
  currentUser: { email: string; role: "admin" | "user" };
  onUploadSuccess: () => void;
  toast: (message: string, type: "success" | "error") => void;
}

export default function UploadBusiness({
  currentUser,
  onUploadSuccess,
  toast
}: UploadBusinessProps) {
  // Form State
  const [name, setName] = useState("");
  const [city, setCity] = useState(CITIES[0] || "");
  const [derivedGovernorate, setDerivedGovernorate] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0] || "");
  const [customCategory, setCustomCategory] = useState("");
  const [useCustomCategory, setUseCustomCategory] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [whatsApp, setWhatsApp] = useState(false);
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Automatically derive governorate whenever city changes
  useEffect(() => {
    if (city) {
      setDerivedGovernorate(CITY_TO_GOVERNORATE[city] || city);
    }
  }, [city]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus(null);

    // Validation
    if (!name.trim()) {
      setErrorStatus("Business name is required.");
      return;
    }
    if (!phone.trim()) {
      setErrorStatus("Primary phone number is required.");
      return;
    }

    const finalCategory = useCustomCategory ? customCategory.trim() : category;
    if (!finalCategory) {
      setErrorStatus("Please specify a business service category.");
      return;
    }

    setIsLoading(true);

    const payload = {
      name: name.trim(),
      city,
      category: finalCategory,
      phone: phone.trim(),
      website: website.trim() ? website.trim() : undefined,
      instagram: instagram.trim() ? instagram.trim() : undefined,
      facebook: facebook.trim() ? facebook.trim() : undefined,
      whatsApp,
      address: address.trim() ? address.trim() : undefined,
    };

    try {
      await api.addBusiness(payload, currentUser.email);
      
      // Success feedback
      toast(`Successfully indexed "${name.trim()}" in ${city}!`, "success");
      
      // Reset form variables
      setName("");
      setPhone("");
      setWebsite("");
      setInstagram("");
      setFacebook("");
      setWhatsApp(false);
      setAddress("");
      setCustomCategory("");
      setUseCustomCategory(false);
      
      onUploadSuccess();
    } catch (err: any) {
      const errMsg = err.message || "Failed to add business node.";
      setErrorStatus(errMsg);
      toast(errMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 max-w-3xl mx-auto">
      <div className="border-b border-slate-100 pb-4 mb-6">
        <h3 className="text-xl font-bold text-slate-800 font-display flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-amber-500 animate-pulse" />
          Index New Business Node
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Manually register a verified Iraqi business. Nodes are instantly checked for duplicates (identical name + city + phone) in the registry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorStatus && (
          <div className="rounded-xl bg-rose-50 p-4 border border-rose-100 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-800">Registration Blocked</h4>
              <p className="text-xs text-rose-700 mt-1">{errorStatus}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Business Name */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">Business Name <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Al-Dhahab Jewellers"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-xs font-bold text-slate-700 block">Phone Number <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +964 770 123 4567"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
              <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* City Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">City Node <span className="text-rose-500">*</span></label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
            >
              {CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Derived Governorate (Disabled view/info) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 block">Derived Governorate Zone</label>
            <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium font-mono">
              {derivedGovernorate} Governorate
            </div>
          </div>

          {/* Category Service Selector */}
          <div className="space-y-1 col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Category Sector <span className="text-rose-500">*</span></label>
              <button
                type="button"
                onClick={() => setUseCustomCategory(!useCustomCategory)}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
              >
                {useCustomCategory ? "[Choose standard list]" : "[Type custom category field]"}
              </button>
            </div>

            {useCustomCategory ? (
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Traditional Rug Sourcing, Local Dairy Farm..."
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 bg-white"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          {/* Website optional */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">Website URL (Optional)</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://company-iraq.com"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          {/* WhatsApp Available */}
          <div className="space-y-1 flex flex-col justify-end">
            <div className="flex items-center space-x-3.5 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              <input
                type="checkbox"
                id="whatsApp"
                checked={whatsApp}
                onChange={(e) => setWhatsApp(e.target.checked)}
                className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-slate-350 rounded transition-all shrink-0 cursor-pointer"
              />
              <label htmlFor="whatsApp" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                WhatsApp Hotline Enabled?
                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Check if this phone number receives automated WhatsApp messages</span>
              </label>
            </div>
          </div>

          {/* Instagram Handle */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">Instagram Handle (Optional)</label>
            <div className="relative rounded-md shadow-sm">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="re_jewellers"
                className="w-full pl-7 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
              />
            </div>
          </div>

          {/* Facebook Handler */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-900 block">Facebook Handle / Name (Optional)</label>
            <input
              type="text"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="e.g. aldhahab.gold"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900"
            />
          </div>

          {/* Address */}
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-bold text-slate-950 block">Physical Address (Optional)</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street location, near specific mosque, landmark or bazaar..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 resize-none font-sans"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-450 max-w-md">
            <Info className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            This hub node is catalogued under your regular session email: <strong className="text-slate-650">{currentUser.email}</strong>.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-sm hover:shadow hover:bg-amber-70 animate-transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
          >
            {isLoading ? "Indexing Node..." : "Upload Business Node"}
          </button>
        </div>
      </form>
    </div>
  );
}
