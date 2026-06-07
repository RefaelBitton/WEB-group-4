import React, { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../logic/userApi.js";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  async function login(credentials) {
    const res = await loginUser(credentials);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user ?? null);
    }
    return res;
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  async function register(data) {
    return registerUser(data);
  }

  return (
    <UserContext.Provider value={{ user, token, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
