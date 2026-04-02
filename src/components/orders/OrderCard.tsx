// Draggable order card component
import { useDrag } from 'react-dnd';
import { Package, GripVertical, Calendar } from 'lucide-react';
import { Order } from '../../types';
import { Badge } from '../ui/Badge';
import { getStatusColor, getPriorityColor, formatCurrency, formatDate, cn } from '../../utils/helpers';

interface OrderCardProps {
  order: Order;
  isSelected?: boolean;
  onToggleSelection?: (orderId: string) => void;
}

// Drag item type
export const ORDER_DRAG_TYPE = 'ORDER';

/**
 * Draggable order card component for drag-and-drop
 */
export function OrderCard({ order, isSelected, onToggleSelection }: OrderCardProps) {
  // Set up drag functionality
  const [{ isDragging }, drag, preview] = useDrag({
    type: ORDER_DRAG_TYPE,
    item: { id: order.id, type: ORDER_DRAG_TYPE, order },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={preview}
      className={cn(
        'p-4 bg-white dark:bg-gray-700 rounded-lg border-2 transition-all',
        'hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md',
        isDragging && 'opacity-50 scale-95',
        isSelected
          ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-600 cursor-move'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Selection checkbox */}
        {onToggleSelection && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelection(order.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
        )}

        {/* Drag handle */}
        <button
          ref={drag}
          type="button"
          aria-label={`Drag order ${order.order_number}`}
          className="mt-1 rounded border-0 bg-transparent p-0 text-gray-400 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Order icon */}
        <div className="p-2 bg-purple-100 rounded-lg dark:bg-purple-900/20">
          <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Order details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate dark:text-white">
                {order.order_number}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                {order.customer_name}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={getPriorityColor(order.priority)}>
                {order.priority}
              </Badge>
              <Badge className={`${getStatusColor(order.status)} text-xs`}>
                {order.status}
              </Badge>
            </div>
          </div>

          {/* Order info */}
          <div className="mt-3 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>Value:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(order.value_usd)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Weight:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {order.weight_kg} kg
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Delivery: {formatDate(order.delivery_date)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-500 truncate dark:text-gray-400">
              {order.delivery_address}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
