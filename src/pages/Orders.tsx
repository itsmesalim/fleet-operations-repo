// Orders management page with drag-and-drop and bulk actions
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Package,
  Trash2,
  Table2,
  CalendarDays,
  Route,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchField } from '../components/ui/SearchField';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { RouteOrderDropZone } from '../components/orders/RouteOrderDropZone';
import { UnassignedOrdersZone } from '../components/orders/UnassignedOrdersZone';
import { useCreateOrder, useOrders, useBulkDeleteOrders } from '../hooks/useOrders';
import { useRoutes } from '../hooks/useRoutes';
import { SkeletonTable } from '../components/ui/Skeleton';
import { OrderPriority, OrderStatus } from '../types';
import { formatDate, getPriorityColor, getStatusColor } from '../utils/helpers';

interface OrderFormState {
  order_number: string;
  customer_name: string;
  delivery_address: string;
  priority: OrderPriority;
  status: OrderStatus;
  weight_kg: string;
  value_usd: string;
  delivery_date: string;
  route_id: string;
}

const initialOrderForm: OrderFormState = {
  order_number: '',
  customer_name: '',
  delivery_address: '',
  priority: 'medium',
  status: 'pending',
  weight_kg: '',
  value_usd: '',
  delivery_date: '',
  route_id: '',
};

/**
 * Orders management page with drag-and-drop and bulk actions
 */
