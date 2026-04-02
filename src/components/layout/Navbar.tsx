// Top navbar component
import { useEffect, useState } from "react";
import { Bell, Moon, Sun, LogOut, User, Undo, Redo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useStore } from "../../store/useStore";
import { getInitials, getAvatarColor } from "../../utils/helpers";

/**
 * Top navigation bar with user menu and controls
 */
export function Navbar() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const {
    isDarkMode,
    toggleDarkMode,
    canUndo,
    canRedo,
    undo,
    redo,
    isCollapsed,
  } = useStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.ctrlKey || event.metaKey;
      if (!isModifierPressed) return;

      const target = event.target as HTMLElement | null;
      const isTypingTarget =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (isTypingTarget) return;

      const key = event.key.toLowerCase();

      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        void handleUndo();
      }

      if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        void handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canUndo, canRedo]);

  /**
   * Handle user sign out
   */
  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  /**
   * Handle undo action
   */
  const handleUndo = async () => {
    if (canUndo) {
      await undo();
    }
  };

  /**
   * Handle redo action
   */
  const handleRedo = async () => {
    if (canRedo) {
      await redo();
    }
  };

  return (
    <header
      className="fixed right-0 top-0 z-30 h-20 border-b border-white/30 bg-white/50 backdrop-blur-2xl transition-all duration-300 dark:border-white/10 dark:bg-slate-950/35"
      style={{ left: isCollapsed ? "4rem" : "16rem" }}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left section - Page title and undo/redo */}
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-600 dark:text-sky-300">
              Ops Workspace
            </p>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Fleet Operations
            </h1>
          </div>

          {/* Undo/Redo buttons */}
          <div className="ml-2 hidden items-center gap-2 rounded-full border border-white/50 bg-white/55 px-2 py-1 shadow-sm backdrop-blur md:flex dark:border-white/10 dark:bg-slate-900/45">
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className="rounded-full p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className="rounded-full p-2 transition-all hover:bg-slate-100 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Right section - Actions and user menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-2xl border border-white/45 bg-white/55 p-2.5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Notifications */}
          <button
            className="relative rounded-2xl border border-white/45 bg-white/55 p-2.5 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute w-2 h-2 bg-red-500 rounded-full top-1 right-1"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 rounded-[20px] border border-white/45 bg-white/60 px-3 py-2 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white dark:border-white/10 dark:bg-slate-900/50 dark:hover:bg-slate-900"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-2xl ${getAvatarColor(profile?.full_name || "User")} text-sm font-medium text-white shadow-lg`}
              >
                {getInitials(profile?.full_name || "User")}
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {profile?.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {profile?.role}
                </p>
              </div>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="premium-card premium-card-strong absolute right-0 z-50 mt-3 w-64 rounded-3xl py-2">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {profile?.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {profile?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/dashboard/settings");
                    }}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-gray-700 transition-colors dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <User className="w-4 h-4" />
                    Profile Settings
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="flex items-center w-full gap-3 px-4 py-2 text-sm text-red-600 transition-colors dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
