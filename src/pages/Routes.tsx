// Routes management page with expandable rows and filtering
import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Truck,
  MapPin,
  Clock,
  Table2,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { SearchField } from '../components/ui/SearchField';
import { Badge } from '../components/ui/Badge';
import { SkeletonTable } from '../components/ui/Skeleton';
import { Modal } from '../components/ui/Modal';
import { useCreateRoute, useRoutes } from '../hooks/useRoutes';
import { RouteStatus } from '../types';
import {
  getStatusColor,
  formatDate,
  cn,
} from '../utils/helpers';

interface RouteFormState {
  name: string;
  description: string;
  status: RouteStatus;
  start_location: string;
  end_location: string;
  distance_km: string;
  estimated_duration_hours: string;
}

const initialRouteForm: RouteFormState = {
  name: '',
  description: '',
  status: 'pending',
  start_location: '',
  end_location: '',
  distance_km: '',
  estimated_duration_hours: '',
};

/**
 * Routes management page with expandable vehicle details
 */
export function Routes() {
  const { data: routes, isLoading } = useRoutes();
  const createRoute = useCreateRoute();
  const [expandedRoutes, setExpandedRoutes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<RouteStatus | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [routeForm, setRouteForm] = useState<RouteFormState>(initialRouteForm);

  /**
   * Toggle route expansion to show vehicles
   */
  const toggleRoute = (routeId: string) => {
    setExpandedRoutes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(routeId)) {
        newSet.delete(routeId);
      } else {
        newSet.add(routeId);
      }
      return newSet;
    });
  };

  /**
   * Filter routes based on search and status
   */
  const filteredRoutes = routes?.filter((route) => {
    const matchesSearch =
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.start_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.end_location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || route.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleRouteFieldChange = (
    field: keyof RouteFormState,
    value: string
  ) => {
    setRouteForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setRouteForm(initialRouteForm);
  };

  const handleCreateRoute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createRoute.mutateAsync({
      name: routeForm.name.trim(),
      description: routeForm.description.trim(),
      status: routeForm.status,
      start_location: routeForm.start_location.trim(),
      end_location: routeForm.end_location.trim(),
      distance_km: Number(routeForm.distance_km),
      estimated_duration_hours: Number(routeForm.estimated_duration_hours),
    });

    closeCreateModal();
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Routes & Fleet
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage your routes and associated vehicles
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Route
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="flex-1">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search routes, start, or destination..."
              resultCount={filteredRoutes?.length || 0}
            />
          </div>

          {/* Status filter */}
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RouteStatus | 'all')}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="sm:w-48"
          />
        </div>
      </Card>

      {/* Routes table */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
              <Table2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Routes Records Table
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add route records from the form and review their live fleet summary here
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <SkeletonTable rows={5} />
          </div>
        ) : filteredRoutes && filteredRoutes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Route
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Location
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Vehicles
                  </th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredRoutes.map((route) => (
                  <React.Fragment key={route.id}>
                    {/* Main route row */}
                    <tr
                      className="transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => toggleRoute(route.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="p-1 transition-colors rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRoute(route.id);
                            }}
                          >
                            {expandedRoutes.has(route.id) ? (
                              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {route.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {route.assigned_manager?.full_name || 'Unassigned'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {route.start_location} to {route.end_location}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {route.distance_km} km
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{route.estimated_duration_hours}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(route.status)}>
                          {route.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {route.vehicles?.length || 0}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>

                    {/* Expanded vehicle details */}
                    {expandedRoutes.has(route.id) && (
                      <tr className="bg-gray-50 dark:bg-gray-800/50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="pl-8">
                            <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                              Vehicles ({route.vehicles?.length || 0})
                            </h4>

                            {route.vehicles && route.vehicles.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {route.vehicles.map((vehicle) => (
                                  <div
                                    key={vehicle.id}
                                    className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                  >
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-100 rounded dark:bg-blue-900/20">
                                          <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {vehicle.name}
                                          </p>
                                          <p className="text-xs text-gray-600 dark:text-gray-400">
                                            {vehicle.type}
                                          </p>
                                        </div>
                                      </div>
                                      <Badge className={getStatusColor(vehicle.status)}>
                                        {vehicle.status}
                                      </Badge>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                          License Plate
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {vehicle.license_plate}
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                          Capacity
                                        </span>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          {vehicle.capacity_kg} kg
                                        </span>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">
                                          Fuel Level
                                        </span>
                                        <div className="flex items-center gap-2">
                                          <div className="w-24 h-2 overflow-hidden bg-gray-200 rounded-full dark:bg-gray-600">
                                            <div
                                              className={cn(
                                                'h-full rounded-full',
                                                vehicle.fuel_level_percent > 50
                                                  ? 'bg-green-500'
                                                  : vehicle.fuel_level_percent > 25
                                                    ? 'bg-yellow-500'
                                                    : 'bg-red-500'
                                              )}
                                              style={{
                                                width: `${vehicle.fuel_level_percent}%`,
                                              }}
                                            />
                                          </div>
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            {vehicle.fuel_level_percent}%
                                          </span>
                                        </div>
                                      </div>
                                      {vehicle.last_maintenance && (
                                        <div className="flex items-center justify-between">
                                          <span className="text-gray-600 dark:text-gray-400">
                                            Last Maintenance
                                          </span>
                                          <span className="font-medium text-gray-900 dark:text-white">
                                            {formatDate(vehicle.last_maintenance)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No vehicles assigned to this route
                              </div>
                            )}

                            {/* Stats summary */}
                            <div className="grid grid-cols-3 gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Teams Assigned
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {route.teams?.length || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Orders
                                </p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {route.orders?.length || 0}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Created
                                </p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDate(route.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <Truck className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No routes found
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              Add a route from the form to start building route records
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        title="Add New Route"
        size="xl"
      >
        <form className="space-y-4" onSubmit={handleCreateRoute}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Route Name"
              value={routeForm.name}
              onChange={(e) => handleRouteFieldChange('name', e.target.value)}
              placeholder="North Zone Delivery Loop"
              required
            />
            <Select
              label="Status"
              value={routeForm.status}
              onChange={(e) =>
                handleRouteFieldChange('status', e.target.value as RouteStatus)
              }
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
            <Input
              label="Start Location"
              value={routeForm.start_location}
              onChange={(e) =>
                handleRouteFieldChange('start_location', e.target.value)
              }
              placeholder="Warehouse A"
              required
            />
            <Input
              label="End Location"
              value={routeForm.end_location}
              onChange={(e) =>
                handleRouteFieldChange('end_location', e.target.value)
              }
              placeholder="City Center Hub"
              required
            />
            <Input
              label="Distance (km)"
              type="number"
              min="0"
              step="0.1"
              value={routeForm.distance_km}
              onChange={(e) =>
                handleRouteFieldChange('distance_km', e.target.value)
              }
              placeholder="42.5"
              required
            />
            <Input
              label="Estimated Duration (hours)"
              type="number"
              min="0"
              step="0.1"
              value={routeForm.estimated_duration_hours}
              onChange={(e) =>
                handleRouteFieldChange(
                  'estimated_duration_hours',
                  e.target.value
                )
              }
              placeholder="6"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={routeForm.description}
              onChange={(e) =>
                handleRouteFieldChange('description', e.target.value)
              }
              rows={4}
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter route notes, fleet coverage, or operational instructions"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={closeCreateModal}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoute.isPending}>
              {createRoute.isPending ? 'Saving...' : 'Create Route'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
