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

  // Get recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];

  // Calculate trends (simplified - in production would compare with previous period)
  const routeTrend = 12;
  const orderTrend = -5;
  const revenueTrend = 18;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your fleet today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Active Routes Card */}
        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                  <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${routeTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {routeTrend >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(routeTrend)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis?.activeRoutes || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Active Routes
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                of {kpis?.totalRoutes || 0} total routes
              </p>
            </>
          )}
        </Card>

        {/* Active Teams Card */}
        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis?.activeTeams || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Active Teams
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                of {kpis?.totalTeams || 0} total teams
              </p>
            </>
          )}
        </Card>

        {/* Orders Card */}
        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
                  <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${orderTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {orderTrend >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(orderTrend)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis?.pendingOrders || 0}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Pending Orders
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {kpis?.completedOrders || 0} completed today
              </p>
            </>
          )}
        </Card>

        {/* Revenue Card */}
        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg dark:bg-yellow-900/20">
                  <CheckCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${revenueTrend >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {revenueTrend >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(revenueTrend)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(kpis?.totalRevenue || 0)}
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Total Revenue
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                {kpis?.completionRate || 0}% completion rate
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Routes */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Routes
            </h2>
            <Link
              to="/dashboard/routes"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {routesLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-16" count={3} />
            </div>
          ) : routes && routes.length > 0 ? (
            <div className="space-y-3">
              {routes.slice(0, 5).map((route) => (
                <div
                  key={route.id}
                  className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate dark:text-white">
                      {route.name}
                    </p>
                    <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                      {route.start_location} → {route.end_location}
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
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No routes found
              </p>
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              to="/dashboard/orders"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all
            </Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-3">
              <Skeleton className="w-full h-16" count={3} />
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 transition-colors rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate dark:text-white">
                      {order.order_number}
                    </p>
                    <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                      {order.customer_name} • {formatCurrency(order.value_usd)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(order.priority)}>
                      {order.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">
                No orders found
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Link
            to="/dashboard/routes"
            className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
          >
            <Truck className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Routes
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View and edit fleet routes
            </p>
          </Link>

          <Link
            to="/dashboard/teams"
            className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Teams
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Assign teams to routes
            </p>
          </Link>

          <Link
            to="/dashboard/orders"
            className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/10"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium text-gray-900 dark:text-white">
              Manage Orders
            </p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Track and assign orders
            </p>
          </Link>
        </div>
      </Card>
    </div>
  );
}
