import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

interface PDFGeneratorProps {
  reportText: string
  clientName: string
  agencyName: string
  period: string
  platform: string
  googleAdsData?: any[] | null
  metaAdsData?: any[] | null
}

export function generateReportPDF({
  reportText,
  clientName,
  agencyName,
  period,
  platform,
  googleAdsData,
  metaAdsData,
}: PDFGeneratorProps) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 20
  const contentWidth = pageWidth - margin * 2

  // 1. Data Normalization
  const normalizedData: any[] = []
  if (googleAdsData) {
    googleAdsData.forEach((d) => {
      normalizedData.push({
        name: d.campaign || d.Campaign || 'Unknown',
        impressions: Number(d.impressions || d.Impressions || 0),
        spend: Number(d.cost || d.Cost || 0),
        conversions: Number(d.conversions || d.Conversions || 0),
        ctr: parseFloat((d.ctr || d.CTR || '0').toString().replace('%', '')),
        clicks: Number(d.clicks || d.Clicks || 0),
      })
    })
  }
  if (metaAdsData) {
    metaAdsData.forEach((d) => {
      normalizedData.push({
        name: d.campaignName || d['Campaign name'] || 'Unknown',
        impressions: Number(d.impressions || d.Impressions || 0),
        spend: Number(d.amountSpent || d['Amount spent'] || 0),
        conversions: Number(d.results || d.Results || 0),
        ctr: parseFloat((d.ctr || d['CTR (all)'] || '0').toString().replace('%', '')),
        clicks: Number(d.clicks || d['Clicks (all)'] || 0),
      })
    })
  }

  normalizedData.sort((a, b) => b.spend - a.spend)
  const chartData = normalizedData.slice(0, 8) // Top 8 for charts

  // 2. Parse Text Sections
  const sections = reportText.split('## ').filter((s) => s.trim())
  const parsedSections: Record<string, string> = {}
  sections.forEach((s) => {
    const lines = s.split('\n')
    const title = lines[0].trim().toLowerCase()
    const content = lines.slice(1).join('\n').trim()
    parsedSections[title] = content
  })

  const getSection = (keyword: string) => {
    const key = Object.keys(parsedSections).find((k) => k.includes(keyword))
    return key ? parsedSections[key] : ''
  }

  const execSummary = getSection('executive summary') || 'No executive summary provided.'
  const keyInsights = getSection('key insights') || ''
  const recommendations = getSection('recommendations') || ''
  const nextSteps = getSection('next steps') || ''

  // 3. Helper Functions
  const drawHeader = () => {
    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('ReportFlow AI', margin, 22)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(180, 180, 180)
    doc.text(agencyName, pageWidth - margin, 22, { align: 'right' })

    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(0.1)
    doc.line(margin, 42, pageWidth - margin, 42)

    doc.setFillColor(248, 248, 248)
    doc.rect(0, 44, pageWidth, 28, 'F')

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(clientName, margin, 58)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`${period} · ${platform}`, margin, 66)

    const today = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    doc.text(`Generated ${today}`, pageWidth - margin, 66, { align: 'right' })
  }

  const drawSectionTitle = (title: string, y: number) => {
    doc.setFillColor(0, 0, 0)
    doc.rect(margin, y - 4, contentWidth, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(title.toUpperCase(), margin + 3, y + 3)
    return y + 14
  }

  const printMarkdownText = (text: string, x: number, startY: number, width: number) => {
    let y = startY
    const lines = text.split('\n')
    lines.forEach((line) => {
      if (y > 270) {
        doc.addPage()
        drawHeader()
        y = 84
      }
      if (line.trim() === '') {
        y += 4
        return
      }

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9.5)
      doc.setTextColor(60, 60, 60)

      let textToPrint = line.trim()
      const isBullet = textToPrint.startsWith('-') || textToPrint.startsWith('•')
      const isNumbered = /^\d+\./.test(textToPrint)

      if (isBullet) {
        textToPrint = textToPrint.replace(/^[-•]\s*/, '')
        doc.text('•', x + 2, y)
        const split = doc.splitTextToSize(textToPrint, width - 8)
        doc.text(split, x + 8, y)
        y += split.length * 5 + 2
      } else if (isNumbered) {
        const match = textToPrint.match(/^(\d+\.)\s*(.*)/)
        if (match) {
          doc.setFont('helvetica', 'bold')
          doc.text(match[1], x + 2, y)
          doc.setFont('helvetica', 'normal')
          const split = doc.splitTextToSize(match[2], width - 8)
          doc.text(split, x + 8, y)
          y += split.length * 5 + 2
        }
      } else {
        textToPrint = textToPrint.replace(/\*\*/g, '') // Strip bold
        const split = doc.splitTextToSize(textToPrint, width)
        doc.text(split, x, y)
        y += split.length * 5 + 2
      }
    })
    return y
  }

  const drawHorizontalBarChart = (
    x: number,
    y: number,
    width: number,
    height: number,
    data: any[],
    labelKey: string,
    valueKey: string,
    color: [number, number, number],
    formatValue: (v: number) => string
  ) => {
    if (!data || data.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No data available', x, y + 10)
      return y + 20
    }

    const maxVal = Math.max(...data.map((d) => d[valueKey]), 1)
    const barHeight = Math.min(8, height / data.length - 4)
    const labelWidth = 60
    const maxBarWidth = width - labelWidth - 25

    data.forEach((d, i) => {
      const barY = y + i * (barHeight + 6)

      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80, 80, 80)
      let label = d[labelKey]
      if (label.length > 35) label = label.substring(0, 32) + '...'
      doc.text(label, x, barY + barHeight / 2 + 2)

      const barWidth = (d[valueKey] / maxVal) * maxBarWidth
      doc.setFillColor(color[0], color[1], color[2])
      doc.rect(x + labelWidth, barY, barWidth, barHeight, 'F')

      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)
      doc.text(formatValue(d[valueKey]), x + labelWidth + barWidth + 3, barY + barHeight / 2 + 2)
    })

    return y + data.length * (barHeight + 6) + 10
  }

  const drawGroupedVerticalBarChart = (
    x: number,
    y: number,
    width: number,
    height: number,
    data: any[]
  ) => {
    if (!data || data.length === 0) {
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(150, 150, 150)
      doc.text('No data available', x, y + 10)
      return y + 20
    }

    const maxSpend = Math.max(...data.map((d) => d.spend), 1)
    const maxConv = Math.max(...data.map((d) => d.conversions), 1)

    const groupWidth = width / data.length
    const barWidth = groupWidth * 0.35
    const chartY = y + 15
    const chartHeight = height - 30

    // Legend
    doc.setFillColor(0, 0, 0)
    doc.rect(x + width - 80, y, 4, 4, 'F')
    doc.setFontSize(8)
    doc.setTextColor(80, 80, 80)
    doc.text('Spend ($)', x + width - 73, y + 3)

    doc.setFillColor(180, 180, 180)
    doc.rect(x + width - 40, y, 4, 4, 'F')
    doc.text('Conversions', x + width - 33, y + 3)

    // Axes lines
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.1)
    doc.line(x, chartY + chartHeight, x + width, chartY + chartHeight)

    data.forEach((d, i) => {
      const groupX = x + i * groupWidth

      // Spend Bar (Black)
      const spendH = (d.spend / maxSpend) * chartHeight
      doc.setFillColor(0, 0, 0)
      doc.rect(groupX + groupWidth * 0.1, chartY + chartHeight - spendH, barWidth, spendH, 'F')

      // Conv Bar (Gray)
      const convH = (d.conversions / maxConv) * chartHeight
      doc.setFillColor(180, 180, 180)
      doc.rect(groupX + groupWidth * 0.5, chartY + chartHeight - convH, barWidth, convH, 'F')

      // Label
      doc.setFontSize(7)
      doc.setTextColor(100, 100, 100)
      let label = d.name
      if (label.length > 12) label = label.substring(0, 10) + '..'
      doc.text(label, groupX + groupWidth / 2, chartY + chartHeight + 6, { align: 'center' })
    })

    return y + height + 10
  }

  // ==========================================
  // PAGE 1: Summary & Impressions
  // ==========================================
  drawHeader()
  let yPos = 84

  yPos = drawSectionTitle('EXECUTIVE SUMMARY', yPos)
  yPos = printMarkdownText(execSummary, margin, yPos, contentWidth)

  yPos += 15
  yPos = drawSectionTitle('CAMPAIGN IMPRESSIONS', yPos)
  yPos = drawHorizontalBarChart(margin, yPos, contentWidth, 70, chartData, 'name', 'impressions', [0, 0, 0], (v) => v.toLocaleString())

  // ==========================================
  // PAGE 2: Charts & Table
  // ==========================================
  doc.addPage()
  drawHeader()
  yPos = 84

  yPos = drawSectionTitle('CONVERSIONS vs SPEND', yPos)
  yPos = drawGroupedVerticalBarChart(margin, yPos, contentWidth, 70, chartData)

  yPos += 10
  yPos = drawSectionTitle('CTR BY CAMPAIGN', yPos)
  yPos = drawHorizontalBarChart(margin, yPos, contentWidth, 50, chartData, 'name', 'ctr', [100, 100, 100], (v) => `${v}%`)

  yPos += 10
  yPos = drawSectionTitle('CAMPAIGN PERFORMANCE', yPos)

  const tableData = normalizedData.map((d) => [
    d.name,
    `$${d.spend.toLocaleString()}`,
    d.impressions.toLocaleString(),
    d.clicks.toLocaleString(),
    `${d.ctr}%`,
    d.conversions.toLocaleString(),
    `$${(d.conversions > 0 ? d.spend / d.conversions : 0).toFixed(2)}`,
  ])

  ;(doc as any).autoTable({
    startY: yPos,
    head: [['Campaign', 'Spend', 'Impr.', 'Clicks', 'CTR', 'Conv.', 'CPA']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // PAGE 3: Insights & Recommendations
  // ==========================================
  doc.addPage()
  drawHeader()
  yPos = 84

  if (keyInsights) {
    yPos = drawSectionTitle('KEY INSIGHTS', yPos)
    yPos = printMarkdownText(keyInsights, margin, yPos, contentWidth)
    yPos += 15
  }

  if (recommendations) {
    yPos = drawSectionTitle('RECOMMENDATIONS', yPos)
    yPos = printMarkdownText(recommendations, margin, yPos, contentWidth)
    yPos += 15
  }

  if (nextSteps) {
    yPos = drawSectionTitle('NEXT STEPS', yPos)
    yPos = printMarkdownText(nextSteps, margin, yPos, contentWidth)
  }

  // ==========================================
  // FOOTER (All Pages)
  // ==========================================
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.1)
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)

    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text('ReportFlow AI — Confidential', margin, pageHeight - 8)
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, {
      align: 'right',
    })
    doc.text(agencyName, pageWidth / 2, pageHeight - 8, { align: 'center' })
  }

  return doc;
  } catch (error: any) {
    throw error
  }
}
