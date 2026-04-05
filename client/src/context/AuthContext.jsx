import { createContext, useContext, useEffect, useMemo, useState } from "react";

import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ticket_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("ticket_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("ticket_token", token);
    } else {
      localStorage.removeItem("ticket_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ticket_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ticket_user");
    }
  }, [user]);

  const authenticate = async (path, payload) => {
    const response = await api.post(path, payload);
    setToken(response.data.token);
    setUser(response.data.user);
    return response.data;
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      login: (payload) => authenticate("/auth/login", payload),
      register: (payload) => authenticate("/auth/register", payload),
      logout: () => {
        setToken(null);
        setUser(null);
      }
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
