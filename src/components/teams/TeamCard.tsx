// Draggable team card component
import { useDrag } from "react-dnd";
import { Users, GripVertical } from "lucide-react";
import { Team } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusColor, cn } from "../../utils/helpers";

interface TeamCardProps {
  team: Team;
}

// Drag item type
export const TEAM_DRAG_TYPE = "TEAM";

/**
 * Draggable team card component for drag-and-drop
 */
export function TeamCard({ team }: TeamCardProps) {
  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: TEAM_DRAG_TYPE,
    item: { id: team.id, type: TEAM_DRAG_TYPE, team },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className={cn(
        "p-4 bg-white dark:bg-gray-700 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-move transition-all",
        "hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md",
        isDragging && "opacity-50 scale-95",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle */}
        <div className="mt-1 text-gray-400">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Team icon */}
        <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Team details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate dark:text-white">
                {team.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {team.specialization}
              </p>
            </div>
            <Badge className={getStatusColor(team.status)}>{team.status}</Badge>
          </div>

          {/* Team members count */}
          {team.members && team.members.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {team.members.slice(0, 3).map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-center w-6 h-6 text-xs font-medium text-gray-700 bg-gray-300 border-2 border-white rounded-full dark:bg-gray-600 dark:border-gray-700 dark:text-gray-200"
                    title={member.profile?.full_name}
                  >
                    {member.profile?.full_name?.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {team.members.length} member
                {team.members.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
