'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import {
  saveReport,
  checkUserCredits,
  type CampaignData,
  type MetaCampaignData,
  type PlatformType,
} from '@/lib/supabase'
import CSVUploader from '@/components/CSVUploader'

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

export default function NewReportPage() {
  const router = useRouter()
  const { user, profile, refreshProfile } = useAuth()

  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [agencyName, setAgencyName] = useState(profile?.agency_name || '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [platform, setPlatform] = useState<PlatformType | null>(null)

  const [googleAdsData, setGoogleAdsData] = useState<CampaignData[] | null>(null)
  const [metaAdsData, setMetaAdsData] = useState<MetaCampaignData[] | null>(null)

  const canProceedStep1 = clientName.trim() && agencyName.trim() && startDate && endDate && platform
  const canProceedStep2 =
    (platform === 'google' && googleAdsData) ||
    (platform === 'meta' && metaAdsData) ||
    (platform === 'both' && googleAdsData && metaAdsData)

  const hasCredits = profile && profile.credits_used < profile.credits_limit

  const handleGenerateReport = async () => {
    if (!user) {
      setError('You must be logged in')
      return
    }

    const creditCheck = await checkUserCredits(user.id)
    if (!creditCheck.hasCredits) {
      setError(`No credits remaining (${creditCheck.used}/${creditCheck.limit})`)
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          agencyName,
          period: `${startDate} to ${endDate}`,
          googleAdsData,
          metaAdsData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }

      const data = await response.json()

      const savedReport = await saveReport({
        user_id: user.id,
        client_name: clientName,
        agency_name: agencyName,
        period: `${startDate} to ${endDate}`,
        platform: platform!,
        google_ads_data: googleAdsData,
        meta_ads_data: metaAdsData,
        report_text: data.reportText,
        status: 'completed',
      })

      await refreshProfile()
      router.push(`/dashboard/report/${savedReport.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsGenerating(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 p-8 flex flex-col items-center"
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold text-white">New Report</h1>
          <p className="text-white/40 text-sm mt-1">Generate an AI-powered performance report</p>
        </motion.div>

        {/* Steps */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-8"
        >
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: step === s ? 1.1 : 1,
                  backgroundColor: step > s ? 'rgba(255,255,255,1)' : step === s ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                  step > s ? 'text-black' : step === s ? 'text-white border border-white/20' : 'text-white/20'
                )}
              >
                {step > s ? <Check className="w-4 h-4" /> : s}
              </motion.div>
              {s < 3 && (
                <motion.div
                  animate={{ backgroundColor: step > s ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.06)' }}
                  className="w-14 h-px transition-colors duration-500"
                />
              )}
            </div>
          ))}
          <span className="ml-3 text-xs text-white/20">
            {step === 1 ? 'Client Details' : step === 2 ? 'Upload Data' : 'Generate'}
          </span>
        </motion.div>

        {/* Content */}
        <div className="rounded-2xl border border-white/[0.06] p-7 bg-white/[0.01]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5"
              >
                <h2 className="font-medium text-white mb-6">Client Details</h2>

                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Client Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Agency Name</label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Your Agency"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/50 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/50 mb-1.5">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/50 mb-1.5">Platform</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['google', 'meta', 'both'] as const).map((p) => (
                      <motion.button
                        key={p}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPlatform(p)}
                        className={cn(
                          'py-2.5 rounded-xl border text-sm font-medium transition-all duration-300',
                          platform === p
                            ? 'border-white/20 bg-white/[0.08] text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                            : 'border-white/[0.06] text-white/40 hover:bg-white/[0.04] hover:border-white/[0.1]'
                        )}
                      >
                        {p === 'google' ? 'Google Ads' : p === 'meta' ? 'Meta Ads' : 'Both'}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="font-medium text-white">Upload CSV</h2>

                {(platform === 'google' || platform === 'both') && (
                  <div>
                    <h3 className="text-sm text-white/50 mb-3">Google Ads Data</h3>
                    <CSVUploader
                      platform="google"
                      onDataParsed={(data) => setGoogleAdsData(data as unknown as CampaignData[])}
                      onError={() => {}}
                    />
                  </div>
                )}

                {(platform === 'meta' || platform === 'both') && (
                  <div>
                    <h3 className="text-sm text-white/50 mb-3">Meta Ads Data</h3>
                    <CSVUploader
                      platform="meta"
                      onDataParsed={(data) => setMetaAdsData(data as unknown as MetaCampaignData[])}
                      onError={() => {}}
                    />
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                {isGenerating ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-5"
                    >
                      <Sparkles className="w-6 h-6 text-white/60" />
                    </motion.div>
                    <h2 className="text-lg font-medium text-white mb-2">Generating Report</h2>
                    <p className="text-sm text-white/40">Claude AI is analyzing your data...</p>
                    <div className="mt-6 mx-auto w-48 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="h-full w-1/2 bg-white/20 rounded-full"
                      />
                    </div>
                  </motion.div>
                ) : error ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
                      <span className="text-red-400 text-xl font-medium">!</span>
                    </div>
                    <h2 className="text-lg font-medium text-white mb-2">Error</h2>
                    <p className="text-sm text-red-400/80 mb-6">{error}</p>
                    <button
                      onClick={handleGenerateReport}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all duration-300"
                    >
                      Try Again
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mx-auto mb-5"
                    >
                      <Check className="w-6 h-6 text-white/70" />
                    </motion.div>
                    <h2 className="text-lg font-medium text-white mb-2">Ready to Generate</h2>
                    <p className="text-sm text-white/40 mb-2">
                      {clientName} &middot; {platform === 'google' ? 'Google Ads' : platform === 'meta' ? 'Meta Ads' : 'Both'}
                    </p>
                    <p className="text-xs text-white/20 mb-6">
                      Credits: {profile?.credits_used || 0}/{profile?.credits_limit || 3}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleGenerateReport}
                      disabled={!hasCredits}
                      className="px-8 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                      Generate Report
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-between">
            <button
              onClick={() => (step === 1 ? router.push('/dashboard') : setStep(step - 1))}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 1 ? 'Cancel' : 'Back'}
            </button>

            {step < 3 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(step + 1)}
                disabled={step === 1 ? !canProceedStep1 : !canProceedStep2}
                className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
