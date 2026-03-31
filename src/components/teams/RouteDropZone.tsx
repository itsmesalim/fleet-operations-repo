// Drop zone for route team assignment
import { useDrop } from "react-dnd";
import { MapPin, Truck, Users } from "lucide-react";
import { Route, Team } from "../../types";
import { TeamCard, TEAM_DRAG_TYPE } from "./TeamCard";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useAssignTeamToRoute } from "../../hooks/useTeams";
import { getStatusColor, cn } from "../../utils/helpers";

interface RouteDropZoneProps {
  route: Route;
  teams: Team[];
}

/**
 * Drop zone component for assigning teams to routes
 */
export function RouteDropZone({ route, teams }: RouteDropZoneProps) {
  const assignTeamToRoute = useAssignTeamToRoute();

  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: TEAM_DRAG_TYPE,
    drop: (item: { id: string; team: Team }) => {
      // Don't reassign if already on this route
      if (item.team.route_id === route.id) return;

      // Assign team to this route
      assignTeamToRoute.mutate({
        teamId: item.id,
        routeId: route.id,
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
          "ring-2 ring-blue-500 ring-offset-2 bg-blue-50 dark:bg-blue-900/10",
        canDrop && !isOver && "border-blue-300 dark:border-blue-700",
      )}
    >
      <div ref={drop}>
        {/* Route header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-1 min-w-0 gap-3">
            <div className="p-2 bg-green-100 rounded-lg dark:bg-green-900/20">
              <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate dark:text-white">
                {route.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="w-3 h-3 text-gray-500" />
                <p className="text-sm text-gray-600 truncate dark:text-gray-400">
                  {route.start_location} → {route.end_location}
                </p>
              </div>
            </div>
          </div>
          <Badge className={getStatusColor(route.status)}>{route.status}</Badge>
        </div>

        {/* Teams assigned to this route */}
        {teams.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {teams.length} team{teams.length !== 1 ? "s" : ""} assigned
            </p>
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "text-center py-8 rounded-lg border-2 border-dashed transition-colors",
              isActive
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600",
            )}
          >
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isActive
                ? "Drop team here to assign"
                : "Drag teams here to assign to this route"}
            </p>
          </div>
        )}

        {/* Drop indicator */}
        {isActive && teams.length > 0 && (
          <div className="p-3 mt-3 text-center border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Drop to assign team to this route
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
