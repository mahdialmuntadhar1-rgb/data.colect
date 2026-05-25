export interface Business {
  id: string;
  name: string;
  city: string;
  governorate: string;
  category: string;
  phone: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  whatsApp: boolean;
  address?: string;
  createdBy: string; // 'system' or user email
  createdAt: string;
}

export interface ScrapingLog {
  id: string;
  city: string;
  date: string;
  recordsAdded: number;
  status: 'Completed' | 'Failed';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'suspended';
}

export interface AuthSession {
  token: string;
  user: {
    email: string;
    role: 'admin' | 'user';
  };
}
