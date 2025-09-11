'use client'

import { ReactNode, useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutClientProps {
  children: ReactNode
  userEmail?: string
}

export default function LayoutClient({ children, userEmail }: LayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open')
    if (saved !== null) {
      setSidebarOpen(JSON.parse(saved))
    }
  }, [])

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebar-open', JSON.stringify(sidebarOpen))
  }, [sidebarOpen])

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (left) */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} shrink-0 transition-all duration-300 ease-in-out`}>
        <Sidebar isCollapsed={!sidebarOpen} />
      </aside>

      {/* Main column (right) */}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} userEmail={userEmail} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}