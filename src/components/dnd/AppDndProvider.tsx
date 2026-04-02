import { ReactNode } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

interface AppDndProviderProps {
  children: ReactNode;
}

/**
 * Shared drag-and-drop provider for route assignment workflows.
 */
export function AppDndProvider({ children }: AppDndProviderProps) {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
