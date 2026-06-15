import { create } from "zustand";
import { api } from "../lib/api.js";

const storedUser = localStorage.getItem("nxtbiz.user");

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  accessToken: localStorage.getItem("nxtbiz.accessToken"),
  async login(email, password) {
    const { data } = await api.post("/api/auth/login", { email, password });
    localStorage.setItem("nxtbiz.accessToken", data.accessToken);
    localStorage.setItem("nxtbiz.user", JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken });
  },
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    localStorage.setItem("nxtbiz.accessToken", data.accessToken);
    localStorage.setItem("nxtbiz.user", JSON.stringify(data.user));
    set({ user: data.user, accessToken: data.accessToken });
  },
  async logout() {
    await api.post("/api/auth/logout").catch(() => undefined);
    localStorage.removeItem("nxtbiz.accessToken");
    localStorage.removeItem("nxtbiz.user");
    set({ user: null, accessToken: null });
  }
}));
