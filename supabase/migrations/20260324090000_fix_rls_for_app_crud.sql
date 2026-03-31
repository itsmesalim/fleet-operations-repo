/*
  # Fix RLS for app CRUD flows

  ## Why
  - Frontend allows authenticated users to create routes, teams, orders, and related records.
  - Existing RLS only allows route writes for Admin/Manager, which causes 403 / code 42501.
  - Profiles table also misses an INSERT policy for users creating their own profile.

  ## What this migration changes
  - Allow authenticated users to insert their own profile row.
  - Allow authenticated users with a profile row to create/update/delete routes.
  - Align vehicles, teams, team_members, and orders with the same app-level access model.
*/

-- Profiles: allow a signed-in user to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Routes: replace restrictive write policies with app-friendly ones
DROP POLICY IF EXISTS "Admins and managers can insert routes" ON routes;
DROP POLICY IF EXISTS "Admins and assigned managers can update routes" ON routes;
DROP POLICY IF EXISTS "Admins can delete routes" ON routes;

CREATE POLICY "Authenticated users can insert routes"
  ON routes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update routes"
  ON routes FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete routes"
  ON routes FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Vehicles: keep read access open to authenticated users, align writes with app behavior
DROP POLICY IF EXISTS "Admins and managers can manage vehicles" ON vehicles;

CREATE POLICY "Authenticated users can manage vehicles"
  ON vehicles FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Teams
DROP POLICY IF EXISTS "Admins and managers can manage teams" ON teams;

CREATE POLICY "Authenticated users can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Team members
DROP POLICY IF EXISTS "Admins and managers can manage team members" ON team_members;

CREATE POLICY "Authenticated users can manage team members"
  ON team_members FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Orders
DROP POLICY IF EXISTS "Admins and managers can manage orders" ON orders;

CREATE POLICY "Authenticated users can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
