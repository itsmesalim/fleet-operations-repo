// Core type definitions for the Fleet Management Dashboard

export type UserRole = 'Admin' | 'Manager' | 'Operator';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export type RouteStatus = 'active' | 'completed' | 'pending';

export interface Route {
  id: string;
  name: string;
  description: string;
  status: RouteStatus;
  start_location: string;
  end_location: string;
  distance_km: number;
  estimated_duration_hours: number;
  assigned_manager_id?: string | null;
  created_at: string;
  updated_at: string;
  assigned_manager?: Profile;
  vehicles?: Vehicle[];
  teams?: Team[];
  orders?: Order[];
}

export type VehicleStatus = 'active' | 'maintenance' | 'inactive';

export interface Vehicle {
  id: string;
  route_id?: string | null;
  name: string;
  type: string;
  license_plate: string;
  status: VehicleStatus;
  capacity_kg: number;
  fuel_level_percent: number;
  last_maintenance?: string | null;
  created_at: string;
  updated_at: string;
}

export type TeamStatus = 'active' | 'break' | 'offline';

export interface Team {
  id: string;
  name: string;
  route_id?: string | null;
  specialization: string;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  profile_id: string;
  position: string;
  joined_at: string;
  profile?: Profile;
}

export type OrderPriority = 'high' | 'medium' | 'low';
export type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  route_id?: string | null;
  order_number: string;
  customer_name: string;
  delivery_address: string;
  priority: OrderPriority;
  status: OrderStatus;
  weight_kg: number;
  value_usd: number;
  delivery_date: string;
  created_at: string;
  updated_at: string;
}

export type ActivityActionType = 'team_assigned' | 'team_moved' | 'order_moved' | 'route_updated' | 'order_assigned';
export type ActivityEntityType = 'team' | 'order' | 'route' | 'vehicle';

export interface ActivityLog {
  id: string;
  user_id: string;
  action_type: ActivityActionType;
  entity_type: ActivityEntityType;
  entity_id: string;
  previous_state?: Record<string, unknown>;
  new_state?: Record<string, unknown>;
  can_undo: boolean;
  created_at: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}

export interface AnalyticsDaily {
  id: string;
  date: string;
  total_deliveries: number;
  completed_deliveries: number;
  pending_deliveries: number;
  active_vehicles: number;
  active_teams: number;
  total_distance_km: number;
  total_revenue_usd: number;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Filter and Sort types
export interface RouteFilters {
  status?: RouteStatus;
  search?: string;
}

export interface OrderFilters {
  status?: OrderStatus;
  priority?: OrderPriority;
  search?: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}
