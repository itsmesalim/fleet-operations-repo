// Custom hooks for orders data management using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { useStore } from '../store/useStore';

/**
 * Fetch all orders
 */
export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

/**
 * Fetch orders by route
 */
export function useOrdersByRoute(routeId: string | null) {
  return useQuery({
    queryKey: ['orders', 'route', routeId],
    queryFn: async () => {
      let query = supabase.from('orders').select('*');

      if (routeId === null) {
        query = query.is('route_id', null);
      } else {
        query = query.eq('route_id', routeId);
      }

      const { data, error } = await query.order('priority', { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (newOrder: Partial<Order>) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(newOrder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Order created successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to create order',
        type: 'error',
      });
    },
  });
}

/**
 * Update an order (including route assignment for drag-and-drop)
 */
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  const { addNotification, addUndo } = useStore();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
      previousState
    }: {
      id: string;
      updates: Partial<Order>;
      previousState?: Order
    }) => {
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Log activity for undo functionality
      if (previousState) {
        const { data: logData } = await supabase
          .from('activity_logs')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            action_type: 'order_moved',
            entity_type: 'order',
            entity_id: id,
            previous_state: previousState as unknown as Record<string, unknown>,
            new_state: { ...previousState, ...updates } as unknown as Record<string, unknown>,
            can_undo: true,
          })
          .select()
          .single();

        // Add to undo stack
        if (logData) {
          addUndo({
            activityLogId: logData.id,
            action: async () => {
              await supabase
                .from('orders')
                .update({
                  route_id: previousState.route_id,
                  status: previousState.status
                })
                .eq('id', id);
              queryClient.invalidateQueries({ queryKey: ['orders'] });
              queryClient.invalidateQueries({ queryKey: ['routes'] });
            },
            description: `Move order ${previousState.order_number} back to previous route`,
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to update order',
        type: 'error',
      });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

/**
 * Delete an order
 */
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Order deleted successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to delete order',
        type: 'error',
      });
    },
  });
}

/**
 * Bulk delete orders
 */
export function useBulkDeleteOrders() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (orderIds: string[]) => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .in('id', orderIds);

      if (error) throw error;
    },
    onSuccess: (_, orderIds) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: `${orderIds.length} orders deleted successfully`,
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to delete orders',
        type: 'error',
      });
    },
  });
}

/**
 * Assign order to route (for drag-and-drop)
 */
export function useAssignOrderToRoute() {
  const updateOrder = useUpdateOrder();

  return useMutation({
    mutationFn: async ({
      orderId,
      routeId,
      status
    }: {
      orderId: string;
      routeId: string | null;
      status?: string
    }) => {
      // Fetch current order state for undo
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      const updates: Partial<Order> = { route_id: routeId };
      if (status) {
        updates.status = status as Order['status'];
      } else if (routeId) {
        updates.status = 'assigned';
      }

      return updateOrder.mutateAsync({
        id: orderId,
        updates,
        previousState: order,
      });
    },
  });
}