export function Orders() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: routes, isLoading: routesLoading } = useRoutes();
  const bulkDeleteOrders = useBulkDeleteOrders();
  const createOrder = useCreateOrder();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormState>(initialOrderForm);

  const routeNameMap = useMemo(
    () =>
      new Map(
        (routes || []).map((route) => [route.id, route.name])
      ),
    [routes]
  );

  /**
   * Filter orders based on search and filters
   */
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Separate orders by route assignment
  const unassignedOrders = filteredOrders?.filter((order) => !order.route_id) || [];
  const assignedOrders = filteredOrders?.filter((order) => order.route_id) || [];

  /**
   * Toggle order selection
   */
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  /**
   * Select all visible orders
   */
  const selectAll = () => {
    if (filteredOrders) {
      setSelectedOrders(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedOrders(new Set());
  };

  /**
   * Delete selected orders
   */
  const deleteSelected = async () => {
    if (selectedOrders.size === 0) return;

    if (window.confirm(`Delete ${selectedOrders.size} selected order(s)?`)) {
      await bulkDeleteOrders.mutateAsync(Array.from(selectedOrders));
      clearSelection();
    }
  };

  const handleOrderFieldChange = (
    field: keyof OrderFormState,
    value: string
  ) => {
    setOrderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setOrderForm(initialOrderForm);
  };

  const handleCreateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createOrder.mutateAsync({
      order_number: orderForm.order_number.trim(),
      customer_name: orderForm.customer_name.trim(),
      delivery_address: orderForm.delivery_address.trim(),
      priority: orderForm.priority,
      status: orderForm.status,
      weight_kg: Number(orderForm.weight_kg),
      value_usd: Number(orderForm.value_usd),
      delivery_date: orderForm.delivery_date,
      route_id: orderForm.route_id || null,
    });

    closeCreateModal();
  };

  return (
    <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Orders Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Drag and drop orders to assign them to routes
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.size > 0 && (
              <Button variant="danger" onClick={deleteSelected}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedOrders.size})
              </Button>
            )}
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Order
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <SearchField
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search orders by number or customer..."
                resultCount={filteredOrders?.length || 0}
              />
            </div>

            {/* Priority filter */}
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as OrderPriority | 'all')}
              options={[
                { value: 'all', label: 'All Priorities' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              className="lg:w-48"
            />

            {/* Status filter */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'delivered', label: 'Delivered' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              className="lg:w-48"
            />
          </div>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Drag orders from the grip handle to reassign them between routes or
            back into the unassigned list.
          </p>

          {/* Bulk actions */}
          {filteredOrders && filteredOrders.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedOrders.size === filteredOrders.length}
                  onChange={(e) => e.target.checked ? selectAll() : clearSelection()}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedOrders.size > 0
                    ? `${selectedOrders.size} selected`
                    : 'Select all'}
                </span>
              </div>
              {selectedOrders.size > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear selection
                </button>
              )}
            </div>
          )}
        </Card>

        {ordersLoading || routesLoading ? (
          <Card>
            <SkeletonTable rows={5} />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Unassigned orders */}
              <div>
                <UnassignedOrdersZone
                  orders={unassignedOrders}
                  selectedOrders={selectedOrders}
                  onToggleSelection={toggleOrderSelection}
                />
              </div>

              {/* Routes with assigned orders */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Routes ({routes?.length || 0})
                </h2>

                {routes && routes.length > 0 ? (
                  <div className="space-y-4">
                    {routes.map((route) => {
                      const routeOrders = assignedOrders.filter(
                        (order) => order.route_id === route.id
                      );
                      return (
                        <RouteOrderDropZone
                          key={route.id}
                          route={route}
                          orders={routeOrders}
                          selectedOrders={selectedOrders}
                          onToggleSelection={toggleOrderSelection}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 text-lg">
                        No routes found
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                        Create routes to assign orders
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <Card padding="none">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Table2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Orders Records Table
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Newly added orders and their assignment details are listed here
                    </p>
                  </div>
                </div>
              </div>

              {filteredOrders && filteredOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Priority
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Delivery Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Route
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {order.order_number}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.weight_kg} kg shipment
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            <div>
                              <p>{order.customer_name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {order.delivery_address}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getPriorityColor(order.priority)}>
                              {order.priority}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span>{formatDate(order.delivery_date)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Route className="w-4 h-4 text-gray-400" />
                              <span>
                                {order.route_id
                                  ? routeNameMap.get(order.route_id) || 'Assigned'
                                  : 'Unassigned'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            ${order.value_usd.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No orders found
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                    Add an order from the form to start tracking records
                  </p>
                </div>
              )}
            </Card>
          </>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          title="Add New Order"
          size="xl"
        >
          <form className="space-y-4" onSubmit={handleCreateOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Order Number"
                value={orderForm.order_number}
                onChange={(e) =>
                  handleOrderFieldChange('order_number', e.target.value)
                }
                placeholder="ORD-10021"
                required
              />
              <Input
                label="Customer Name"
                value={orderForm.customer_name}
                onChange={(e) =>
                  handleOrderFieldChange('customer_name', e.target.value)
                }
                placeholder="Ahmed Traders"
                required
              />
              <Select
                label="Priority"
                value={orderForm.priority}
                onChange={(e) =>
                  handleOrderFieldChange('priority', e.target.value as OrderPriority)
                }
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'low', label: 'Low' },
                ]}
              />
              <Select
                label="Status"
                value={orderForm.status}
                onChange={(e) =>
                  handleOrderFieldChange('status', e.target.value as OrderStatus)
                }
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'assigned', label: 'Assigned' },
                  { value: 'in_transit', label: 'In Transit' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
              />
              <Input
                label="Weight (kg)"
                type="number"
                min="0"
                step="0.1"
                value={orderForm.weight_kg}
                onChange={(e) => handleOrderFieldChange('weight_kg', e.target.value)}
                placeholder="150"
                required
              />
              <Input
                label="Value (USD)"
                type="number"
                min="0"
                step="0.01"
                value={orderForm.value_usd}
                onChange={(e) => handleOrderFieldChange('value_usd', e.target.value)}
                placeholder="3500"
                required
              />
              <Input
                label="Delivery Date"
                type="date"
                value={orderForm.delivery_date}
                onChange={(e) =>
                  handleOrderFieldChange('delivery_date', e.target.value)
                }
                required
              />
              <Select
                label="Assign Route"
                value={orderForm.route_id}
                onChange={(e) => handleOrderFieldChange('route_id', e.target.value)}
                options={[
                  { value: '', label: 'Unassigned' },
                  ...(routes || []).map((route) => ({
                    value: route.id,
                    label: route.name,
                  })),
                ]}
              />
            </div>

            <Input
              label="Delivery Address"
              value={orderForm.delivery_address}
              onChange={(e) =>
                handleOrderFieldChange('delivery_address', e.target.value)
              }
              placeholder="Plot 11, Industrial Area, Lahore"
              required
            />

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                onClick={closeCreateModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Saving...' : 'Create Order'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
