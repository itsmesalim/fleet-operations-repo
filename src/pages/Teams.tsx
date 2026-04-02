// Teams management page with drag-and-drop assignment
import React, { useMemo, useState } from "react";
import {
  Plus,
  Users as UsersIcon,
  Table2,
  MapPinned,
  ClipboardList,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { SearchField } from "../components/ui/SearchField";
import { RouteDropZone } from "../components/teams/RouteDropZone";
import { UnassignedTeamsZone } from "../components/teams/UnassignedTeamsZone";
import { Modal } from "../components/ui/Modal";
import { useCreateTeam, useTeams } from "../hooks/useTeams";
import { useRoutes } from "../hooks/useRoutes";
import { SkeletonTable } from "../components/ui/Skeleton";
import { TeamStatus } from "../types";
import { Badge } from "../components/ui/Badge";
import { getStatusColor } from "../utils/helpers";

interface TeamFormState {
  name: string;
  specialization: string;
  status: TeamStatus;
  route_id: string;
}

const initialTeamForm: TeamFormState = {
  name: "",
  specialization: "",
  status: "active",
  route_id: "",
};

/**
 * Teams management page with drag-and-drop for route assignment
 */
export function Teams() {
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: routes, isLoading: routesLoading } = useRoutes();
  const createTeam = useCreateTeam();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState<TeamFormState>(initialTeamForm);

  const routeNameMap = useMemo(
    () => new Map((routes || []).map((route) => [route.id, route.name])),
    [routes],
  );

  // Filter teams based on search
  const filteredTeams = teams?.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Separate teams by route assignment
  const unassignedTeams = filteredTeams?.filter((team) => !team.route_id) || [];
  const assignedTeams = filteredTeams?.filter((team) => team.route_id) || [];

  const handleTeamFieldChange = (field: keyof TeamFormState, value: string) => {
    setTeamForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setTeamForm(initialTeamForm);
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await createTeam.mutateAsync({
      name: teamForm.name.trim(),
      specialization: teamForm.specialization.trim(),
      status: teamForm.status,
      route_id: teamForm.route_id || null,
    });

    closeCreateModal();
  };

  return (
    <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Teams Management
            </h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Drag and drop teams to assign them to routes
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Team
          </Button>
        </div>

        {/* Search */}
        <Card>
          <SearchField
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search teams by name..."
            resultCount={filteredTeams?.length || 0}
          />
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Drag teams using the grip handle and drop them on a route or back
            into the unassigned column.
          </p>
        </Card>

        {teamsLoading || routesLoading ? (
          <Card>
            <SkeletonTable rows={5} />
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Unassigned teams */}
              <div>
                <UnassignedTeamsZone teams={unassignedTeams} />
              </div>

              {/* Routes with assigned teams */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Routes ({routes?.length || 0})
                </h2>

                {routes && routes.length > 0 ? (
                  <div className="space-y-4">
                    {routes.map((route) => {
                      const routeTeams = assignedTeams.filter(
                        (team) => team.route_id === route.id,
                      );
                      return (
                        <RouteDropZone
                          key={route.id}
                          route={route}
                          teams={routeTeams}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <div className="py-12 text-center">
                      <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg text-gray-600 dark:text-gray-400">
                        No routes found
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                        Create routes to assign teams
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            <Card padding="none">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <Table2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Teams Records Table
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      All team records with assignment and member summary
                    </p>
                  </div>
                </div>
              </div>

              {filteredTeams && filteredTeams.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:bg-gray-700/50 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Team
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Specialization
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Assigned Route
                        </th>
                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                          Members
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTeams.map((team) => (
                        <tr
                          key={team.id}
                          className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {team.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                ID: {team.id.slice(0, 8)}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {team.specialization}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(team.status)}>
                              {team.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <MapPinned className="w-4 h-4 text-gray-400" />
                              <span>
                                {team.route_id
                                  ? routeNameMap.get(team.route_id) ||
                                    "Assigned"
                                  : "Unassigned"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <ClipboardList className="w-4 h-4 text-gray-400" />
                              <span>{team.members?.length || 0} members</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center">
                  <UsersIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    No teams available
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                    Add a new team to start building records
                  </p>
                </div>
              )}
            </Card>
          </>
        )}

        <Modal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          title="Add New Team"
          size="lg"
        >
          <form className="space-y-4" onSubmit={handleCreateTeam}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Team Name"
                value={teamForm.name}
                onChange={(e) => handleTeamFieldChange("name", e.target.value)}
                placeholder="Field Operations Alpha"
                required
              />
              <Input
                label="Specialization"
                value={teamForm.specialization}
                onChange={(e) =>
                  handleTeamFieldChange("specialization", e.target.value)
                }
                placeholder="Last-mile delivery"
                required
              />
              <Select
                label="Status"
                value={teamForm.status}
                onChange={(e) =>
                  handleTeamFieldChange("status", e.target.value as TeamStatus)
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "break", label: "Break" },
                  { value: "offline", label: "Offline" },
                ]}
              />
              <Select
                label="Assign Route"
                value={teamForm.route_id}
                onChange={(e) =>
                  handleTeamFieldChange("route_id", e.target.value)
                }
                options={[
                  { value: "", label: "Unassigned" },
                  ...(routes || []).map((route) => ({
                    value: route.id,
                    label: route.name,
                  })),
                ]}
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
              <Button type="submit" disabled={createTeam.isPending}>
                {createTeam.isPending ? "Saving..." : "Create Team"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
}
