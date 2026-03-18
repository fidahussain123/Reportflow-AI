'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Papa from 'papaparse'
import { UploadCloud, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CSVUploaderProps {
  platform: 'google' | 'meta'
  onDataParsed: (data: Record<string, string | number>[]) => void
  onError: (error: string) => void
}

const GOOGLE_ADS_COLUMNS = ['Campaign', 'Impressions', 'Clicks', 'CTR', 'Avg. CPC', 'Cost', 'Conversions']
const META_ADS_COLUMNS = ['Campaign name', 'Reach', 'Impressions', 'Clicks (all)', 'Amount spent', 'Results']

export default function CSVUploader({ platform, onDataParsed, onError }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedData, setParsedData] = useState<Record<string, string | number>[] | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const expectedColumns = platform === 'google' ? GOOGLE_ADS_COLUMNS : META_ADS_COLUMNS

  const validateAndParseCSV = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) {
        const error = 'Please upload a CSV file'
        setParseError(error)
        onError(error)
        return
      }

      setFileName(file.name)
      setParseError(null)

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || []
          const missingColumns = expectedColumns.filter(
            (col) => !headers.some((h) => h.toLowerCase().includes(col.toLowerCase().split(' ')[0]))
          )

          if (missingColumns.length > expectedColumns.length / 2) {
            const error = `Invalid CSV format for ${platform === 'google' ? 'Google Ads' : 'Meta Ads'}`
            setParseError(error)
            onError(error)
            setParsedData(null)
            return
          }

          const data = results.data as Record<string, string | number>[]
          setParsedData(data)
          onDataParsed(data)
        },
        error: (error) => {
          const errorMsg = `Error parsing CSV: ${error.message}`
          setParseError(errorMsg)
          onError(errorMsg)
        },
      })
    },
    [platform, expectedColumns, onDataParsed, onError]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) validateAndParseCSV(file)
    },
    [validateAndParseCSV]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) validateAndParseCSV(file)
    },
    [validateAndParseCSV]
  )

  return (
    <div className="space-y-3">
      <motion.div
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.995 }}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 border-2 border-dashed',
          isDragging
            ? 'bg-white/[0.06] border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
            : parseError
            ? 'bg-red-500/[0.03] border-red-500/20'
            : parsedData
            ? 'bg-white/[0.03] border-white/[0.12] border-solid'
            : 'bg-white/[0.01] border-white/[0.08] hover:bg-white/[0.03] hover:border-white/[0.12]'
        )}
      >
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />

        <AnimatePresence mode="wait">
          {parseError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <XCircle className="w-8 h-8 text-red-400/80 mb-3" />
              <p className="text-sm text-red-400/80">{parseError}</p>
              <p className="text-xs text-white/20 mt-1">Click to try again</p>
            </motion.div>
          ) : parsedData ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <CheckCircle2 className="w-8 h-8 text-emerald-400/80 mb-3" />
              <p className="text-sm text-white/80 font-medium">{fileName}</p>
              <p className="text-xs text-white/30 mt-1">{parsedData.length} campaigns loaded</p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
                <UploadCloud className="w-5 h-5 text-white/30" />
              </div>
              <p className="text-sm text-white/50">Drop CSV or click to upload</p>
              <p className="text-xs text-white/20 mt-1">
                {platform === 'google' ? 'Google Ads export' : 'Meta Ads export'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Preview */}
      <AnimatePresence>
        {parsedData && parsedData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] text-xs text-white/30 font-medium">
              Preview (first 3 rows)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-white/[0.02]">
                  <tr>
                    {Object.keys(parsedData[0]).slice(0, 5).map((key) => (
                      <th key={key} className="px-4 py-2.5 text-left text-white/30 font-medium">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {parsedData.slice(0, 3).map((row, i) => (
                    <motion.tr
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {Object.values(row).slice(0, 5).map((val, j) => (
                        <td key={j} className="px-4 py-2.5 text-white/50">{String(val)}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
