import React, { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type { AuthResponse, LoginRequest, RegisterRequest } from "../services/contracts";
import * as AuthService from "../services/auth.service";
import * as UsersService from "../services/users.service";
import { getStoredToken, setStoredToken } from "../services/api";

type AuthUser = {
  id: number;
  email: string;
  name: string;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  emailVerified: boolean | null;
};

type AuthContextValue = AuthState & {
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  setEmailVerified: (value: boolean) => void;
};

const AUTH_STATE_KEY = "aquidolado.authState";

export const AuthContext = createContext<AuthContextValue | null>(null);

function toState(res: AuthResponse): AuthState {
  return {
    token: res.token,
    user: { id: res.userId, email: res.email, name: res.name },
    emailVerified: res.emailVerified ?? null,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ token: null, user: null, emailVerified: null });

  useEffect(() => {
    const token = getStoredToken();
    const raw = localStorage.getItem(AUTH_STATE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AuthState;
        // Se houver token armazenado, preferimos esse token
        setState({
          token: token ?? parsed.token ?? null,
          user: parsed.user ?? null,
          emailVerified: parsed.emailVerified ?? null,
        });
        return;
      } catch {
        // ignore
      }
    }
    if (token) {
      setState((s) => ({ ...s, token }));
    }
  }, []);

  /* Sincroniza emailVerified com o backend quando o usuário está logado e ainda consta como não verificado */
  useEffect(() => {
    if (!state.token || state.user == null || state.emailVerified !== false) return;
    UsersService.getProfile()
      .then((profile) => {
        if (profile.emailVerified === true) {
          setState((s) => {
            const next = { ...s, emailVerified: true };
            localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(next));
            return next;
          });
        }
      })
      .catch(() => {});
  }, [state.token, state.user, state.emailVerified]);

  const persist = useCallback((next: AuthState) => {
    setState(next);
    setStoredToken(next.token);
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(next));
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    const res = await AuthService.login(payload);
    persist(toState(res));
  }, [persist]);

  const register = useCallback(async (payload: RegisterRequest) => {
    const res = await AuthService.register(payload);
    persist(toState(res));
  }, [persist]);

  const logout = useCallback(() => {
    AuthService.logout();
    setStoredToken(null);
    localStorage.removeItem(AUTH_STATE_KEY);
    setState({ token: null, user: null, emailVerified: null });
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setState((s) => {
      if (!s.user) return s;
      const next = { ...s, user: { ...s.user, ...updates } };
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setEmailVerified = useCallback((value: boolean) => {
    setState((s) => {
      const next = { ...s, emailVerified: value };
      localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, register, logout, updateUser, setEmailVerified }),
    [state, login, register, logout, updateUser, setEmailVerified]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

