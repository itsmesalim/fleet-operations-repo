// Custom hooks for routes data management using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Route } from '../types';
import { useStore } from '../store/useStore';

/**
 * Fetch all routes with related data (vehicles, teams, orders)
 */
export function useRoutes() {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          assigned_manager:profiles!routes_assigned_manager_id_fkey(*),
          vehicles(*),
          teams(*),
          orders(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Route[];
    },
  });
}

/**
 * Fetch a single route by ID
 */
export function useRoute(routeId: string) {
  return useQuery({
    queryKey: ['routes', routeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          *,
          assigned_manager:profiles!routes_assigned_manager_id_fkey(*),
          vehicles(*),
          teams(*),
          orders(*)
        `)
        .eq('id', routeId)
        .maybeSingle();

      if (error) throw error;
      return data as Route;
    },
    enabled: !!routeId,
  });
}

/**
 * Create a new route
 */
export function useCreateRoute() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (newRoute: Partial<Route>) => {
      const { data, error } = await supabase
        .from('routes')
        .insert(newRoute)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Route created successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to create route',
        type: 'error',
      });
    },
  });
}

/**
 * Update an existing route
 */
export function useUpdateRoute() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Route> }) => {
      const { data, error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Route updated successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to update route',
        type: 'error',
      });
    },
  });
}

/**
 * Delete a route
 */
export function useDeleteRoute() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (routeId: string) => {
      const { error } = await supabase
        .from('routes')
        .delete()
        .eq('id', routeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Route deleted successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to delete route',
        type: 'error',
      });
    },
  });
}
