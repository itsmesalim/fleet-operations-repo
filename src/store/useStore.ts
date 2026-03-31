// Global state management using Zustand
import { create } from 'zustand';
import { Profile } from '../types';

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

interface AuthState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;
  isAuthenticated: boolean;
}

interface NotificationState {
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  }>;
  addNotification: (notification: Omit<NotificationState['notifications'][0], 'id'>) => void;
  removeNotification: (id: string) => void;
}

interface UndoRedoState {
  undoStack: Array<{
    activityLogId: string;
    action: () => Promise<void>;
    description: string;
  }>;
  redoStack: Array<{
    activityLogId: string;
    action: () => Promise<void>;
    description: string;
  }>;
  addUndo: (item: UndoRedoState['undoStack'][0]) => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  clearStacks: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface SidebarState {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

// Combine all state interfaces
interface Store extends ThemeState, AuthState, NotificationState, UndoRedoState, SidebarState {}

// Create the store
export const useStore = create<Store>((set, get) => ({
  // Theme state
  isDarkMode: false,
  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      // Apply theme to document
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      // Store preference in localStorage
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return { isDarkMode: newMode };
    });
  },

  // Auth state
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Notification state
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // Undo/Redo state
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,
  addUndo: (item) =>
    set((state) => ({
      undoStack: [...state.undoStack, item],
      redoStack: [], // Clear redo stack when new action is added
      canUndo: true,
      canRedo: false,
    })),
  undo: async () => {
    const state = get();
    if (state.undoStack.length === 0) return;

    const item = state.undoStack[state.undoStack.length - 1];
    await item.action();

    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, item],
      canUndo: state.undoStack.length > 1,
      canRedo: true,
    });
  },
  redo: async () => {
    const state = get();
    if (state.redoStack.length === 0) return;

    const item = state.redoStack[state.redoStack.length - 1];
    await item.action();

    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, item],
      canUndo: true,
      canRedo: state.redoStack.length > 1,
    });
  },
  clearStacks: () =>
    set({
      undoStack: [],
      redoStack: [],
      canUndo: false,
      canRedo: false,
    }),

  // Sidebar state
  isCollapsed: false,
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));

// Initialize theme from localStorage
const storedTheme = localStorage.getItem('theme');
if (storedTheme === 'dark') {
  document.documentElement.classList.add('dark');
  useStore.setState({ isDarkMode: true });
}
