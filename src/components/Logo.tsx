'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
  showText?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 24, text: 'text-sm' },
  md: { icon: 30, text: 'text-lg' },
  lg: { icon: 36, text: 'text-xl' },
  xl: { icon: 48, text: 'text-2xl' },
}

function LogoIcon({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Outer rounded square */}
      <rect
        x="2"
        y="2"
        width="36"
        height="36"
        rx="10"
        fill="white"
      />
      {/* Document/report icon */}
      <rect x="10" y="8" width="14" height="18" rx="2" fill="black" />
      {/* Chart bars rising */}
      <rect x="13" y="18" width="2.5" height="5" rx="0.5" fill="white" />
      <rect x="16.5" y="15" width="2.5" height="8" rx="0.5" fill="white" />
      <rect x="20" y="12" width="2.5" height="11" rx="0.5" fill="white" />
      {/* AI spark / neural dot pattern */}
      <circle cx="29" cy="14" r="3.5" fill="black" />
      <circle cx="29" cy="14" r="2" fill="white" />
      <line x1="29" y1="10" x2="29" y2="8" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="29" y1="18" x2="29" y2="20" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="25" y1="14" x2="23.5" y2="14" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="33" y1="14" x2="34" y2="14" stroke="black" strokeWidth="1.2" strokeLinecap="round" />
      {/* Small lines on document */}
      <rect x="13" y="10" width="8" height="1" rx="0.5" fill="white" opacity="0.6" />
      <rect x="13" y="12.5" width="5" height="1" rx="0.5" fill="white" opacity="0.4" />
      {/* Bottom accent - flow arrow */}
      <path
        d="M12 30 L22 30 L26 34 L30 30 L34 30"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

export default function Logo({ size = 'md', href, showText = true, className }: LogoProps) {
  const { icon, text } = sizes[size]

  const content = (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoIcon size={icon} />
      {showText && (
        <span className={cn('font-semibold tracking-tight text-white', text)}>
          ReportFlow<span className="text-white/50"> AI</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex">
        {content}
      </Link>
    )
  }

  return content
}

export { LogoIcon }
