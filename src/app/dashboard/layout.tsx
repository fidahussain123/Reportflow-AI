import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
