import { useState } from 'react';

const STORAGE_KEY = "inaxel_kpi_auth";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === "ok"; }
    catch (e) { return false; }
  });

  const login = () => {
    try { sessionStorage.setItem(STORAGE_KEY, "ok"); } catch (e) {}
    setIsAuthenticated(true);
  };

  const logout = () => {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    setIsAuthenticated(false);
  };

  return { isAuthenticated, login, logout };
}
