// Analytics dashboard with charts and visualizations
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Package, Truck, Users, DollarSign, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { SkeletonCard } from '../components/ui/Skeleton';
import { useKPIs, useDailyAnalytics } from '../hooks/useAnalytics';
import { formatCurrency, formatNumber } from '../utils/helpers';

// Chart colors
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

/**
 * Analytics dashboard page with charts and KPIs
 */
export function Analytics() {
  const [timeRange, setTimeRange] = useState<'7' | '14' | '30'>('7');
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: dailyAnalytics, isLoading: analyticsLoading } = useDailyAnalytics(
    parseInt(timeRange)
  );

  // Prepare chart data
  const deliveryTrendData = dailyAnalytics?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    completed: day.completed_deliveries,
    pending: day.pending_deliveries,
    total: day.total_deliveries,
  }));

  const revenueTrendData = dailyAnalytics?.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: day.total_revenue_usd,
  }));

  // Status distribution for pie chart
  const statusDistribution = [
    { name: 'Completed', value: kpis?.completedOrders || 0 },
    { name: 'Pending', value: kpis?.pendingOrders || 0 },
    { name: 'In Transit', value: (kpis?.totalOrders || 0) - (kpis?.completedOrders || 0) - (kpis?.pendingOrders || 0) },
  ];

  // Resource utilization
  const resourceData = [
    { name: 'Vehicles', active: kpis?.activeVehicles || 0, total: kpis?.totalVehicles || 0 },
    { name: 'Teams', active: kpis?.activeTeams || 0, total: kpis?.totalTeams || 0 },
    { name: 'Routes', active: kpis?.activeRoutes || 0, total: kpis?.totalRoutes || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track performance metrics and trends
          </p>
        </div>

        {/* Time range selector */}
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as '7' | '14' | '30')}
          options={[
            { value: '7', label: 'Last 7 days' },
            { value: '14', label: 'Last 14 days' },
            { value: '30', label: 'Last 30 days' },
          ]}
          className="sm:w-48"
        />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Badge variant="success">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {kpis?.completionRate}%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatNumber(kpis?.totalOrders || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Orders
              </p>
            </>
          )}
        </Card>

        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(kpis?.totalRevenue || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total Revenue
              </p>
            </>
          )}
        </Card>

        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Truck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis?.activeVehicles || 0}/{kpis?.totalVehicles || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Vehicles
              </p>
            </>
          )}
        </Card>

        <Card>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {kpis?.activeTeams || 0}/{kpis?.totalTeams || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active Teams
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Trend Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Trends
          </h2>
          {analyticsLoading ? (
            <SkeletonCard />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={deliveryTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Completed"
                />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  name="Pending"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Revenue Trend Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Revenue Trend
          </h2>
          {analyticsLoading ? (
            <SkeletonCard />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Order Status Distribution
          </h2>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Resource Utilization */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Resource Utilization
          </h2>
          {kpisLoading ? (
            <SkeletonCard />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="name" type="category" className="text-xs" />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" fill="#10B981" name="Active" />
                <Bar dataKey="total" fill="#6B7280" name="Total" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
