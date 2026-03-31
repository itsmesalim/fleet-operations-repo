/*
  # Fleet Management Dashboard Schema

  ## Overview
  Complete database schema for an enterprise-grade Operations & Fleet Management Dashboard
  with support for routes, vehicles, teams, orders, and activity tracking.

  ## New Tables

  1. **profiles**
     - `id` (uuid, primary key, references auth.users)
     - `email` (text)
     - `full_name` (text)
     - `role` (text) - Admin, Manager, or Operator
     - `avatar_url` (text, optional)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  2. **routes**
     - `id` (uuid, primary key)
     - `name` (text) - Route name/identifier
     - `description` (text)
     - `status` (text) - active, completed, pending
     - `start_location` (text)
     - `end_location` (text)
     - `distance_km` (numeric)
     - `estimated_duration_hours` (numeric)
     - `assigned_manager_id` (uuid, references profiles)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  3. **vehicles**
     - `id` (uuid, primary key)
     - `route_id` (uuid, references routes)
     - `name` (text) - Vehicle identifier
     - `type` (text) - Truck, Van, Car, etc.
     - `license_plate` (text)
     - `status` (text) - active, maintenance, inactive
     - `capacity_kg` (numeric)
     - `fuel_level_percent` (integer)
     - `last_maintenance` (date)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  4. **teams**
     - `id` (uuid, primary key)
     - `name` (text)
     - `route_id` (uuid, references routes, nullable)
     - `specialization` (text) - Delivery, Logistics, Maintenance
     - `status` (text) - active, break, offline
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  5. **team_members**
     - `id` (uuid, primary key)
     - `team_id` (uuid, references teams)
     - `profile_id` (uuid, references profiles)
     - `position` (text) - Driver, Assistant, Supervisor
     - `joined_at` (timestamptz)

  6. **orders**
     - `id` (uuid, primary key)
     - `route_id` (uuid, references routes, nullable)
     - `order_number` (text, unique)
     - `customer_name` (text)
     - `delivery_address` (text)
     - `priority` (text) - high, medium, low
     - `status` (text) - pending, assigned, in_transit, delivered, cancelled
     - `weight_kg` (numeric)
     - `value_usd` (numeric)
     - `delivery_date` (date)
     - `created_at` (timestamptz)
     - `updated_at` (timestamptz)

  7. **activity_logs**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references profiles)
     - `action_type` (text) - team_assigned, order_moved, route_updated
     - `entity_type` (text) - team, order, route, vehicle
     - `entity_id` (uuid)
     - `previous_state` (jsonb) - For undo functionality
     - `new_state` (jsonb)
     - `can_undo` (boolean)
     - `created_at` (timestamptz)

  8. **notifications**
     - `id` (uuid, primary key)
     - `user_id` (uuid, references profiles)
     - `title` (text)
     - `message` (text)
     - `type` (text) - info, success, warning, error
     - `read` (boolean)
     - `created_at` (timestamptz)

  9. **analytics_daily**
     - `id` (uuid, primary key)
     - `date` (date, unique)
     - `total_deliveries` (integer)
     - `completed_deliveries` (integer)
     - `pending_deliveries` (integer)
     - `active_vehicles` (integer)
     - `active_teams` (integer)
     - `total_distance_km` (numeric)
     - `total_revenue_usd` (numeric)
     - `created_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users based on roles
  - Admins have full access
  - Managers can view and edit assigned routes
  - Operators have read-only access to assigned routes
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'Operator' CHECK (role IN ('Admin', 'Manager', 'Operator')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'completed', 'pending')),
  start_location text NOT NULL,
  end_location text NOT NULL,
  distance_km numeric DEFAULT 0,
  estimated_duration_hours numeric DEFAULT 0,
  assigned_manager_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view routes"
  ON routes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

CREATE POLICY "Admins and assigned managers can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'Admin' OR (profiles.role = 'Manager' AND profiles.id = routes.assigned_manager_id))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'Admin' OR (profiles.role = 'Manager' AND profiles.id = routes.assigned_manager_id))
    )
  );

CREATE POLICY "Admins can delete routes"
  ON routes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  license_plate text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  capacity_kg numeric DEFAULT 0,
  fuel_level_percent integer DEFAULT 100 CHECK (fuel_level_percent >= 0 AND fuel_level_percent <= 100),
  last_maintenance date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view vehicles"
  ON vehicles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  specialization text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'break', 'offline')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, profile_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES routes(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  delivery_address text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_transit', 'delivered', 'cancelled')),
  weight_kg numeric DEFAULT 0,
  value_usd numeric DEFAULT 0,
  delivery_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and managers can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('Admin', 'Manager')
    )
  );

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  can_undo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create analytics_daily table
CREATE TABLE IF NOT EXISTS analytics_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date UNIQUE NOT NULL,
  total_deliveries integer DEFAULT 0,
  completed_deliveries integer DEFAULT 0,
  pending_deliveries integer DEFAULT 0,
  active_vehicles integer DEFAULT 0,
  active_teams integer DEFAULT 0,
  total_distance_km numeric DEFAULT 0,
  total_revenue_usd numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view analytics"
  ON analytics_daily FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage analytics"
  ON analytics_daily FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'Admin'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_routes_status ON routes(status);
CREATE INDEX IF NOT EXISTS idx_routes_manager ON routes(assigned_manager_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_route ON vehicles(route_id);
CREATE INDEX IF NOT EXISTS idx_teams_route ON teams(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_route ON orders(route_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_priority ON orders(priority);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);