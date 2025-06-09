import React, { createContext, useState, useEffect, useMemo } from "react";
import { useAppDispatch } from "../store";
import { setUser, clearUser } from "../store/authSlice";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  user: { userId: string; role: string; login: string } | null;
  login: (token: string, user: { userId: string; role: string; login: string }) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const [userState, setUserState] = useState<{
    userId: string;
    role: string;
    login: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  const login = (
    newToken: string,
    userObj: { userId: string; role: string; login: string }
  ) => {
    setToken(newToken);
    setUserState(userObj);
    dispatch(setUser(userObj));
  };

  const logout = () => {
    setToken(null);
    setUserState(null);
    dispatch(clearUser());
  };

  const contextValue = useMemo(
    () => ({ token, user: userState, login, logout }),
    [token, userState, login, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
