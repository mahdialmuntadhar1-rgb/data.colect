import { Business, ScrapingLog, User, AuthSession } from "./types";
import { SEED_BUSINESSES, MOCK_USERS, INITIAL_SCRAPING_LOGS } from "./mockData";
import { CITY_TO_GOVERNORATE, CITIES, CATEGORIES } from "./cities";

const KEY_BUSINESSES = "iraq_businesses";
const KEY_LOGS = "scraping_logs";
const KEY_USERS = "registered_users";
const KEY_SESSION = "auth_session";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  async initDb(force: boolean = false): Promise<void> {
    await delay(100);
    if (!localStorage.getItem(KEY_USERS) || force) {
      localStorage.setItem(KEY_USERS, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(KEY_LOGS) || force) {
      localStorage.setItem(KEY_LOGS, JSON.stringify(INITIAL_SCRAPING_LOGS));
    }
    if (!localStorage.getItem(KEY_BUSINESSES) || force) {
      localStorage.setItem(KEY_BUSINESSES, JSON.stringify(SEED_BUSINESSES));
    }
  },

  async seedAllData(): Promise<Business[]> {
    await delay(200);
    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(SEED_BUSINESSES));
    localStorage.setItem(KEY_USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(KEY_LOGS, JSON.stringify(INITIAL_SCRAPING_LOGS));
    return SEED_BUSINESSES;
  },

  async login(email: string, password: string): Promise<AuthSession> {
    await delay(250);
    const users = this._getUsersRaw();
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      throw new Error("Invalid email or password");
    }

    const isMockAdmin = matchedUser.role === "admin" && password === "admin";
    const isMockUser = matchedUser.role === "user" && password === "user";
    const isValid = isMockAdmin || isMockUser || password === "password";

    if (!isValid) {
      throw new Error("Password must stand: 'admin' for administrator, 'user' for user emails.");
    }

    if (matchedUser.status === "suspended") {
      throw new Error("Your account has been suspended by the administrator.");
    }

    const session: AuthSession = {
      token: `mock-jwt-token-for-${matchedUser.email}-${Date.now()}`,
      user: {
        email: matchedUser.email,
        role: matchedUser.role
      }
    };

    localStorage.setItem(KEY_SESSION, JSON.stringify(session));
    return session;
  },

  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem(KEY_SESSION);
  },

  async getSession(): Promise<AuthSession | null> {
    const sessionStr = localStorage.getItem(KEY_SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  },

  async mockForgotPassword(email: string): Promise<string> {
    await delay(100);
    return `Reset link sent to your email (demo).`;
  },

  async getBusinesses(): Promise<Business[]> {
    await delay(150);
    const dataStr = localStorage.getItem(KEY_BUSINESSES);
    if (!dataStr) {
      localStorage.setItem(KEY_BUSINESSES, JSON.stringify(SEED_BUSINESSES));
      return SEED_BUSINESSES;
    }
    return JSON.parse(dataStr);
  },

  async addBusiness(bizData: Omit<Business, "id" | "createdAt" | "governorate" | "createdBy">, creatorEmail: string): Promise<Business> {
    await delay(200);
    const businesses = await this.getBusinesses();
    const governorate = CITY_TO_GOVERNORATE[bizData.city] || bizData.city;
    
    // Duplicate Check based on name + city + phone
    const normalizedName = bizData.name.trim().toLowerCase();
    const normalizedCity = bizData.city.trim().toLowerCase();
    const normalizedPhone = bizData.phone.trim().toLowerCase();

    const exists = businesses.some(b => 
      b.name.trim().toLowerCase() === normalizedName &&
      b.city.trim().toLowerCase() === normalizedCity &&
      b.phone.trim().toLowerCase() === normalizedPhone
    );

    if (exists) {
      throw new Error(`A business with the exact name "${bizData.name}" and phone "${bizData.phone}" already exists in ${bizData.city}. Duplicates are prohibited.`);
    }

    const newBiz: Business = {
      ...bizData,
      id: `b-${Date.now()}`,
      governorate,
      createdBy: creatorEmail,
      createdAt: new Date().toISOString()
    };

    businesses.unshift(newBiz);
    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(businesses));
    return newBiz;
  },

  async updateBusiness(updated: Business): Promise<Business> {
    await delay(200);
    const businesses = await this.getBusinesses();
    updated.governorate = CITY_TO_GOVERNORATE[updated.city] || updated.city;

    const normalizedName = updated.name.trim().toLowerCase();
    const normalizedCity = updated.city.trim().toLowerCase();
    const normalizedPhone = updated.phone.trim().toLowerCase();

    const clashing = businesses.some(b => 
      b.id !== updated.id &&
      b.name.trim().toLowerCase() === normalizedName &&
      b.city.trim().toLowerCase() === normalizedCity &&
      b.phone.trim().toLowerCase() === normalizedPhone
    );

    if (clashing) {
      throw new Error(`Another business with the name "${updated.name}" and phone "${updated.phone}" already exists in ${updated.city}. Can't update to duplicate.`);
    }

    const index = businesses.findIndex(b => b.id === updated.id);
    if (index === -1) {
      throw new Error("Business not found");
    }

    businesses[index] = { ...businesses[index], ...updated };
    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(businesses));
    return updated;
  },

  async deleteBusiness(id: string): Promise<boolean> {
    await delay(100);
    const businesses = await this.getBusinesses();
    const filtered = businesses.filter(b => b.id !== id);
    if (filtered.length === businesses.length) {
      return false;
    }
    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(filtered));
    return true;
  },

  async simulateScrape(onCityStart: (city: string) => void): Promise<ScrapingLog[]> {
    const scrapedLogs: ScrapingLog[] = [];
    let itemsAddedThisScrape = 0;
    const businesses = await this.getBusinesses();

    for (const city of CITIES) {
      onCityStart(city);
      await delay(150); // visual timing delay
      
      const shouldAdd = Math.random() > 0.45; 
      let addedForThisCity = 0;

      if (shouldAdd && itemsAddedThisScrape < 8) {
        const descriptors = ["Babylon", "Mesopotamia", "Baghdad Gate", "Dijlah Springs", "Ur Heritage", "Sumer", "Al-Faw", "Sindbad", "Nineveh Star", "Al-Zuhour"];
        const suffixes = ["General Store", "Consultancy & Tech", "Traditional Bakery", "Specialized Pharmacy", "Boutique Hotel", "Car Services", "Diner & Cafe", "Logistics Agency"];
        
        const randomDesc = descriptors[Math.floor(Math.random() * descriptors.length)];
        const randomCate = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const randomSuf = suffixes[Math.floor(Math.random() * suffixes.length)];
        
        const generatedName = `${randomDesc} ${randomSuf}`;
        const phoneMiddle = Math.floor(1000 + Math.random() * 9000);
        const phoneLast = Math.floor(1000 + Math.random() * 9000);
        const randomPhone = `+964 770 ${phoneMiddle} ${phoneLast}`;
        
        const normalizedName = generatedName.toLowerCase().trim();
        const normalizedPhone = randomPhone.toLowerCase().trim();

        const isDuplicate = businesses.some(b => 
          b.name.toLowerCase().trim() === normalizedName && 
          b.phone.toLowerCase().trim() === normalizedPhone && 
          b.city === city
        );

        if (!isDuplicate) {
          const newScrapedBiz: Business = {
            id: `b-scraped-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: generatedName,
            city,
            governorate: CITY_TO_GOVERNORATE[city] || city,
            category: randomCate,
            phone: randomPhone,
            whatsApp: Math.random() > 0.4,
            website: Math.random() > 0.5 ? `https://${randomDesc.toLowerCase().replace(/[^a-z0-9]/g, "")}-iraq.com` : undefined,
            instagram: Math.random() > 0.4 ? `iq_${randomDesc.toLowerCase()}` : undefined,
            facebook: Math.random() > 0.4 ? `fb.${randomDesc.toLowerCase()}` : undefined,
            address: `Simulated Scraper Street, ${city}`,
            createdBy: "Scraper simulated bot",
            createdAt: new Date().toISOString()
          };

          businesses.unshift(newScrapedBiz);
          addedForThisCity = 1;
          itemsAddedThisScrape++;
        }
      }

      const newLog: ScrapingLog = {
        id: `sc-log-${Date.now()}-${city}`,
        city,
        date: new Date().toISOString(),
        recordsAdded: addedForThisCity,
        status: "Completed"
      };
      
      scrapedLogs.push(newLog);
    }

    localStorage.setItem(KEY_BUSINESSES, JSON.stringify(businesses));

    const existingLogs = this._getLogsRaw();
    const finalLogs = [...scrapedLogs, ...existingLogs]; 
    localStorage.setItem(KEY_LOGS, JSON.stringify(finalLogs));

    return scrapedLogs;
  },

  async getScrapingLogs(): Promise<ScrapingLog[]> {
    await delay(100);
    return this._getLogsRaw();
  },

  async getUsers(): Promise<User[]> {
    await delay(100);
    return this._getUsersRaw();
  },

  async toggleUserRole(userId: string): Promise<User> {
    await delay(150);
    const users = this._getUsersRaw();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }

    if (users[index].email === "admin@example.com") {
      throw new Error("Cannot demote primary administrator account");
    }

    users[index].role = users[index].role === "admin" ? "user" : "admin";
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    return users[index];
  },

  async toggleUserStatus(userId: string): Promise<User> {
    await delay(150);
    const users = this._getUsersRaw();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) {
      throw new Error("User not found");
    }

    if (users[index].email === "admin@example.com") {
      throw new Error("Cannot suspend primary administrator account");
    }

    users[index].status = users[index].status === "active" ? "suspended" : "active";
    localStorage.setItem(KEY_USERS, JSON.stringify(users));
    return users[index];
  },

  _getUsersRaw(): User[] {
    const uStr = localStorage.getItem(KEY_USERS);
    if (!uStr) return MOCK_USERS;
    try {
      return JSON.parse(uStr);
    } catch {
      return MOCK_USERS;
    }
  },

  _getLogsRaw(): ScrapingLog[] {
    const lStr = localStorage.getItem(KEY_LOGS);
    if (!lStr) return INITIAL_SCRAPING_LOGS;
    try {
      return JSON.parse(lStr);
    } catch {
      return INITIAL_SCRAPING_LOGS;
    }
  }
};
