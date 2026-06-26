import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Plog, Photo } from '../../types'

export interface AdminContextType {
  plogs: Plog[]
  addPlog: (plog: Plog) => void
  deletePlog: (id: string) => void
  updatePlog: (plog: Plog) => void
  getPlog: (id: string) => Plog | undefined
}

const AdminContext = createContext<AdminContextType | null>(null)

export function AdminProvider({ children, initial }: { children: ReactNode; initial?: Plog[] }) {
  const [plogs, setPlogs] = useState<Plog[]>(() =>
    initial
      ? JSON.parse(JSON.stringify(initial))
      : [],
  )

  const addPlog = useCallback((plog: Plog) => {
    setPlogs((prev) => [...prev, plog])
  }, [])

  const deletePlog = useCallback((id: string) => {
    setPlogs((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const updatePlog = useCallback((updated: Plog) => {
    setPlogs((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }, [])

  const getPlog = useCallback(
    (id: string) => plogs.find((p) => p.id === id),
    [plogs],
  )

  return (
    <AdminContext.Provider value={{ plogs, addPlog, deletePlog, updatePlog, getPlog }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}

export type { Photo }
