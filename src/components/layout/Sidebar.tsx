// Sidebar navigation component
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { cn, hasPermission } from '../../utils/helpers';
import { ROLE_ACCESS } from '../../config/access';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

// Navigation items configuration
const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    roles: ROLE_ACCESS.dashboard,
  },
  {
    name: 'Routes & Fleet',
    path: '/dashboard/routes',
    icon: <Truck className="w-5 h-5" />,
    roles: ROLE_ACCESS.routes,
  },
  {
    name: 'Teams',
    path: '/dashboard/teams',
    icon: <Users className="w-5 h-5" />,
    roles: ROLE_ACCESS.teams,
  },
  {
    name: 'Orders',
    path: '/dashboard/orders',
    icon: <Package className="w-5 h-5" />,
    roles: ROLE_ACCESS.orders,
  },
  {
    name: 'Analytics',
    path: '/dashboard/analytics',
    icon: <BarChart3 className="w-5 h-5" />,
    roles: ROLE_ACCESS.analytics,
  },
  {
    name: 'Settings',
    path: '/dashboard/settings',
    icon: <Settings className="w-5 h-5" />,
    roles: ROLE_ACCESS.settings,
  },
];

/**
 * Sidebar component with navigation menu
 */
export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useStore();
  const { profile } = useAuth();

  const visibleNavItems = navItems.filter(
    (item) => !item.roles || hasPermission(profile?.role, item.roles)
  );

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-white/20 bg-slate-950 text-white shadow-[0_30px_80px_rgba(15,23,42,0.45)] transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.24),_transparent_28%),linear-gradient(180deg,_rgba(15,23,42,0.82),_rgba(2,6,23,0.96))]" />
      {/* Logo section */}
      <div className="relative flex h-20 items-center justify-between border-b border-white/10 px-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg shadow-sky-900/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-sky-200/80">
                Control Hub
              </p>
              <span className="font-semibold text-white">
                FleetOps
              </span>
            </div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-xl border border-white/10 bg-white/5 p-1.5 transition-colors hover:bg-white/10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-slate-300" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-slate-300" />
          )}
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="relative space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
                'hover:translate-x-1 hover:bg-white/8',
                isActive
                  ? 'bg-white text-slate-950 shadow-lg shadow-black/10 font-medium'
                  : 'text-slate-300',
                isCollapsed && 'justify-center'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            {item.icon}
            {!isCollapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-200">
              Pro Tip
            </p>
            <p className="text-sm leading-5 text-slate-300">
              Use drag & drop to assign teams and orders to routes
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
