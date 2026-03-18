'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Download, Loader2, FileText, TrendingUp, Sparkles } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { getReports, type Report } from '@/lib/supabase'
import { generateReportPDF } from '@/lib/pdf-generator'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0, 1] as const } },
}

export default function DashboardPage() {
  const { user, profile } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)

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

  const totalReports = reports.length
  const thisMonth = reports.filter((r) => {
    const reportDate = new Date(r.created_at)
    const now = new Date()
    return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear()
  }).length

  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'there'

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

  const statCards = [
    {
      icon: FileText,
      label: 'Total Reports',
      value: totalReports,
      suffix: '',
    },
    {
      icon: TrendingUp,
      label: 'This Month',
      value: thisMonth,
      suffix: '',
    },
    {
      icon: Sparkles,
      label: 'Credits',
      value: profile?.credits_used || 0,
      suffix: `/${profile?.credits_limit || 3}`,
    },
  ]

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex-1 p-8 max-w-6xl"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {displayName}
          </h1>
          <p className="text-white/40 text-sm mt-1">Here&apos;s your reporting overview</p>
        </div>
        <Link
          href="/dashboard/new-report"
          className="group flex items-center gap-2 bg-white text-black px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          New Report
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
            className="group p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.08] transition-all duration-500">
                <stat.icon className="w-4 h-4 text-white/50" />
              </div>
              <span className="text-sm text-white/40">{stat.label}</span>
            </div>
            <p className="text-3xl font-semibold text-white">
              {stat.value}
              {stat.suffix && <span className="text-lg text-white/20">{stat.suffix}</span>}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Reports */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-white/[0.06] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <h2 className="font-medium text-white">Recent Reports</h2>
          <Link href="/dashboard/reports" className="text-sm text-white/40 hover:text-white/70 transition-colors duration-300">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-6 h-6 text-white/20 mx-auto mb-3" />
            </motion.div>
            <p className="text-sm text-white/30">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4"
            >
              <FileText className="w-6 h-6 text-white/20" />
            </motion.div>
            <p className="text-white/40 mb-5">No reports yet</p>
            <Link
              href="/dashboard/new-report"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              Create your first report
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-white/[0.02]">
              <tr className="text-left text-[11px] text-white/30 uppercase tracking-wider">
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {reports.slice(0, 5).map((report, i) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
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
                  <td className="px-6 py-4 text-white/30 text-sm">{formatDate(report.created_at)}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      report.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20'
                        : 'bg-white/[0.04] text-white/40 border border-white/[0.06]'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDownload(report)}
                      disabled={report.status !== 'completed'}
                      className="p-2 rounded-lg hover:bg-white/[0.06] transition-all duration-300 disabled:opacity-20 opacity-0 group-hover:opacity-100"
                    >
                      <Download className="w-4 h-4 text-white/50" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
    </motion.div>
  )
}
