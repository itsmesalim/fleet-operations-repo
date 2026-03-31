// Drop zone for unassigned teams
import { useDrop } from "react-dnd";
import { Users } from "lucide-react";
import { Team } from "../../types";
import { TeamCard, TEAM_DRAG_TYPE } from "./TeamCard";
import { Card } from "../ui/Card";
import { useAssignTeamToRoute } from "../../hooks/useTeams";
import { cn } from "../../utils/helpers";

interface UnassignedTeamsZoneProps {
  teams: Team[];
}

/**
 * Drop zone for unassigned teams (remove from routes)
 */
export function UnassignedTeamsZone({ teams }: UnassignedTeamsZoneProps) {
  const assignTeamToRoute = useAssignTeamToRoute();

  // Set up drop functionality to unassign teams
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: TEAM_DRAG_TYPE,
    drop: (item: { id: string; team: Team }) => {
      // Don't process if already unassigned
      if (!item.team.route_id) return;

      // Unassign team (set route_id to null)
      assignTeamToRoute.mutate({
        teamId: item.id,
        routeId: null,
        previousRouteId: item.team.route_id,
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <Card
      className={cn(
        "transition-all",
        isActive &&
          "ring-2 ring-orange-500 ring-offset-2 bg-orange-50 dark:bg-orange-900/10",
        canDrop && !isOver && "border-orange-300 dark:border-orange-700",
      )}
    >
      <div ref={drop}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Unassigned Teams ({teams.length})
          </h2>
        </div>

        {teams.length > 0 ? (
          <div className="space-y-3">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "text-center py-12 rounded-lg border-2 border-dashed transition-colors",
              isActive
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : "border-gray-300 dark:border-gray-600",
            )}
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isActive ? "Drop team here to unassign" : "No unassigned teams"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {isActive
                ? "Release to remove from route"
                : "Drag assigned teams here to unassign them"}
            </p>
          </div>
        )}

        {/* Drop indicator */}
        {isActive && teams.length > 0 && (
          <div className="p-3 mt-3 text-center border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Drop to unassign team from route
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
