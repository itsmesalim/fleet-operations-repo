// Main dashboard layout wrapper
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useStore } from '../../store/useStore';
import { cn } from '../../utils/helpers';

/**
 * Dashboard layout with sidebar and navbar
 * Wraps all authenticated dashboard pages
 */
export function DashboardLayout() {
  const { isCollapsed } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div
        className={cn(
          'transition-all duration-300',
          isCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top navbar */}
        <Navbar />

        {/* Page content */}
        <main className="pt-16">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
