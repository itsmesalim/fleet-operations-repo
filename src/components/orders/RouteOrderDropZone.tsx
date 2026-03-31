// Drop zone for route order assignment
import { useDrop } from "react-dnd";
import { MapPin, Truck, Package } from "lucide-react";
import { Route, Order } from "../../types";
import { OrderCard, ORDER_DRAG_TYPE } from "./OrderCard";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { useAssignOrderToRoute } from "../../hooks/useOrders";
import { getStatusColor, formatCurrency, cn } from "../../utils/helpers";

interface RouteOrderDropZoneProps {
  route: Route;
  orders: Order[];
  selectedOrders: Set<string>;
  onToggleSelection: (orderId: string) => void;
}

/**
 * Drop zone component for assigning orders to routes
 */
export function RouteOrderDropZone({
  route,
  orders,
  selectedOrders,
  onToggleSelection,
}: RouteOrderDropZoneProps) {
  const assignOrderToRoute = useAssignOrderToRoute();

  // Set up drop functionality
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ORDER_DRAG_TYPE,
    drop: (item: { id: string; order: Order }) => {
      // Don't reassign if already on this route
      if (item.order.route_id === route.id) return;

      // Assign order to this route
      assignOrderToRoute.mutate({
        orderId: item.id,
        routeId: route.id,
        status: "assigned",
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  // Calculate stats for this route
  const totalValue = orders.reduce((sum, order) => sum + order.value_usd, 0);
  const totalWeight = orders.reduce((sum, order) => sum + order.weight_kg, 0);

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

        {/* Orders stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-3 mb-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Orders</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {orders.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Value
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Total Weight
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalWeight} kg
              </p>
            </div>
          </div>
        )}

        {/* Orders assigned to this route */}
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isSelected={selectedOrders.has(order.id)}
                onToggleSelection={onToggleSelection}
              />
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
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isActive
                ? "Drop order here to assign"
                : "Drag orders here to assign to this route"}
            </p>
          </div>
        )}

        {/* Drop indicator */}
        {isActive && orders.length > 0 && (
          <div className="p-3 mt-3 text-center border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Drop to assign order to this route
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
