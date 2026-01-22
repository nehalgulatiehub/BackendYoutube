import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../api/axios'

interface User {
  _id: string
  username: string
  email: string
  fullName: string
  avatar: string
  coverImage: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (userData: User) => void
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      login: (userData) => set({ user: userData, isAuthenticated: true }),
      logout: async () => {
        try {
          await api.post('/users/logout')
        } catch (error) {
          console.error('Logout failed', error)
        }
        set({ user: null, isAuthenticated: false })
      },
      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const response = await api.get('/users/current-user')
          set({ user: response.data.data, isAuthenticated: true })
        } catch (error) {
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
