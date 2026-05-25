export const CITY_TO_GOVERNORATE: Record<string, string> = {
  "Baghdad": "Baghdad",
  "Basra": "Basra",
  "Erbil": "Erbil",
  "Sulaymaniyah": "Sulaymaniyah",
  "Mosul": "Nineveh",
  "Kirkuk": "Kirkuk",
  "Najaf": "Najaf",
  "Karbala": "Karbala",
  "Hillah": "Babylon",
  "Ramadi": "Al Anbar",
  "Fallujah": "Al Anbar",
  "Samawah": "Al Muthanna",
  "Nasiriyah": "Dhi Qar",
  "Amarah": "Maysan",
  "Diwaniyah": "Al-Qadisiyah",
  "Kut": "Wasit",
  "Dohuk": "Dohuk",
  "Zakho": "Dohuk",
  "Tikrit": "Saladin"
};

export const CITIES = Object.keys(CITY_TO_GOVERNORATE).sort();
export const GOVERNORATES = Array.from(new Set(Object.values(CITY_TO_GOVERNORATE))).sort();

export const CATEGORIES = [
  "Cafes & Restaurants",
  "Hospitality & Hotels",
  "Retail & Shopping",
  "Healthcare & Pharmacy",
  "Mobile & Electronics",
  "Automotive & Garage",
  "Banking & Exchange",
  "Real Estate & Construction",
  "Education & Training",
  "Beauty & Salons",
  "Logistics & Shipping"
];
