import { Business, User, ScrapingLog } from "./types";
import { CITY_TO_GOVERNORATE } from "./cities";

export const MOCK_USERS: User[] = [
  { id: "u-1", email: "admin@example.com", role: "admin", status: "active" },
  { id: "u-2", email: "user@example.com", role: "user", status: "active" },
  { id: "u-3", email: "analyst_iq@example.com", role: "user", status: "active" },
  { id: "u-4", email: "basra_ops@example.com", role: "user", status: "active" }
];

export const INITIAL_SCRAPING_LOGS: ScrapingLog[] = [
  { id: "log-1", city: "Baghdad", date: "2026-05-24T18:30:00Z", recordsAdded: 4, status: "Completed" },
  { id: "log-2", city: "Basra", date: "2026-05-24T19:15:00Z", recordsAdded: 3, status: "Completed" },
  { id: "log-3", city: "Erbil", date: "2026-05-24T20:00:00Z", recordsAdded: 5, status: "Completed" },
  { id: "log-4", city: "Sulaymaniyah", date: "2026-05-25T08:00:00Z", recordsAdded: 2, status: "Completed" }
];

const rawMockData = [
  { name: "Al-Razaq Palace Cafe", city: "Baghdad", category: "Cafes & Restaurants", phone: "+964 770 123 4567", whatsApp: true, website: "https://dijlah-cafe.com", instagram: "alrazaq_cafe", facebook: "alrazaq.cafe", address: "Karrada District, Near Kahramana Square" },
  { name: "Dijlah Plaza Premium Hotel", city: "Baghdad", category: "Hospitality & Hotels", phone: "+964 780 456 7890", whatsApp: true, website: "https://dijlahplaza.iq", instagram: "dijlah_plaza_hotel", facebook: "", address: "Abu Nuwas Street" },
  { name: "Babylon Shopping Mall", city: "Baghdad", category: "Retail & Shopping", phone: "+964 790 111 2222", whatsApp: false, website: "https://babylon-mall.iq", instagram: "babylon_mall", facebook: "babylonmall", address: "Mansour District" },
  { name: "Mutanabbi Heritage Bookshop", city: "Baghdad", category: "Retail & Shopping", phone: "+964 771 999 8888", whatsApp: true, website: "", instagram: "", facebook: "mutanabbi.books", address: "Mutanabbi Street" },
  { name: "Al-Mansour Day Clinic", city: "Baghdad", category: "Healthcare & Pharmacy", phone: "+964 750 333 4444", whatsApp: false, website: "", instagram: "mansour_clinic", facebook: "mansour.clinic", address: "14 Ramadhan Street" },
  
  { name: "Shatt Al-Arab Seafood Restaurant", city: "Basra", category: "Cafes & Restaurants", phone: "+964 770 222 3333", whatsApp: true, website: "https://basra-seafood.com", instagram: "shatt_seafood", facebook: "shatt.seafood", address: "Corniche Road" },
  { name: "Basra International Airport Hotel", city: "Basra", category: "Hospitality & Hotels", phone: "+964 781 555 6666", whatsApp: false, website: "https://basraairport-hotel.com", instagram: "", facebook: "", address: "Airport Road" },
  { name: "Sindbad Logistics Services", city: "Basra", category: "Logistics & Shipping", phone: "+964 790 777 8888", whatsApp: true, website: "https://sindbad-logistics.iq", instagram: "", facebook: "sindbad.logistics", address: "Al-Ashar Port Area" },
  { name: "Amir Exchange & Money Transfer", city: "Basra", category: "Banking & Exchange", phone: "+964 772 444 5555", whatsApp: true, website: "", instagram: "", facebook: "amir.exchange", address: "Al-Watani Street" },

  { name: "Erbil Citadel View Cafe", city: "Erbil", category: "Cafes & Restaurants", phone: "+964 750 111 0000", whatsApp: true, website: "", instagram: "citadel.view.erbil", facebook: "citadelview", address: "Citadel Square, Downtown" },
  { name: "Ankawa Royal Suites", city: "Erbil", category: "Hospitality & Hotels", phone: "+964 750 444 7777", whatsApp: true, website: "https://ankawa-royal.com", instagram: "ankawa_royal", facebook: "ankawa_royal", address: "Ankawa Main Street" },
  { name: "Majidi Mall Mega Center", city: "Erbil", category: "Retail & Shopping", phone: "+964 750 888 9999", whatsApp: false, website: "https://majidimall.com", instagram: "majidi_mall_erbil", facebook: "majidimall", address: "Koya Road" },
  { name: "Erbil IT Support & Networks", city: "Erbil", category: "Mobile & Electronics", phone: "+964 751 222 3333", whatsApp: true, website: "https://erbil-it.net", instagram: "", facebook: "", address: "30 Meter Street" },

  { name: "Saryas Organic Bakery", city: "Sulaymaniyah", category: "Cafes & Restaurants", phone: "+964 770 112 2334", whatsApp: true, website: "", instagram: "saryas_bakery", facebook: "saryas.bakery", address: "Salim Street" },
  { name: "Mount Goizha Panoramic Resort", city: "Sulaymaniyah", category: "Hospitality & Hotels", phone: "+964 773 888 1122", whatsApp: true, website: "https://goizha-resort.net", instagram: "goizha_resort", facebook: "", address: "Goizha Mountain Crest" },
  { name: "Chavy Land Tech Hub", city: "Sulaymaniyah", category: "Education & Training", phone: "+964 770 999 5555", whatsApp: false, website: "", instagram: "chavy_tech", facebook: "chavytech", address: "Chavy Land Park" },
  { name: "Hevi Specialized Pharmacy", city: "Sulaymaniyah", category: "Healthcare & Pharmacy", phone: "+964 771 444 3333", whatsApp: true, website: "", instagram: "", facebook: "hevi.pharmacy", address: "Rzgari Street" },

  { name: "Al-Nuri Traditional Market", city: "Mosul", category: "Retail & Shopping", phone: "+964 782 111 4444", whatsApp: false, website: "", instagram: "", facebook: "alnuri.market", address: "Old City District" },
  { name: "Mosul Heritage Restaurant", city: "Mosul", category: "Cafes & Restaurants", phone: "+964 751 777 8888", whatsApp: true, website: "", instagram: "mosul_heritage", facebook: "mosul.heritage", address: "Left Bank, Near University of Mosul" },
  { name: "Al-Hadba Electronics Center", city: "Mosul", category: "Mobile & Electronics", phone: "+964 783 222 9999", whatsApp: true, website: "https://alhadba-electro.iq", instagram: "alhadba_mosul", facebook: "alhadba.electronics", address: "Al-Zuhour Street" },

  { name: "Kirkuk Castle Turkish Coffee", city: "Kirkuk", category: "Cafes & Restaurants", phone: "+964 770 888 4444", whatsApp: true, website: "", instagram: "kirkuk_castle_cafe", facebook: "", address: "Castle Entrance Road" },
  { name: "Baba Gurgur Petroleum Technical", city: "Kirkuk", category: "Real Estate & Construction", phone: "+964 771 555 9999", whatsApp: false, website: "https://bg-petro.example.com", instagram: "", facebook: "bg.services", address: "Industrial Area Road" },
  { name: "Golden Wheat Pharmacy & Lab", city: "Kirkuk", category: "Healthcare & Pharmacy", phone: "+964 772 333 5555", whatsApp: true, website: "", instagram: "golden_wheat_rx", facebook: "", address: "Al-Atiba (Doctors) Street" },

  { name: "Al-Ghadeer Pilgrim Plaza", city: "Najaf", category: "Hospitality & Hotels", phone: "+964 780 123 9999", whatsApp: true, website: "https://alghadeer-plaza.com", instagram: "alghadeer_najaf", facebook: "alghadeer.najaf", address: "Senat Street, Near Holy Shrine" },
  { name: "Al-Rawda Academic Bookstore", city: "Najaf", category: "Education & Training", phone: "+964 781 444 5555", whatsApp: false, website: "", instagram: "", facebook: "alrawda.books", address: "University Road" },
  { name: "Kufa Valley General Trading", city: "Najaf", category: "Logistics & Shipping", phone: "+964 780 777 1234", whatsApp: true, website: "", instagram: "kufa_valley", facebook: "kufavalley", address: "Kufa Bridge Highway" },

  { name: "Al-Rawdah Garden Tea House", city: "Karbala", category: "Cafes & Restaurants", phone: "+964 782 555 6666", whatsApp: true, website: "", instagram: "karbala_teahouse", facebook: "karbala.teahouse", address: "Al-Abbas Street" },
  { name: "Karbala Rayhaan Executive Hotel", city: "Karbala", category: "Hospitality & Hotels", phone: "+964 780 999 0000", whatsApp: true, website: "https://karbalarayhaan.iq", instagram: "rayhaan_karbala", facebook: "rayhaankarbala", address: "Bab Baghdad" },
  { name: "Al-Hussein Medical Pharmacy", city: "Karbala", category: "Healthcare & Pharmacy", phone: "+964 783 777 3333", whatsApp: false, website: "", instagram: "", facebook: "", address: "Al-Islaah Street" },

  { name: "Babylonian Gardens Cafe", city: "Hillah", category: "Cafes & Restaurants", phone: "+964 781 222 1111", whatsApp: true, website: "", instagram: "babylon_gardens_hillah", facebook: "babylongardens", address: "Babylon Ruins Road" },
  { name: "Hillah Fresh Fruits & Vegetables", city: "Hillah", category: "Retail & Shopping", phone: "+964 782 999 8888", whatsApp: false, website: "", instagram: "", facebook: "hillah.fresh", address: "Central City Market" },

  { name: "Al-Anbar General Imports", city: "Ramadi", category: "Retail & Shopping", phone: "+964 773 123 0000", whatsApp: true, website: "", instagram: "", facebook: "anbar.imports", address: "Main Bazaar Road" },
  { name: "Euphrates Mobile & Computer Store", city: "Ramadi", category: "Mobile & Electronics", phone: "+964 780 555 4444", whatsApp: true, website: "", instagram: "euphrates_tech", facebook: "", address: "Al-Mustashfa Street" },

  { name: "Fallujah Bakery & Sweets", city: "Fallujah", category: "Cafes & Restaurants", phone: "+964 781 111 2222", whatsApp: true, website: "", instagram: "fallujah_sweets", facebook: "fallujah.bakery", address: "Al-Thawrah Street" },
  { name: "Al-Huda Pediatric Pharmacy", city: "Fallujah", category: "Healthcare & Pharmacy", phone: "+964 783 444 8888", whatsApp: false, website: "", instagram: "", facebook: "", address: "Saddah Road" },

  { name: "Al-Khidr Rice & Wheat Grains", city: "Samawah", category: "Retail & Shopping", phone: "+964 780 666 4444", whatsApp: false, website: "", instagram: "", facebook: "", address: "Silo Highway" },
  { name: "Samawah Riverfront Lodging", city: "Samawah", category: "Hospitality & Hotels", phone: "+964 781 888 7777", whatsApp: true, website: "https://samawahriver.com", instagram: "samawah_lodge", facebook: "", address: "River Bank Promenade" },

  { name: "Ziggurat Historical Cafe", city: "Nasiriyah", category: "Cafes & Restaurants", phone: "+964 781 777 5555", whatsApp: true, website: "", instagram: "ziggurat_cafe", facebook: "ziggurat.cafe", address: "Near Ur Ziggurat Road" },
  { name: "Dhi Qar Freight Trucking", city: "Nasiriyah", category: "Logistics & Shipping", phone: "+964 782 333 4444", whatsApp: false, website: "", instagram: "", facebook: "dq.freight", address: "Industrial Sector West" },

  { name: "Maysan Marshland Tours & Lodges", city: "Amarah", category: "Hospitality & Hotels", phone: "+964 770 555 1212", whatsApp: true, website: "https://maysanmarsh.com", instagram: "maysan_marshes", facebook: "maysanmarsh", address: "Chibayish Entrance" },
  { name: "Amarah Family Wellness Clinic", city: "Amarah", category: "Healthcare & Pharmacy", phone: "+964 771 888 4444", whatsApp: true, website: "", instagram: "", facebook: "amarah.clinic", address: "Saeed Street" },

  { name: "Diwaniyah Dairy Farms Outlet", city: "Diwaniyah", category: "Retail & Shopping", phone: "+964 783 111 5555", whatsApp: false, website: "", instagram: "", facebook: "diwaniyah.dairy", address: "Agriculture Road" },
  { name: "Al-Furat Modern Shopping Arcade", city: "Diwaniyah", category: "Retail & Shopping", phone: "+964 780 222 6666", whatsApp: true, website: "", instagram: "alfurat_mall", facebook: "", address: "Kufa Road" },

  { name: "Wasit Farmers Cooperative", city: "Kut", category: "Retail & Shopping", phone: "+964 781 999 5555", whatsApp: true, website: "", instagram: "", facebook: "wasit.farmers", address: "Kut Bridge Road" },
  { name: "Kut Center Kabab & Grill", city: "Kut", category: "Cafes & Restaurants", phone: "+964 782 444 8888", whatsApp: true, website: "", instagram: "kut_kabab", facebook: "kut.kabab", address: "Kut Corniche" },

  { name: "Duhok Alpine Valley Resort", city: "Dohuk", category: "Hospitality & Hotels", phone: "+964 750 777 3333", whatsApp: true, website: "https://duhokvalley.com", instagram: "duhok_valley_resort", facebook: "duhokvalley", address: "Gara Mountain Heights" },
  { name: "Dream City Telecom", city: "Dohuk", category: "Mobile & Electronics", phone: "+964 751 444 8888", whatsApp: true, website: "", instagram: "dreamcity_tech", facebook: "", address: "Dream City Arcade" },

  { name: "Delal Bridge Traditional Restaurant", city: "Zakho", category: "Cafes & Restaurants", phone: "+964 750 999 2222", whatsApp: true, website: "", instagram: "delal_bridge_rest", facebook: "delalbridge", address: "Delal Bridge Park" },
  { name: "Zakho Customs & Transit Express", city: "Zakho", category: "Logistics & Shipping", phone: "+964 751 333 4444", whatsApp: false, website: "https://zakhopost.example.com", instagram: "", facebook: "", address: "Ibrahim Khalil Border Rd" },

  { name: "Salahaddin Academic Grill", city: "Tikrit", category: "Cafes & Restaurants", phone: "+964 780 333 2222", whatsApp: true, website: "", instagram: "salahaddin_grill", facebook: "", address: "University District" },
  { name: "Tikrit Heritage Carpentry & Design", city: "Tikrit", category: "Real Estate & Construction", phone: "+964 781 888 2222", whatsApp: true, website: "", instagram: "", facebook: "tikrit.carpentry", address: "Industrial Zone" }
];

export const SEED_BUSINESSES: Business[] = rawMockData.map((b, index) => {
  const city = b.city;
  const governorate = CITY_TO_GOVERNORATE[city] || city;
  return {
    id: `b-${index + 1}`,
    name: b.name,
    city,
    governorate,
    category: b.category,
    phone: b.phone,
    website: b.website || undefined,
    instagram: b.instagram || undefined,
    facebook: b.facebook || undefined,
    whatsApp: b.whatsApp,
    address: b.address || undefined,
    createdBy: "system",
    createdAt: new Date("2026-05-24T12:00:00Z").toISOString()
  };
});
