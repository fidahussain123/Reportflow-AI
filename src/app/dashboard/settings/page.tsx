'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { User, CreditCard, UploadCloud, Loader2, Trash2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  updateProfile,
  uploadAvatar,
  uploadLogo,
  deleteAvatar,
  deleteLogo,
  getTierPrice,
  type SubscriptionTier,
} from '@/lib/supabase'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'branding', label: 'Branding', icon: Building2 },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

const plans: { tier: SubscriptionTier; name: string; features: string[] }[] = [
  { tier: 'free', name: 'Free', features: ['3 reports/month', 'PDF export'] },
  { tier: 'starter', name: 'Starter', features: ['25 reports/month', 'Custom branding'] },
  { tier: 'agency', name: 'Agency', features: ['100 reports/month', 'Team access'] },
]

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [fullName, setFullName] = useState('')
  const [agencyName, setAgencyName] = useState('')

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setAgencyName(profile.agency_name || '')
    }
  }, [profile])

  const handleSaveProfile = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await updateProfile(profile.id, { full_name: fullName, agency_name: agencyName })
      await refreshProfile()
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingAvatar(true)
    try {
      await uploadAvatar(user.id, file)
      await refreshProfile()
    } catch (error) {
      console.error('Error uploading avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarDelete = async () => {
    if (!user) return
    setUploadingAvatar(true)
    try {
      await deleteAvatar(user.id)
      await refreshProfile()
    } catch (error) {
      console.error('Error deleting avatar:', error)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingLogo(true)
    try {
      await uploadLogo(user.id, file)
      await refreshProfile()
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!user) return
    setUploadingLogo(true)
    try {
      await deleteLogo(user.id)
      await refreshProfile()
    } catch (error) {
      console.error('Error deleting logo:', error)
    } finally {
      setUploadingLogo(false)
    }
  }

  const initials = fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 p-8 max-w-6xl"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account</p>
      </div>

      <div className="flex gap-8">
        {/* Tabs */}
        <nav className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-all duration-300',
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="settings-tab"
                  className="absolute inset-0 bg-white/[0.08] border border-white/[0.08] rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Profile */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
                  <h2 className="font-medium text-white mb-6">Profile</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden relative">
                      {profile?.avatar_url ? (
                        <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <span className="text-xl font-medium text-white/40">{initials}</span>
                      )}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                          <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      <div className="flex gap-2">
                        <button
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                        >
                          Change
                        </button>
                        {profile?.avatar_url && (
                          <button onClick={handleAvatarDelete} className="px-3 py-1.5 text-sm text-red-400/70 hover:text-red-400 transition-colors duration-300">
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/50 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-1.5">Email</label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white/30 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/50 mb-1.5">Agency Name</label>
                      <input
                        type="text"
                        value={agencyName}
                        onChange={(e) => setAgencyName(e.target.value)}
                        placeholder="Your agency name"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="mt-6 px-5 py-2.5 bg-white text-black rounded-xl font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 flex items-center gap-2 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Branding */}
            {activeTab === 'branding' && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.01]"
              >
                <h2 className="font-medium text-white mb-2">Agency Logo</h2>
                <p className="text-sm text-white/40 mb-6">Your logo appears on PDF reports</p>

                <div className="flex items-start gap-6">
                  <div className="w-36 h-24 rounded-xl border-2 border-dashed border-white/[0.1] flex items-center justify-center overflow-hidden relative bg-white/[0.02] hover:border-white/[0.15] transition-all duration-300">
                    {profile?.logo_url ? (
                      <Image src={profile.logo_url} alt="Logo" fill className="object-contain p-3" />
                    ) : (
                      <Building2 className="w-6 h-6 text-white/15" />
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => logoInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
                      >
                        <UploadCloud className="w-4 h-4" />
                        Upload
                      </button>
                      {profile?.logo_url && (
                        <button
                          onClick={handleLogoDelete}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-400/70 hover:text-red-400 transition-colors duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-white/20 mt-2">PNG or SVG, max 5MB</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Billing */}
            {activeTab === 'billing' && (
              <motion.div
                key="billing"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Current Plan */}
                <div className="p-7 rounded-2xl border border-white/[0.06] bg-white/[0.01]">
                  <h2 className="font-medium text-white mb-4">Current Plan</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-white capitalize">{profile?.subscription_tier || 'Free'}</p>
                      <p className="text-sm text-white/40">{profile?.credits_used || 0} / {profile?.credits_limit || 3} reports used</p>
                    </div>
                    <p className="text-3xl font-semibold text-white">
                      ${getTierPrice((profile?.subscription_tier as SubscriptionTier) || 'free')}
                      <span className="text-sm text-white/30 font-normal">/mo</span>
                    </p>
                  </div>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-3 gap-4">
                  {plans.map((plan, i) => {
                    const isCurrent = plan.tier === (profile?.subscription_tier || 'free')
                    return (
                      <motion.div
                        key={plan.tier}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className={cn(
                          'p-6 rounded-2xl border transition-all duration-500',
                          isCurrent
                            ? 'border-white/[0.12] bg-white/[0.04] glow-white-sm'
                            : 'border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02]'
                        )}
                      >
                        <p className="font-medium text-white/80 mb-1">{plan.name}</p>
                        <p className="text-2xl font-semibold text-white mb-4">
                          ${getTierPrice(plan.tier)}
                          <span className="text-sm text-white/30 font-normal">/mo</span>
                        </p>
                        <ul className="text-xs text-white/40 space-y-1.5 mb-5">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-1.5">
                              <span className="text-white/20">&#8226;</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                        <button
                          disabled={isCurrent}
                          className={cn(
                            'w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                            isCurrent
                              ? 'bg-white/[0.04] text-white/20 cursor-not-allowed border border-white/[0.06]'
                              : 'bg-white text-black hover:bg-white/90 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]'
                          )}
                        >
                          {isCurrent ? 'Current' : 'Upgrade'}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
