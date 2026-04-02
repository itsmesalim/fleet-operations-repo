// Main dashboard overview page with KPIs and recent activity
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Truck,
  Users,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton, SkeletonCard } from "../components/ui/Skeleton";
import { useKPIs } from "../hooks/useAnalytics";
import { useRoutes } from "../hooks/useRoutes";
import { useOrders } from "../hooks/useOrders";
import { formatCurrency, getStatusColor } from "../utils/helpers";

/**
 * Dashboard overview page with KPIs and summary
 */
export function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: routes, isLoading: routesLoading } = useRoutes();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const recentOrders = orders?.slice(0, 5) || [];
  const routeTrend = 12;
  const orderTrend = -5;
  const revenueTrend = 18;

  const stats = [
    {
      label: "Active Routes",
      value: kpis?.activeRoutes || 0,
      helper: `of ${kpis?.totalRoutes || 0} total routes`,
      trend: routeTrend,
      tone: "from-sky-500/20 to-blue-500/10",
      iconWrap: "bg-sky-500/12 text-sky-600 dark:text-sky-300",
      icon: Truck,
    },
    {
      label: "Active Teams",
      value: kpis?.activeTeams || 0,
      helper: `of ${kpis?.totalTeams || 0} total teams`,
      trend: 9,
      tone: "from-emerald-500/20 to-green-500/10",
      iconWrap: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
      icon: Users,
    },
    {
      label: "Pending Orders",
      value: kpis?.pendingOrders || 0,
      helper: `${kpis?.completedOrders || 0} completed today`,
      trend: orderTrend,
      tone: "from-violet-500/20 to-fuchsia-500/10",
      iconWrap: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
      icon: Package,
    },
    {
      label: "Total Revenue",
      value: formatCurrency(kpis?.totalRevenue || 0),
      helper: `${kpis?.completionRate || 0}% completion rate`,
      trend: revenueTrend,
      tone: "from-amber-500/20 to-orange-500/10",
      iconWrap: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="animate-fade-up space-y-8">
      <div className="premium-card premium-card-strong overflow-hidden rounded-[30px] p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-sky-600 dark:text-sky-300">
              Daily Command Center
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Dashboard Overview
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Welcome back. Your fleet pulse, delivery pressure, and team
              allocation are all visible here in one cleaner control surface.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-sky-200/60 bg-sky-500/[0.08] p-5 dark:border-sky-400/10 dark:bg-sky-400/10">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Completion rate
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                {kpis?.completionRate || 0}%
              </p>
            </div>
            <div className="rounded-[24px] border border-emerald-200/60 bg-emerald-500/[0.08] p-5 dark:border-emerald-400/10 dark:bg-emerald-400/10">
              <p className="text-sm text-slate-500 dark:text-slate-300">
                Revenue tracked
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">
                {formatCurrency(kpis?.totalRevenue || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.label}
              className={`animate-fade-up overflow-hidden bg-gradient-to-br ${stat.tone}`}
            >
              {kpisLoading ? (
                <SkeletonCard />
              ) : (
                <>
                  <div className="mb-8 flex items-start justify-between">
                    <div className={`rounded-[20px] p-3 ${stat.iconWrap}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm ${
                        stat.trend >= 0
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-300"
                      }`}
                    >
                      {stat.trend >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(stat.trend)}%
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {stat.helper}
                  </p>
                </>
              )}
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="animate-fade-up">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Routes
            </h2>
            <Link
              to="/dashboard/routes"
              className="rounded-full bg-slate-900 px-3 py-1.5 text-sm text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
            >
              View all
            </Link>
          </div>

          {routesLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" count={3} />
            </div>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3">
              {routes.slice(0, 5).map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-white/65 p-4 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:hover:border-sky-500/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {route.name}
                    </p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                      {route.start_location} {"->"} {route.end_location}
                    </p>
                  </div>
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No routes found</p>
            </div>
          )}
        </Card>

        <Card className="animate-fade-up">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              to="/dashboard/orders"
              className="rounded-full border border-slate-300 bg-white/70 px-3 py-1.5 text-sm text-slate-700 transition hover:border-slate-400 hover:bg-white dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
            >
              View all
            </Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" count={3} />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-[20px] border border-slate-200/70 bg-white/65 p-4 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/45 dark:hover:border-violet-500/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {order.order_number}
                    </p>
                    <p className="truncate text-sm text-gray-600 dark:text-gray-400">
                      {order.customer_name} {"•"} {formatCurrency(order.value_usd)}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.priority)}>
                    {order.priority}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="mx-auto mb-2 h-12 w-12 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">No orders found</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="animate-fade-up">
        <h2 className="mb-5 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            to="/dashboard/routes"
            className="group rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-sky-500/[0.08] to-transparent p-5 text-left transition-all hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg dark:border-slate-700/70 dark:from-sky-400/[0.08]"
          >
            <Truck className="mb-4 h-8 w-8 text-sky-500 transition-transform group-hover:translate-x-1" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Routes
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              View and edit fleet routes
            </p>
          </Link>

          <Link
            to="/dashboard/teams"
            className="group rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-5 text-left transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-700/70 dark:from-emerald-400/[0.08]"
          >
            <Users className="mb-4 h-8 w-8 text-emerald-500 transition-transform group-hover:translate-x-1" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Teams
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Assign teams to routes
            </p>
          </Link>

          <Link
            to="/dashboard/orders"
            className="group rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-violet-500/[0.08] to-transparent p-5 text-left transition-all hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg dark:border-slate-700/70 dark:from-violet-400/[0.08]"
          >
            <Package className="mb-4 h-8 w-8 text-violet-500 transition-transform group-hover:translate-x-1" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Orders
            </p>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Track and assign orders
            </p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
