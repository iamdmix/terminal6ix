"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { api, getToken, setToken } from "@/lib/api"
import type { User, UserRole } from "@/lib/types"

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  signup: (data: { name: string; email: string; password: string; role: UserRole; phone?: string }) => Promise<User>
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const router = useRouter()

  React.useEffect(() => {
    let cancelled = false
    async function loadUser() {
      if (!getToken()) {
        setLoading(false)
        return
      }
      try {
        const me = await api.get<User>("/auth/me")
        if (!cancelled) setUser(me)
      } catch {
        setToken(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadUser()
    return () => {
      cancelled = true
    }
  }, [])

  const login = React.useCallback(async (email: string, password: string) => {
    const res = await api.post<{ access_token: string }>("/auth/login", { email, password })
    setToken(res.access_token)
    const me = await api.get<User>("/auth/me")
    setUser(me)
    return me
  }, [])

  const signup = React.useCallback(
    async (data: { name: string; email: string; password: string; role: UserRole; phone?: string }) => {
      await api.post<User>("/auth/signup", data)
      return login(data.email, data.password)
    },
    [login],
  )

  const logout = React.useCallback(() => {
    setToken(null)
    setUser(null)
    router.push("/")
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
