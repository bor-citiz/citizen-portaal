import { Menu } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  onToggleSidebar: () => void
  sidebarOpen: boolean
  userEmail?: string
}

export default function Header({ onToggleSidebar, sidebarOpen, userEmail }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Toggle button and breadcrumb */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 hover:bg-gray-100"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu className="h-5 w-5 text-gray-600" />
        </Button>
        <div className="text-sm text-gray-600">
          <span>Citizen Portaal</span>
        </div>
      </div>

      {/* User info */}
      <div className="flex items-center space-x-3">
        {userEmail && (
          <div className="text-sm text-gray-700">
            {userEmail}
          </div>
        )}
        {/* Future: Add user menu dropdown here */}
      </div>
    </header>
  );
}