// Drop zone for unassigned orders
import { useDrop } from "react-dnd";
import { Package } from "lucide-react";
import { Order } from "../../types";
import { OrderCard, ORDER_DRAG_TYPE } from "./OrderCard";
import { Card } from "../ui/Card";
import { useAssignOrderToRoute } from "../../hooks/useOrders";
import { cn, formatCurrency } from "../../utils/helpers";

interface UnassignedOrdersZoneProps {
  orders: Order[];
  selectedOrders: Set<string>;
  onToggleSelection: (orderId: string) => void;
}

/**
 * Drop zone for unassigned orders (remove from routes)
 */
export function UnassignedOrdersZone({
  orders,
  selectedOrders,
  onToggleSelection,
}: UnassignedOrdersZoneProps) {
  const assignOrderToRoute = useAssignOrderToRoute();

  // Set up drop functionality to unassign orders
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ORDER_DRAG_TYPE,
    canDrop: (item: { order: Order }) => Boolean(item.order.route_id),
    drop: (item: { id: string; order: Order }) => {
      // Don't process if already unassigned
      if (!item.order.route_id) return;

      // Unassign order (set route_id to null, status back to pending)
      assignOrderToRoute.mutate({
        orderId: item.id,
        routeId: null,
        status: "pending",
      });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  // Calculate totals
  const totalValue = orders.reduce((sum, order) => sum + order.value_usd, 0);
  const totalWeight = orders.reduce((sum, order) => sum + order.weight_kg, 0);

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
            Unassigned Orders ({orders.length})
          </h2>
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 gap-4 p-3 mb-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
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
              "text-center py-12 rounded-lg border-2 border-dashed transition-colors",
              isActive
                ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                : "border-gray-300 dark:border-gray-600",
            )}
          >
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {isActive
                ? "Drop order here to unassign"
                : "No unassigned orders"}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {isActive
                ? "Release to remove from route"
                : "Drag assigned orders here to unassign them"}
            </p>
          </div>
        )}

        {/* Drop indicator */}
        {isActive && orders.length > 0 && (
          <div className="p-3 mt-3 text-center border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
              Drop to unassign order from route
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
