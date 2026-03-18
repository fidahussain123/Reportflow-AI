'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Download, Plus, FileText, Loader2, Trash2 } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getReports, deleteReport, type Report } from '@/lib/supabase'
import { generateReportPDF } from '@/lib/pdf-generator'

export default function ReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReports() {
      if (!user) return
      try {
        const data = await getReports(user.id)
        setReports(data)
      } catch (err) {
        console.error('Error fetching reports:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [user])

  const handleDownload = (report: Report) => {
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

  const handleDelete = async (report: Report) => {
    if (!confirm(`Delete report for ${report.client_name}?`)) return
    setDeletingId(report.id)
    try {
      await deleteReport(report.id)
      setReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (err) {
      console.error('Error deleting report:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 p-8 max-w-6xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Reports</h1>
          <p className="text-white/40 text-sm mt-1">All your generated reports</p>
        </div>
        <Link
          href="/dashboard/new-report"
          className="group flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-white/20 mx-auto mb-3" />
          </motion.div>
          <p className="text-sm text-white/30">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center py-20 rounded-2xl border border-white/[0.06] bg-white/[0.01]"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/40 mb-5">No reports yet</p>
          <Link
            href="/dashboard/new-report"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            Create Report
          </Link>
        </motion.div>
      ) : (
        <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[11px] text-white/30 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium">Period</th>
                <th className="px-6 py-3 font-medium">Created</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="hover:bg-white/[0.02] transition-colors duration-300 group"
                >
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/report/${report.id}`} className="text-white/80 hover:text-white transition-colors duration-300 font-medium">
                      {report.client_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-white/40 text-sm">
                    {report.platform === 'google' ? 'Google Ads' : report.platform === 'meta' ? 'Meta Ads' : 'Both'}
                  </td>
                  <td className="px-6 py-4 text-white/40 text-sm">{report.period}</td>
                  <td className="px-6 py-4 text-white/30 text-sm">{formatDate(report.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      report.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20'
                        : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
                    )}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Link
                        href={`/dashboard/report/${report.id}`}
                        className="px-3 py-1.5 rounded-lg text-sm text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-all duration-300"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== 'completed'}
                        className="p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-20"
                      >
                        <Download className="w-4 h-4 text-white/50" />
                      </button>
                      <button
                        onClick={() => handleDelete(report)}
                        disabled={deletingId === report.id}
                        className="p-2 rounded-lg text-red-400/60 hover:bg-white/[0.06] hover:text-red-400 transition-all duration-300 disabled:opacity-50"
                      >
                        {deletingId === report.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  )
}
