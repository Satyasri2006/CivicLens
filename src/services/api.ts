const API_BASE_URL = 'http://localhost:5000/api';

const TOKEN_KEY = 'civiclens_auth_token';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (customHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(errorData.message || `API Error (${response.status})`);
  }
  return response.json();
}

export const api = {
  // Authentication APIs
  auth: {
    async register(data: { name: string; email: string; password: string; role?: string }) {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ token: string; user: any }>(res);
      if (result.token) setToken(result.token);
      return result;
    },

    async login(data: { email: string; password: string }) {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      const result = await handleResponse<{ token: string; user: any }>(res);
      if (result.token) setToken(result.token);
      return result;
    },

    async getMe() {
      const token = getToken();
      if (!token) return null;
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: getHeaders(),
        });
        return await handleResponse<{ user: any }>(res);
      } catch (err) {
        removeToken();
        return null;
      }
    },

    logout() {
      removeToken();
    },
  },

  // Complaint APIs
  complaints: {
    async analyze(data: { description: string; language?: string; location?: string }) {
      const res = await fetch(`${API_BASE_URL}/complaints/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse<any>(res);
    },

    async create(complaintData: any) {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(complaintData),
      });
      return await handleResponse<any>(res);
    },

    async getMyComplaints() {
      const res = await fetch(`${API_BASE_URL}/complaints`, {
        headers: getHeaders(),
      });
      return await handleResponse<any[]>(res);
    },

    async getByCaseId(caseId: string) {
      const res = await fetch(`${API_BASE_URL}/complaints/${caseId}`, {
        headers: getHeaders(),
      });
      return await handleResponse<any>(res);
    },

    async updateStatus(caseId: string, updates: { status?: string; department?: string; priority?: string }) {
      const res = await fetch(`${API_BASE_URL}/complaints/${caseId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates),
      });
      return await handleResponse<any>(res);
    },
  },

  // Admin APIs
  admin: {
    async getAllComplaints() {
      const res = await fetch(`${API_BASE_URL}/admin/complaints`, {
        headers: getHeaders(),
      });
      return await handleResponse<any[]>(res);
    },

    async getStats() {
      const res = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getHeaders(),
      });
      return await handleResponse<any>(res);
    },
  },
};
