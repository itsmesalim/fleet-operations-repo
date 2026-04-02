// Custom hooks for teams data management using React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Route, Team } from '../types';
import { useStore } from '../store/useStore';

interface TeamMutationContext {
  previousTeams?: Team[];
  previousRoutes?: Route[];
}

interface UpdateTeamVariables {
  id: string;
  updates: Partial<Team>;
  previousState?: Team;
}

function updateTeamsCache(
  teams: Team[] | undefined,
  teamId: string,
  updates: Partial<Team>
) {
  if (!teams) return teams;

  return teams.map((team) =>
    team.id === teamId
      ? {
          ...team,
          ...updates,
        }
      : team
  );
}

function updateRoutesTeamAssignments(
  routes: Route[] | undefined,
  teamId: string,
  updates: Partial<Team>,
  previousState?: Team
) {
  if (!routes) return routes;

  return routes.map((route) => {
    const currentTeams = route.teams || [];
    const filteredTeams = currentTeams.filter((team) => team.id !== teamId);
    const nextRouteId =
      updates.route_id !== undefined ? updates.route_id : previousState?.route_id;

    if (route.id !== nextRouteId) {
      return {
        ...route,
        teams: filteredTeams,
      };
    }

    const baseTeam =
      filteredTeams.find((team) => team.id === teamId) ||
      currentTeams.find((team) => team.id === teamId) ||
      previousState;

    return {
      ...route,
      teams: baseTeam
        ? [
            ...filteredTeams,
            {
              ...baseTeam,
              ...updates,
            },
          ]
        : filteredTeams,
    };
  });
}

function applyTeamOptimisticUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  teamId: string,
  updates: Partial<Team>,
  previousState?: Team
) {
  queryClient.setQueryData<Team[]>(['teams'], (current) =>
    updateTeamsCache(current, teamId, updates)
  );
  queryClient.setQueryData<Route[]>(['routes'], (current) =>
    updateRoutesTeamAssignments(current, teamId, updates, previousState)
  );
}

/**
 * Fetch all teams with members
 */
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            profile:profiles(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Team[];
    },
  });
}

/**
 * Fetch a single team by ID
 */
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:team_members(
            *,
            profile:profiles(*)
          )
        `)
        .eq('id', teamId)
        .maybeSingle();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId,
  });
}

/**
 * Create a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (newTeam: Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(newTeam)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Team created successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to create team',
        type: 'error',
      });
    },
  });
}

/**
 * Update team (including route assignment for drag-and-drop)
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { addNotification, addUndo } = useStore();

  return useMutation<Team, Error, UpdateTeamVariables, TeamMutationContext>({
    mutationFn: async ({
      id,
      updates,
      previousState
    }) => {
      const { data, error } = await supabase
        .from('teams')
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
            action_type: 'team_assigned',
            entity_type: 'team',
            entity_id: id,
            previous_state: previousState as unknown as Record<string, unknown>,
            new_state: { ...previousState, ...updates } as unknown as Record<string, unknown>,
            can_undo: true,
          })
          .select()
          .single();

        // Add to undo stack
        if (logData) {
          const nextState = {
            ...previousState,
            ...updates,
          };

          addUndo({
            activityLogId: logData.id,
            undoAction: async () => {
              applyTeamOptimisticUpdate(
                queryClient,
                id,
                { route_id: previousState.route_id },
                nextState
              );

              await supabase
                .from('teams')
                .update({ route_id: previousState.route_id })
                .eq('id', id);
              queryClient.invalidateQueries({ queryKey: ['teams'] });
              queryClient.invalidateQueries({ queryKey: ['routes'] });
            },
            redoAction: async () => {
              applyTeamOptimisticUpdate(queryClient, id, updates, previousState);

              await supabase
                .from('teams')
                .update({ route_id: nextState.route_id })
                .eq('id', id);
              queryClient.invalidateQueries({ queryKey: ['teams'] });
              queryClient.invalidateQueries({ queryKey: ['routes'] });
            },
            description: `Move team ${previousState.name} back to previous route`,
          });
        }
      }

      return data;
    },
    onMutate: async ({ id, updates, previousState }) => {
      await queryClient.cancelQueries({ queryKey: ['teams'] });
      await queryClient.cancelQueries({ queryKey: ['routes'] });

      const previousTeams = queryClient.getQueryData<Team[]>(['teams']);
      const previousRoutes = queryClient.getQueryData<Route[]>(['routes']);

      applyTeamOptimisticUpdate(queryClient, id, updates, previousState);

      return {
        previousTeams,
        previousRoutes,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousTeams !== undefined) {
        queryClient.setQueryData<Team[]>(['teams'], context.previousTeams);
      }
      if (context?.previousRoutes !== undefined) {
        queryClient.setQueryData<Route[]>(['routes'], context.previousRoutes);
      }

      addNotification({
        title: 'Error',
        message: error.message || 'Failed to update team',
        type: 'error',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
}

/**
 * Delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();
  const { addNotification } = useStore();

  return useMutation({
    mutationFn: async (teamId: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      addNotification({
        title: 'Success',
        message: 'Team deleted successfully',
        type: 'success',
      });
    },
    onError: (error: Error) => {
      addNotification({
        title: 'Error',
        message: error.message || 'Failed to delete team',
        type: 'error',
      });
    },
  });
}

/**
 * Assign team to route (for drag-and-drop)
 */
export function useAssignTeamToRoute() {
  const updateTeam = useUpdateTeam();

  return useMutation({
    mutationFn: async ({
      teamId,
      routeId,
      previousRouteId
    }: {
      teamId: string;
      routeId: string | null;
      previousRouteId?: string | null
    }) => {
      // Fetch current team state for undo
      const { data: team } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      return updateTeam.mutateAsync({
        id: teamId,
        updates: { route_id: routeId },
        previousState: team,
      });
    },
  });
}
