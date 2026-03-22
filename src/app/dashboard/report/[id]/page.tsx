'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Trash2, Copy, Check, FileDown, RefreshCw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useAuth } from '@/lib/auth-context'
import { getReport, deleteReport, type Report } from '@/lib/supabase'
import { generateReportPDF } from '@/lib/pdf-generator'
import Logo from '@/components/Logo'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchReport() {
      const id = params.id as string
      if (!id || !user) {
        setLoading(false)
        return
      }
      try {
        const data = await getReport(id)
        if (data) {
          setReport(data)
        } else {
          setError('Report not found')
        }
      } catch (err) {
        console.error('Error fetching report:', err)
        setError('Failed to load report')
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [params.id, user])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleDelete = async () => {
    if (!report || !confirm('Delete this report?')) return
    setDeleting(true)
    try {
      await deleteReport(report.id)
      router.push('/dashboard/reports')
    } catch (err) {
      console.error('Error deleting report:', err)
    } finally {
      setDeleting(false)
    }
  }

  const handleDownload = () => {
    if (!report) return
    const doc = generateReportPDF({
      reportText: report.report_text,
      clientName: report.client_name,
      agencyName: report.agency_name,
      period: report.period,
      platform: report.platform,
      googleAdsData: report.google_ads_data,
      metaAdsData: report.meta_ads_data,
    })
    doc.save(`${report.client_name.replace(/\s+/g, '-')}-Report.pdf`)
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-white/20 mx-auto mb-3" />
          </motion.div>
          <p className="text-sm text-white/30">Loading report...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-red-400/80 mb-4">{error || 'Report not found'}</p>
          <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors duration-300">
            Go to Dashboard
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex-1 flex flex-col"
    >
      {/* Header */}
      <header className="px-8 py-5 border-b border-white/[0.06] flex items-center justify-between bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports" className="p-2 rounded-xl hover:bg-white/[0.06] transition-all duration-300 text-white/40 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-medium text-white">{report.client_name}</h1>
            <p className="text-sm text-white/40">
              {report.period} &middot; {report.platform === 'google' ? 'Google Ads' : report.platform === 'meta' ? 'Meta Ads' : 'Both'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Share'}
          </motion.button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl border border-white/[0.08] text-red-400/60 hover:bg-white/[0.04] hover:text-red-400 hover:border-red-500/20 transition-all duration-300"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          {/* Report Card */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden glow-white-sm">
            {/* Report Header */}
            <div className="p-7 bg-white/[0.02] border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] mb-1.5">Performance Report</p>
                  <h2 className="text-xl font-semibold text-white">{report.client_name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.15em]">Prepared by</p>
                  <p className="text-sm text-white/60 mt-1">{report.agency_name}</p>
                  <div className="mt-2">
                    <Logo size="sm" showText={false} />
                  </div>
                </div>
              </div>
            </div>

            {/* Report Body */}
            <div className="p-7">
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h2: ({ children }) => (
                      <h2 className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium mt-10 mb-4 first:mt-0 pb-2 border-b border-white/[0.06]">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-medium text-white/90 mt-6 mb-3">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="text-white/60 text-sm leading-relaxed mb-4">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="space-y-2 mb-4 text-white/60 text-sm">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-2 mb-4 text-white/60 text-sm">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2">
                        <span className="text-white/20 mt-0.5">&#8226;</span>
                        <span>{children}</span>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-medium text-white/90">{children}</strong>
                    ),
                  }}
                >
                  {report.report_text}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <FileDown className="w-4 h-4" />
              Download PDF
            </motion.button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-white/60 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
