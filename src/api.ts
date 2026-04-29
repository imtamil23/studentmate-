import { getSupabase } from "./lib/supabase";

const API_BASE = "/api";

export const api = {
  async fetch(endpoint: string, options: RequestInit = {}) {
    const supabase = getSupabase();
    let token = localStorage.getItem("token");

    // If we have a supabase session, try to get the current access token
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        token = data.session.access_token;
      }
    }

    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      
      // Safety check for empty responses
      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: "Failed to parse response", raw: text };
      }

      if (!res.ok) {
        console.error(`API Error: ${res.status} ${res.statusText} at ${endpoint}`, data);
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      return data;
    } catch (e: any) {
      console.error(`Network or fetch error at ${endpoint}:`, e);
      // Re-throw with more context if it's a native fetch error
      if (e.message === "Failed to fetch") {
        throw new Error(`Failed to connect to server at ${endpoint}. Please check if the backend is running.`);
      }
      throw e;
    }
  },

  auth: {
    login: async (credentials: any) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });
        
        if (error) throw error;
        
        // Return structured data like before, but user comes from session
        return {
          token: data.session?.access_token,
          user: data.user
        };
      }
      
      // Fallback to Express backend if Supabase not configured
      return api.fetch("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    },
    register: async (details: any) => {
      const supabase = getSupabase();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: details.email,
          password: details.password,
          options: {
            data: {
              name: details.name,
            }
          }
        });
        
        if (error) throw error;
        
        // After Supabase registration, we also want to ensure the backend has a profile
        // The App.tsx onAuthStateChange will handle setting the token and navigating,
        // but we can proactively hit the backend register to ensure db sync if needed.
        // However, Supabase auth.signUp doesn't always return a session immediately (if email confirmation is on).
        
        return {
          token: data.session?.access_token,
          user: data.user
        };
      }
      
      return api.fetch("/auth/register", { method: "POST", body: JSON.stringify(details) });
    },
    logout: async () => {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem("token");
    }
  },

  profile: {
    get: () => api.fetch("/profile"),
    update: (data: any) => api.fetch("/profile", { method: "PUT", body: JSON.stringify(data) }),
  },

  scholarships: {
    list: () => api.fetch("/scholarships"),
    create: (data: any) => api.fetch("/scholarships", { method: "POST", body: JSON.stringify(data) }),
    sync: (data: any[]) => api.fetch("/scholarships/sync", { method: "POST", body: JSON.stringify(data) }),
  },

  subsidies: {
    list: () => api.fetch("/subsidies"),
  },

  projects: {
    list: () => api.fetch("/projects"),
    create: (data: any) => api.fetch("/projects", { method: "POST", body: JSON.stringify(data) }),
  },

  notifications: {
    list: () => api.fetch("/notifications"),
    markAsRead: (id: string) => api.fetch(`/notifications/${id}/read`, { method: "PUT" }),
    markAllAsRead: () => api.fetch("/notifications/read-all", { method: "PUT" }),
  },

  documents: {
    upload: async (file: File, name: string, type: string) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", name);
      formData.append("type", type);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/profile/documents/upload`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      return res.json();
    },
    verify: (id: string) => api.fetch(`/profile/documents/${id}/verify`, { method: "PUT" }),
  },
  ai: {
    search: (prompt: string) => api.fetch("/ai/search", { method: "POST", body: JSON.stringify({ prompt }) }),
  }
};
