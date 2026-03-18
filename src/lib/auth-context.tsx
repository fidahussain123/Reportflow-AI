'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, type Profile, getProfile, signInWithGoogle as signInWithGoogleFn } from './supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const data = await getProfile(userId)
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }, [user, fetchProfile])

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch (err) {
        console.error('Error getting session:', err)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // Small delay to allow profile trigger to complete
          setTimeout(() => fetchProfile(currentSession.user.id), 100)
        } else {
          setProfile(null)
        }

        if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const handleSignIn = async (email: string, password: string) => {
    setError(null)
    setLoading(true)

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (email: string, password: string, fullName?: string) => {
    setError(null)
    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) throw signUpError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setError(null)
    
    try {
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      setError(message)
      throw err
    }
  }

  const handleSignInWithGoogle = async () => {
    setError(null)
    
    try {
      await signInWithGoogleFn()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed'
      setError(message)
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
