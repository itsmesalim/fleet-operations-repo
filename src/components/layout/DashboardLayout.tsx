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
    <div className="app-shell min-h-screen">
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
        <main className="pt-20">
          <div className="px-4 pb-8 pt-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
