// Custom hooks for analytics data
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { AnalyticsDaily } from '../types';

/**
 * Fetch daily analytics for the last N days
 */
export function useDailyAnalytics(days: number = 7) {
  return useQuery({
    queryKey: ['analytics', 'daily', days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('analytics_daily')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      return data as AnalyticsDaily[];
    },
  });
}

/**
 * Fetch real-time KPIs from actual data
 */
export function useKPIs() {
  return useQuery({
    queryKey: ['kpis'],
    queryFn: async () => {
      // Fetch counts and aggregates in parallel
      const [
        { count: totalRoutes },
        { count: activeRoutes },
        { count: totalOrders },
        { count: pendingOrders },
        { count: completedOrders },
        { count: totalTeams },
        { count: activeTeams },
        { count: totalVehicles },
        { count: activeVehicles },
        { data: revenueData }
      ] = await Promise.all([
        supabase.from('routes').select('*', { count: 'exact', head: true }),
        supabase.from('routes').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'delivered'),
        supabase.from('teams').select('*', { count: 'exact', head: true }),
        supabase.from('teams').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('orders').select('value_usd').eq('status', 'delivered')
      ]);

      // Calculate total revenue
      const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.value_usd || 0), 0) || 0;

      // Calculate completion rate
      const completionRate = totalOrders ? ((completedOrders || 0) / totalOrders) * 100 : 0;

      return {
        totalRoutes: totalRoutes || 0,
        activeRoutes: activeRoutes || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        completedOrders: completedOrders || 0,
        totalTeams: totalTeams || 0,
        activeTeams: activeTeams || 0,
        totalVehicles: totalVehicles || 0,
        activeVehicles: activeVehicles || 0,
        totalRevenue,
        completionRate: Math.round(completionRate),
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}
